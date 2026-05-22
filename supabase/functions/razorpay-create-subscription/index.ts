// razorpay-create-subscription
//
// Authenticated org member calls this with a plan_key. We:
//   1. Look up the plan in payment_plans (must have a razorpay_plan_id)
//   2. Create a Razorpay subscription bound to that plan
//   3. Upsert our subscriptions row in 'created' state
//   4. Return subscription_id + razorpay_key_id so the frontend can open checkout
//
// The DB row stays in 'trialing' status until the webhook reports the first
// successful charge — that's when we flip to 'active'. This guarantees the
// source of truth comes from Razorpay events, not the client.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { getAuthContext, requireOrg, AuthError } from '../_shared/auth.ts'
import {
  createCustomer,
  createSubscription,
  RazorpayError,
} from '../_shared/razorpay.ts'

interface RequestBody {
  plan_key: string
  total_count?: number     // Number of billing cycles. Default 12 (1 year monthly).
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const auth = await getAuthContext(req)
    const orgId = requireOrg(auth)
    const body = (await req.json()) as RequestBody

    if (!body.plan_key) {
      return jsonResponse({ error: 'plan_key is required' }, 400)
    }

    // 1. Fetch plan (must be active and synced to Razorpay)
    const { data: plan, error: planError } = await auth.serviceClient
      .from('payment_plans')
      .select('id, plan_key, name, amount, currency, razorpay_plan_id, is_active')
      .eq('plan_key', body.plan_key)
      .eq('is_active', true)
      .maybeSingle()

    if (planError) throw planError
    if (!plan) {
      return jsonResponse({ error: `Plan '${body.plan_key}' not found or inactive` }, 404)
    }
    if (!plan.razorpay_plan_id) {
      return jsonResponse(
        { error: `Plan '${body.plan_key}' is not yet synced to Razorpay. Run razorpay-sync-plans first.` },
        409,
      )
    }

    // 2. Reuse existing customer if we already created one for this org
    const { data: existingSub } = await auth.serviceClient
      .from('subscriptions')
      .select('razorpay_customer_id, razorpay_subscription_id, status')
      .eq('org_id', orgId)
      .maybeSingle()

    // If an active subscription already exists, refuse — user should cancel first.
    if (
      existingSub?.razorpay_subscription_id &&
      existingSub.status === 'active'
    ) {
      return jsonResponse(
        {
          error: 'An active subscription already exists for this organization. Cancel it before starting a new one.',
        },
        409,
      )
    }

    // Fetch org name + user profile for the customer record
    const [orgRes, profileRes] = await Promise.all([
      auth.serviceClient.from('organizations').select('name').eq('id', orgId).maybeSingle(),
      auth.serviceClient.from('profiles').select('full_name').eq('user_id', auth.userId).maybeSingle(),
    ])

    let customerId = existingSub?.razorpay_customer_id ?? null

    if (!customerId) {
      const customer = await createCustomer({
        name: profileRes.data?.full_name || orgRes.data?.name || 'QResolve User',
        email: auth.email ?? undefined,
        fail_existing: '0',
        notes: {
          org_id: orgId,
          user_id: auth.userId,
        },
      })
      customerId = customer.id
    }

    // 3. Create subscription in Razorpay
    const totalCount = body.total_count ?? 12   // 12 monthly cycles = 1 year
    const subscription = await createSubscription({
      plan_id: plan.razorpay_plan_id,
      customer_id: customerId,
      total_count: totalCount,
      customer_notify: 1,
      notes: {
        org_id: orgId,
        user_id: auth.userId,
        plan_key: plan.plan_key,
      },
    })

    // 4. Upsert into our DB. Status stays 'trialing' — webhook will flip it.
    const { error: upsertError } = await auth.serviceClient
      .from('subscriptions')
      .upsert(
        {
          org_id: orgId,
          razorpay_subscription_id: subscription.id,
          razorpay_customer_id: customerId,
          razorpay_plan_id: plan.razorpay_plan_id,
          plan_key: plan.plan_key,
          short_url: subscription.short_url,
          status: 'trialing',     // Will be flipped to 'active' by webhook on first charge
          payment_provider: 'razorpay',
          cancelled_at: null,
        },
        { onConflict: 'org_id' },
      )

    if (upsertError) throw upsertError

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    if (!razorpayKeyId) {
      throw new Error('RAZORPAY_KEY_ID is not configured')
    }

    return jsonResponse({
      subscription_id: subscription.id,
      razorpay_key_id: razorpayKeyId,
      plan: {
        key: plan.plan_key,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
      },
      short_url: subscription.short_url,
      customer: {
        name: profileRes.data?.full_name ?? null,
        email: auth.email,
      },
    })
  } catch (err) {
    console.error('razorpay-create-subscription error:', err)
    if (err instanceof AuthError) {
      return jsonResponse({ error: err.message }, err.status)
    }
    if (err instanceof RazorpayError) {
      return jsonResponse({ error: err.message, code: err.code }, 502)
    }
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500,
    )
  }
})
