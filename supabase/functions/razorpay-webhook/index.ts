// razorpay-webhook
//
// Public endpoint that receives Razorpay webhook events.
// CRITICAL: signature verification must be the first check — anything below
// it assumes the payload is authentic.
//
// Events handled:
//   - subscription.activated     → flip status to 'active', set period dates
//   - subscription.charged       → renew period dates (recurring charge)
//   - subscription.completed     → all billing cycles done, set 'canceled'
//   - subscription.cancelled     → user/system cancelled, set 'canceled'
//   - subscription.halted        → payments failing, set 'past_due'
//   - subscription.paused        → pause, treat like 'past_due' for access control
//   - subscription.resumed       → back to 'active'
//   - subscription.pending       → first auth failing, set 'past_due'
//   - payment.failed             → log but rely on subscription.* events for status
//
// Idempotency: every event has an `id`. We store last_webhook_event_id on the
// row and skip if we've already processed it.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { verifyWebhookSignature } from '../_shared/razorpay.ts'

interface WebhookPayload {
  entity: string
  account_id: string
  event: string
  contains: string[]
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity }
    payment?: { entity: RazorpayPaymentEntity }
  }
  created_at: number
  id?: string                       // Some payload shapes — fall back to header
}

interface RazorpaySubscriptionEntity {
  id: string
  plan_id: string
  customer_id?: string
  status: string
  current_start: number | null
  current_end: number | null
  ended_at: number | null
  notes?: Record<string, string>
}

interface RazorpayPaymentEntity {
  id: string
  status: string
  amount: number
  currency: string
  error_code?: string
  error_description?: string
  notes?: Record<string, string>
}

// Maps Razorpay subscription statuses to our internal subscription_status enum.
function mapStatus(rzpStatus: string): 'active' | 'past_due' | 'canceled' | 'trialing' {
  switch (rzpStatus) {
    case 'active':
    case 'authenticated':
      return 'active'
    case 'pending':
    case 'halted':
    case 'paused':
      return 'past_due'
    case 'cancelled':
    case 'completed':
    case 'expired':
      return 'canceled'
    case 'created':
    default:
      return 'trialing'
  }
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  // 1. Signature verification — DO NOT touch the body before this.
  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) {
    return jsonResponse({ error: 'Missing signature' }, 400)
  }

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is not configured')
    return jsonResponse({ error: 'Webhook secret not configured' }, 500)
  }

  const rawBody = await req.text()
  const valid = await verifyWebhookSignature(rawBody, signature, webhookSecret)
  if (!valid) {
    console.warn('Webhook signature verification failed')
    return jsonResponse({ error: 'Invalid signature' }, 401)
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody) as WebhookPayload
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }

  // 2. Build service-role client (RLS doesn't apply to Razorpay webhooks)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const eventId = payload.id ?? req.headers.get('x-razorpay-event-id') ?? `${payload.event}-${payload.created_at}`

  try {
    const sub = payload.payload.subscription?.entity
    const pay = payload.payload.payment?.entity

    // 3. Route by event
    if (sub) {
      const newStatus = mapStatus(sub.status)
      const updates: Record<string, unknown> = {
        status: newStatus,
        razorpay_plan_id: sub.plan_id,
        last_webhook_event_id: eventId,
      }

      if (sub.current_start) {
        updates.current_period_start = new Date(sub.current_start * 1000).toISOString()
      }
      if (sub.current_end) {
        updates.current_period_end = new Date(sub.current_end * 1000).toISOString()
      }
      if (sub.status === 'cancelled' || sub.status === 'completed' || sub.status === 'expired') {
        updates.cancelled_at = sub.ended_at
          ? new Date(sub.ended_at * 1000).toISOString()
          : new Date().toISOString()
      }

      // Find the row by razorpay_subscription_id. If not found, fall back to notes.org_id.
      const { data: existing, error: findErr } = await supabase
        .from('subscriptions')
        .select('id, last_webhook_event_id, org_id')
        .eq('razorpay_subscription_id', sub.id)
        .maybeSingle()

      if (findErr) throw findErr

      // Idempotency check
      if (existing?.last_webhook_event_id === eventId) {
        return jsonResponse({ status: 'duplicate', event: payload.event })
      }

      if (existing) {
        const { error: upErr } = await supabase
          .from('subscriptions')
          .update(updates)
          .eq('id', existing.id)
        if (upErr) throw upErr
      } else if (sub.notes?.org_id) {
        // Race with create-subscription: webhook arrived before our row was saved
        const { error: upErr } = await supabase
          .from('subscriptions')
          .upsert(
            {
              org_id: sub.notes.org_id,
              razorpay_subscription_id: sub.id,
              razorpay_customer_id: sub.customer_id ?? null,
              plan_key: sub.notes.plan_key ?? null,
              payment_provider: 'razorpay',
              ...updates,
            },
            { onConflict: 'org_id' },
          )
        if (upErr) throw upErr
      } else {
        console.warn(`Webhook for unknown subscription ${sub.id} with no notes.org_id`)
      }

      console.log(`Processed ${payload.event} for sub ${sub.id} → ${newStatus}`)
    } else if (pay) {
      // For raw payment events (not tied to a subscription), just log.
      console.log(`Payment event ${payload.event} for payment ${pay.id} status=${pay.status}`)
    }

    return jsonResponse({ status: 'ok', event: payload.event })
  } catch (err) {
    console.error('razorpay-webhook error:', err)
    // Return 500 so Razorpay retries.
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500,
    )
  }
})
