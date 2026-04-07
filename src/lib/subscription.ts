import { SubscriptionStatus } from './supabase-types';

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
