import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  openRazorpayCheckout,
  type RazorpayPaymentSuccess,
} from '@/lib/razorpay'

interface CreateSubResponse {
  subscription_id: string
  razorpay_key_id: string
  plan: { key: string; name: string; amount: number; currency: string }
  short_url: string
  customer: { name: string | null; email: string | null }
}

interface UseRazorpayCheckoutResult {
  /** The plan_key currently being checked out (null if idle). */
  activePlanKey: string | null
  /** True while a cancellation request is in flight. */
  cancelling: boolean
  startCheckout: (planKey: string, options?: StartCheckoutOptions) => Promise<void>
  cancelSubscription: (opts?: { immediate?: boolean }) => Promise<void>
}

interface StartCheckoutOptions {
  onSuccess?: (payment: RazorpayPaymentSuccess) => void
  onDismiss?: () => void
  totalCount?: number
}

/**
 * Razorpay popup theme color — derived from the app's primary token
 * (--primary: 160 84% 39%, Tailwind emerald-500 equivalent).
 * Razorpay's theme.color only accepts hex, so we mirror the design token
 * here. If the brand color changes in index.css, update this value too.
 */
const RAZORPAY_THEME_HEX = '#10b981'

/**
 * Opens the Razorpay checkout for a plan_key.
 * Handles edge-function call + SDK initialisation + toast surfacing.
 */
export function useRazorpayCheckout(): UseRazorpayCheckoutResult {
  const { user, profile, organization } = useAuth()
  const { toast } = useToast()
  const [activePlanKey, setActivePlanKey] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const startCheckout = useCallback(
    async (planKey: string, options: StartCheckoutOptions = {}) => {
      if (!user || !organization) {
        toast({
          variant: 'destructive',
          title: 'Not signed in',
          description: 'Please sign in to subscribe.',
        })
        return
      }

      setActivePlanKey(planKey)
      try {
        const { data, error } = await supabase.functions.invoke<CreateSubResponse>(
          'razorpay-create-subscription',
          {
            body: { plan_key: planKey, total_count: options.totalCount },
          },
        )

        if (error) throw error
        if (!data) throw new Error('Empty response from server')

        await openRazorpayCheckout({
          key: data.razorpay_key_id,
          subscription_id: data.subscription_id,
          name: 'QResolve',
          description: `${data.plan.name} plan`,
          prefill: {
            name: data.customer.name ?? profile?.full_name ?? undefined,
            email: data.customer.email ?? user.email ?? undefined,
          },
          notes: {
            org_id: organization.id,
            plan_key: planKey,
          },
          theme: {
            color: RAZORPAY_THEME_HEX,
          },
          handler: (payment) => {
            toast({
              title: 'Payment authorised',
              description: 'Your subscription is being activated...',
            })
            options.onSuccess?.(payment)
          },
          modal: {
            // Intentionally no "Checkout closed" toast — dismissing the modal
            // is a deliberate user action, not an error worth surfacing.
            ondismiss: () => {
              options.onDismiss?.()
            },
            confirm_close: true,
          },
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to start checkout'
        toast({
          variant: 'destructive',
          title: 'Could not start checkout',
          description: msg,
        })
      } finally {
        setActivePlanKey(null)
      }
    },
    [user, organization, profile, toast],
  )

  const cancelSubscription = useCallback(
    async (opts: { immediate?: boolean } = {}) => {
      setCancelling(true)
      try {
        const { data, error } = await supabase.functions.invoke<{
          status: string
          cancel_at_cycle_end?: boolean
          note?: string
        }>('razorpay-cancel-subscription', {
          body: { immediate: !!opts.immediate },
        })
        if (error) throw error

        // Decide tone based on what actually happened:
        //   - If response says cancel_at_cycle_end=true, the user keeps access until period end
        //   - Otherwise it ended immediately (either user asked, or sub was never charged)
        const endedImmediately = !data?.cancel_at_cycle_end
        toast({
          title: endedImmediately ? 'Subscription cancelled' : 'Cancellation scheduled',
          description: endedImmediately
            ? 'Your subscription has ended.'
            : 'Your plan will remain active until the end of the current billing period.',
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to cancel subscription'
        toast({
          variant: 'destructive',
          title: 'Cancellation failed',
          description: msg,
        })
      } finally {
        setCancelling(false)
      }
    },
    [toast],
  )

  return { activePlanKey, cancelling, startCheckout, cancelSubscription }
}
