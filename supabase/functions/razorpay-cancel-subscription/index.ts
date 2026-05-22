// razorpay-cancel-subscription
//
// Authenticated org owner/admin can cancel their organization's subscription.
// We call Razorpay's cancel API; the webhook will reflect the final state.
// To avoid the user losing access mid-period, cancel_at_cycle_end defaults to true.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { getAuthContext, requireOrg, AuthError } from '../_shared/auth.ts'
import { cancelSubscription, RazorpayError } from '../_shared/razorpay.ts'

interface RequestBody {
  immediate?: boolean   // true = cancel right now, false (default) = at cycle end
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

    // Only owners/admins can cancel — check org membership role
    const { data: membership } = await auth.serviceClient
      .from('organization_memberships')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', auth.userId)
      .maybeSingle()

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return jsonResponse(
        { error: 'Only organization owners or admins can cancel subscriptions' },
        403,
      )
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody
    const cancelAtCycleEnd = !body.immediate

    const { data: sub, error: subErr } = await auth.serviceClient
      .from('subscriptions')
      .select('id, razorpay_subscription_id, status')
      .eq('org_id', orgId)
      .maybeSingle()

    if (subErr) throw subErr
    if (!sub?.razorpay_subscription_id) {
      return jsonResponse({ error: 'No subscription to cancel' }, 404)
    }
    if (sub.status === 'canceled') {
      return jsonResponse({ error: 'Subscription is already canceled' }, 409)
    }

    const result = await cancelSubscription(sub.razorpay_subscription_id, cancelAtCycleEnd)

    // We do an optimistic local update; the webhook will reconcile shortly.
    await auth.serviceClient
      .from('subscriptions')
      .update({
        cancelled_at: new Date().toISOString(),
        // Only flip status if immediate cancel
        ...(body.immediate ? { status: 'canceled' } : {}),
      })
      .eq('id', sub.id)

    return jsonResponse({
      status: result.status,
      cancel_at_cycle_end: cancelAtCycleEnd,
      ended_at: result.ended_at,
    })
  } catch (err) {
    console.error('razorpay-cancel-subscription error:', err)
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
