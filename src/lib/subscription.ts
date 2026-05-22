import { SubscriptionStatus } from './supabase-types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hardcoded plan fallback. Used by:
 *   - Trial users (no DB plan to point at)
 *   - Older code paths that pass a status string directly
 *
 * The authoritative pricing now lives in the `payment_plans` table.
 * Use `fetchPaymentPlans()` to render pricing cards.
 */
export const PLAN_LIMITS = {
  trial: {
    maxAssets: 5,
    maxIssues: 100,
    features: ['QR Reporting', 'Basic Dashboard', 'Dispatch'],
    price: 0
  },
  starter: {
    maxAssets: 100,
    maxIssues: 1000,
    features: ['QR Reporting', 'OIC Dashboard', 'Dispatch', 'Audit Log', 'Verified Badge'],
    price: 4999
  },
  pro: {
    maxAssets: Infinity,
    maxIssues: Infinity,
    features: ['Everything in Starter', 'Multi-city', 'Bulk QR', 'Analytics', 'Priority Leads'],
    price: 12999
  }
};

export function getPlan(status: SubscriptionStatus | string | null, assetCount: number = 0) {
  if (!status || status === 'trialing') return PLAN_LIMITS.trial;
  if (status === 'active') {
    return PLAN_LIMITS.starter;
  }
  return PLAN_LIMITS.trial;
}

// ============================================
// DB-driven plans (payment_plans table)
// ============================================

export interface PaymentPlan {
  id: string;
  plan_key: string;
  name: string;
  description: string | null;
  amount: number;             // in paise
  currency: string;
  interval: string;
  interval_count: number;
  max_assets: number | null;
  max_issues: number | null;
  features: string[];
  razorpay_plan_id: string | null;
  is_active: boolean;
  sort_order: number;
}

/**
 * Fetch active payment plans from the DB.
 * Returns plans in the admin-defined sort_order.
 */
export async function fetchPaymentPlans(): Promise<PaymentPlan[]> {
  const { data, error } = await supabase
    .from('payment_plans' as never)
    .select('id, plan_key, name, description, amount, currency, interval, interval_count, max_assets, max_issues, features, razorpay_plan_id, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('fetchPaymentPlans error:', error);
    return [];
  }
  return (data ?? []) as unknown as PaymentPlan[];
}

/**
 * Convert paise (smallest unit) to a display-friendly rupee number.
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Format an amount in paise as ₹ display string. Example: 499900 → "₹4,999".
 */
export function formatPlanPrice(amountInPaise: number, currency: string = 'INR'): string {
  const rupees = paiseToRupees(amountInPaise);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(rupees);
}

/**
 * Get custom asset limit for an organization from the account_tiers table
 * Returns null if no custom tier is set
 */
export async function getCustomAssetLimit(orgId: string): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('account_tiers')
      .select('max_assets')
      .eq('org_id', orgId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching custom asset limit:', error);
      return null;
    }

    return data?.max_assets ?? null;
  } catch (err) {
    console.error('Error in getCustomAssetLimit:', err);
    return null;
  }
}

/**
 * Get the effective asset limit for an organization
 * Checks custom limit first, then falls back to plan limit
 */
export async function getEffectiveAssetLimit(
  orgId: string,
  subscriptionStatus: SubscriptionStatus | string | null
): Promise<number> {
  // Check for custom limit first
  const customLimit = await getCustomAssetLimit(orgId);
  if (customLimit !== null) {
    return customLimit;
  }

  // Fall back to plan limit
  const plan = getPlan(subscriptionStatus);
  return plan.maxAssets;
}
