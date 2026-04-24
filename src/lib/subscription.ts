import { SubscriptionStatus } from './supabase-types';
import { supabase } from '@/integrations/supabase/client';

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
    // We might need a 'plan_type' column in the database eventually.
    // For now, let's assume 'active' is Starter unless specified.
    return PLAN_LIMITS.starter;
  }
  return PLAN_LIMITS.trial;
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
