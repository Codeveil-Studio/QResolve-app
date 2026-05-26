import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface SubscriptionAssetValidation {
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
    status_on_expiry: string
    asset_limit_on_expiry: number
    excess_assets_count: number
    will_have_incompatible_assets: boolean
  }
  recommendations: string[]
}

export interface UseSubscriptionValidationResult {
  validation: SubscriptionAssetValidation | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  isDegraded: boolean
  hasWarnings: boolean
}

/**
 * Hook to validate subscription status and asset compatibility.
 * Used in Settings, Assets, and Dashboard pages to show warnings.
 */
export function useSubscriptionValidation(
  orgId: string | null,
): UseSubscriptionValidationResult {
  const [validation, setValidation] = useState<SubscriptionAssetValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!orgId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase.functions.invoke(
        'validate-subscription-assets',
      )

      if (err) throw err
      setValidation(data as SubscriptionAssetValidation)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to validate subscription'
      setError(message)
      console.error('useSubscriptionValidation error:', err)
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => {
    refresh()
  }, [orgId, refresh])

  const isDegraded =
    validation?.current_subscription?.status === 'past_due' ||
    validation?.current_subscription?.status === 'canceled'
  const hasWarnings = validation?.future_state?.will_have_incompatible_assets ?? false

  return {
    validation,
    loading,
    error,
    refresh,
    isDegraded,
    hasWarnings,
  }
}
