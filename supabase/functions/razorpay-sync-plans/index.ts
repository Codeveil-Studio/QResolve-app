// razorpay-sync-plans
//
// Admin-only function. Reads all active payment_plans from the DB and ensures
// each has a corresponding Razorpay plan. If a row is missing razorpay_plan_id,
// a new plan is created in Razorpay and the ID is stored back in the DB.
//
// Note: Razorpay plans are immutable once created — you cannot change amount,
// period, or interval after creation. To "change a price" you must create a
// new plan (this function will do that automatically if the amount or interval
// changes on an existing row whose stored razorpay_plan_id no longer matches).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handlePreflight, jsonResponse } from '../_shared/cors.ts'
import { getAuthContext, AuthError } from '../_shared/auth.ts'
import { createPlan, getPlan, RazorpayError } from '../_shared/razorpay.ts'

interface DbPlan {
  id: string
  plan_key: string
  name: string
  description: string | null
  amount: number
  currency: string
  interval: string
  interval_count: number
  razorpay_plan_id: string | null
  is_active: boolean
}

serve(async (req) => {
  const preflight = handlePreflight(req)
  if (preflight) return preflight

  try {
    const auth = await getAuthContext(req)
    if (!auth.isAdmin) {
      return jsonResponse({ error: 'Admin access required' }, 403)
    }

    const { data: plans, error: plansError } = await auth.serviceClient
      .from('payment_plans')
      .select('id, plan_key, name, description, amount, currency, interval, interval_count, razorpay_plan_id, is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (plansError) throw plansError
    if (!plans || plans.length === 0) {
      return jsonResponse({ message: 'No active plans to sync', synced: [] })
    }

    const results: Array<{
      plan_key: string
      razorpay_plan_id: string
      status: 'created' | 'existing' | 'recreated'
    }> = []

    for (const plan of plans as DbPlan[]) {
      // Validate: Razorpay supports daily/weekly/monthly/yearly as 'period'.
      const period = plan.interval as 'daily' | 'weekly' | 'monthly' | 'yearly'
      if (!['daily', 'weekly', 'monthly', 'yearly'].includes(period)) {
        throw new Error(`Plan ${plan.plan_key} has invalid interval: ${plan.interval}`)
      }

      // If the plan already has an ID, verify it still exists in Razorpay.
      if (plan.razorpay_plan_id) {
        try {
          const existing = await getPlan(plan.razorpay_plan_id)
          // Razorpay plans are immutable; if amount/period drift, we recreate.
          if (
            existing.item.amount === plan.amount &&
            existing.period === period &&
            existing.interval === plan.interval_count
          ) {
            results.push({
              plan_key: plan.plan_key,
              razorpay_plan_id: existing.id,
              status: 'existing',
            })
            continue
          }
          // Fall through to recreate with new fields
        } catch (err) {
          // If the plan no longer exists in Razorpay (e.g. switching test↔live),
          // fall through to create a new one.
          if (!(err instanceof RazorpayError) || err.status !== 404) {
            throw err
          }
        }
      }

      const created = await createPlan({
        period,
        interval: plan.interval_count,
        item: {
          name: plan.name,
          amount: plan.amount,
          currency: plan.currency,
          description: plan.description ?? undefined,
        },
        notes: {
          plan_key: plan.plan_key,
          db_id: plan.id,
        },
      })

      const { error: updateError } = await auth.serviceClient
        .from('payment_plans')
        .update({ razorpay_plan_id: created.id })
        .eq('id', plan.id)

      if (updateError) throw updateError

      results.push({
        plan_key: plan.plan_key,
        razorpay_plan_id: created.id,
        status: plan.razorpay_plan_id ? 'recreated' : 'created',
      })
    }

    return jsonResponse({ synced: results })
  } catch (err) {
    console.error('razorpay-sync-plans error:', err)
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
