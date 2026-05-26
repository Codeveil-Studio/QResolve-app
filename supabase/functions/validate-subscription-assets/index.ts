// validate-subscription-assets
//
// Check if an organization's current assets are compatible with their subscription status.
// Returns detailed info about what will happen on downgrade.
//
// Used by:
//   - Settings page before cancellation to warn user
//   - Asset creation form to block if subscription compromised
//   - Dashboard to show warnings

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { getAuthContext, requireOrg, AuthError } from '../_shared/auth.ts'

interface ResponseData {
  org_id: string
  current_subscription: {
    status: string
    plan_key: string | null
    period_end: string | null
    cancelled_at: string | null
  }
  current_state: {
    asset_count: number
    asset_limit_for_current_plan: number
  }
  future_state: {
    status_on_expiry: 'trialing'
    asset_limit_on_expiry: number
    excess_assets_count: number
    will_have_incompatible_assets: boolean
  }
  recommendations: string[]
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const auth = await getAuthContext(req)
    const orgId = requireOrg(auth)

    // 1. Fetch subscription info
    const { data: sub, error: subErr } = await auth.serviceClient
      .from('subscriptions')
      .select('id, status, plan_key, current_period_end, cancelled_at')
      .eq('org_id', orgId)
      .maybeSingle()

    if (subErr) throw subErr
    if (!sub) {
      return jsonResponse({
        org_id: orgId,
        current_subscription: {
          status: 'trialing',
          plan_key: null,
          period_end: null,
          cancelled_at: null,
        },
        current_state: { asset_count: 0, asset_limit_for_current_plan: 5 },
        future_state: {
          status_on_expiry: 'trialing',
          asset_limit_on_expiry: 5,
          excess_assets_count: 0,
          will_have_incompatible_assets: false,
        },
        recommendations: [],
      } as ResponseData)
    }

    // 2. Count assets
    const { count: assetCount, error: countErr } = await auth.serviceClient
      .from('assets')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)

    if (countErr) throw countErr

    // 3. Get current plan limit
    const { data: currentPlan, error: planErr } = await auth.serviceClient
      .from('payment_plans')
      .select('max_assets')
      .eq('plan_key', sub.plan_key || 'trial')
      .eq('is_active', true)
      .maybeSingle()

    if (planErr) throw planErr
    const currentLimit = currentPlan?.max_assets ?? 5

    // 4. Calculate future state
    // When subscription expires/cancels, user goes back to 'trialing' (Trial plan)
    const trialLimit = 5
    const excessCount = Math.max(0, (assetCount ?? 0) - trialLimit)
    const willViolate = excessCount > 0

    // 5. Build recommendations
    const recommendations: string[] = []
    if (sub.status === 'active' && sub.cancelled_at) {
      recommendations.push(
        `Cancellation scheduled for ${new Date(sub.current_period_end ?? '').toLocaleDateString()}`,
      )
    }
    if (willViolate) {
      recommendations.push(
        `You have ${assetCount} assets but Trial plan only allows ${trialLimit}. Delete ${excessCount} asset(s) before cancellation takes effect, or your oldest assets will become read-only.`,
      )
    }
    if (!willViolate && (assetCount ?? 0) > 0) {
      recommendations.push(
        `Your ${assetCount} asset(s) will remain in Trial mode after cancellation, but you won't be able to create new ones.`,
      )
    }

    return jsonResponse({
      org_id: orgId,
      current_subscription: {
        status: sub.status,
        plan_key: sub.plan_key,
        period_end: sub.current_period_end,
        cancelled_at: sub.cancelled_at,
      },
      current_state: {
        asset_count: assetCount ?? 0,
        asset_limit_for_current_plan: currentLimit === null ? 999999 : currentLimit,
      },
      future_state: {
        status_on_expiry: 'trialing',
        asset_limit_on_expiry: trialLimit,
        excess_assets_count: excessCount,
        will_have_incompatible_assets: willViolate,
      },
      recommendations,
    } as ResponseData)
  } catch (err) {
    console.error('validate-subscription-assets error:', err)
    if (err instanceof AuthError) {
      return jsonResponse({ error: err.message }, err.status)
    }
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500,
    )
  }
})
