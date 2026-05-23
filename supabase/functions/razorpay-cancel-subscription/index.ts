// razorpay-cancel-subscription
//
// Authenticated org owner/admin can cancel their organization's subscription.
//
// Behaviour by current status:
//   - 'active'    → call Razorpay's cancel API. Webhook reconciles the final state.
//   - 'trialing'  → subscription was created but never charged (Razorpay's "Created"
//                   state). Razorpay won't accept a cancel call for these, so we
//                   just clear the row locally. The orphaned Razorpay subscription
//                   will auto-expire on their side within ~30 days.
//   - 'past_due'  → like 'active', try Razorpay first; fall back to local clear
//                   if Razorpay refuses (e.g. halted before first charge).
//   - 'canceled'  → return 409 (already cancelled).
//
// Special handling: if Razorpay rejects with "no billing cycle" type errors
// (BAD_REQUEST_ERROR on a never-charged subscription), we treat it as a local
// clear instead of an error — same end result for the user.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { getAuthContext, requireOrg, AuthError } from '../_shared/auth.ts'
import { cancelSubscription, RazorpayError } from '../_shared/razorpay.ts'

interface RequestBody {
  immediate?: boolean   // true = cancel right now, false (default) = at cycle end
}

// Razorpay error indicators for a subscription that has never been charged.
// In these cases we just clear our row locally instead of surfacing an error.
function isNoBillingCycleError(err: RazorpayError): boolean {
  const msg = err.message?.toLowerCase() ?? ''
  return (
    msg.includes('no billing cycle') ||
    msg.includes('billing cycle is going on') ||
    msg.includes('cannot be cancelled since')
  )
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

    // For trialing subscriptions, skip Razorpay entirely — they'll reject with
    // "no billing cycle" anyway. Just clear our local row.
    if (sub.status === 'trialing') {
      await auth.serviceClient
        .from('subscriptions')
        .update({
          status: 'canceled',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', sub.id)

      return jsonResponse({
        status: 'canceled',
        cancel_at_cycle_end: false,
        ended_at: Math.floor(Date.now() / 1000),
        note: 'Subscription never had a billing cycle; cancelled locally only.',
      })
    }

    // Active or past_due: try Razorpay's cancel API
    try {
      const result = await cancelSubscription(sub.razorpay_subscription_id, cancelAtCycleEnd)

      // Optimistic local update; the webhook will reconcile shortly.
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
      // Graceful fallback: if Razorpay refuses because there's no billing cycle
      // (rare race — subscription was active in our DB but Razorpay sees it as
      // never-charged), just clear locally.
      if (err instanceof RazorpayError && isNoBillingCycleError(err)) {
        console.warn(
          `Razorpay refused cancel for ${sub.razorpay_subscription_id} (no billing cycle). Clearing local row.`,
        )

        await auth.serviceClient
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('id', sub.id)

        return jsonResponse({
          status: 'canceled',
          cancel_at_cycle_end: false,
          ended_at: Math.floor(Date.now() / 1000),
          note: 'Razorpay subscription had no billing cycle; cleared locally.',
        })
      }
      throw err
    }
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
