-- Razorpay payment integration
-- 1. Add Razorpay-specific columns to subscriptions table
-- 2. Create payment_plans table (admin-managed plan catalog, synced to Razorpay)
-- 3. Seed initial Starter + Pro plans
-- 4. RLS policies for payment_plans

-- ============================================
-- 1. Extend subscriptions table for Razorpay
-- ============================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_key TEXT,
  ADD COLUMN IF NOT EXISTS short_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS last_webhook_event_id TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_sub_id
  ON public.subscriptions(razorpay_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_key
  ON public.subscriptions(plan_key);

COMMENT ON COLUMN public.subscriptions.razorpay_subscription_id IS 'Razorpay subscription ID (sub_XXX). Set when user initiates checkout.';
COMMENT ON COLUMN public.subscriptions.razorpay_customer_id IS 'Razorpay customer ID (cust_XXX).';
COMMENT ON COLUMN public.subscriptions.razorpay_plan_id IS 'Razorpay plan ID this subscription is bound to (plan_XXX).';
COMMENT ON COLUMN public.subscriptions.plan_key IS 'Internal plan key (e.g. starter, pro) — joins to payment_plans.plan_key.';
COMMENT ON COLUMN public.subscriptions.short_url IS 'Razorpay hosted checkout URL — useful for resending payment links.';
COMMENT ON COLUMN public.subscriptions.last_webhook_event_id IS 'Last processed webhook event id, for idempotency.';

-- ============================================
-- 2. Create payment_plans table
-- ============================================

CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT NOT NULL UNIQUE,                  -- e.g. 'starter', 'pro'
  name TEXT NOT NULL,                             -- Display name
  description TEXT,
  amount INTEGER NOT NULL,                        -- Amount in paise (₹4,999 = 499900)
  currency TEXT NOT NULL DEFAULT 'INR',
  interval TEXT NOT NULL DEFAULT 'monthly',       -- 'monthly' or 'yearly'
  interval_count INTEGER NOT NULL DEFAULT 1,      -- Razorpay 'period_count' style
  max_assets INTEGER,                             -- NULL = unlimited
  max_issues INTEGER,                             -- NULL = unlimited
  features JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Array of feature strings
  razorpay_plan_id TEXT,                          -- Set by razorpay-sync-plans function
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_active
  ON public.payment_plans(is_active, sort_order);

CREATE INDEX IF NOT EXISTS idx_payment_plans_razorpay_id
  ON public.payment_plans(razorpay_plan_id);

COMMENT ON TABLE public.payment_plans IS 'Admin-managed plan catalog. Mirrored to Razorpay via the razorpay-sync-plans edge function. The amount field is stored in paise (smallest unit) to match Razorpay.';
COMMENT ON COLUMN public.payment_plans.amount IS 'Amount in paise (multiply rupees by 100). Razorpay requires smallest currency unit.';
COMMENT ON COLUMN public.payment_plans.razorpay_plan_id IS 'The plan_XXX ID assigned by Razorpay after sync. NULL until first sync.';

-- Reuse the existing update_updated_at trigger function (already defined in initial migration)
DROP TRIGGER IF EXISTS update_payment_plans_updated_at ON public.payment_plans;
CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. RLS Policies for payment_plans
-- ============================================

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read active plans (for pricing cards)
DROP POLICY IF EXISTS "Authenticated users can view active plans" ON public.payment_plans;
CREATE POLICY "Authenticated users can view active plans"
  ON public.payment_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Platform admins can view all plans (including inactive)
DROP POLICY IF EXISTS "Admins can view all plans" ON public.payment_plans;
CREATE POLICY "Admins can view all plans"
  ON public.payment_plans FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Only platform admins can insert/update/delete plans
DROP POLICY IF EXISTS "Admins can insert plans" ON public.payment_plans;
CREATE POLICY "Admins can insert plans"
  ON public.payment_plans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update plans" ON public.payment_plans;
CREATE POLICY "Admins can update plans"
  ON public.payment_plans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete plans" ON public.payment_plans;
CREATE POLICY "Admins can delete plans"
  ON public.payment_plans FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- ============================================
-- 4. Seed initial plans (Starter + Pro)
-- Amounts in paise: ₹4,999 = 499900, ₹12,999 = 1299900
-- razorpay_plan_id is left NULL — the sync function fills it on first deploy.
-- ============================================

INSERT INTO public.payment_plans (
  plan_key, name, description, amount, currency, interval, interval_count,
  max_assets, max_issues, features, sort_order
) VALUES
(
  'starter',
  'Starter',
  'For growing teams ready to dispatch and verify',
  499900,
  'INR',
  'monthly',
  1,
  100,
  1000,
  '["QR Reporting","OIC Dashboard","Dispatch","Audit Log","Verified Badge"]'::jsonb,
  10
),
(
  'pro',
  'Pro',
  'For multi-location operators with serious volume',
  1299900,
  'INR',
  'monthly',
  1,
  NULL,
  NULL,
  '["Everything in Starter","Multi-city","Bulk QR","Analytics","Priority Leads"]'::jsonb,
  20
)
ON CONFLICT (plan_key) DO NOTHING;
