-- Add subscription status enforcement for assets
-- Prevents asset operations when subscription is past_due or canceled

-- ============================================
-- Enhanced Assets Policies with Subscription Check
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Members can create assets" ON public.assets;
DROP POLICY IF EXISTS "Members can update assets" ON public.assets;

-- New policies that check subscription status
CREATE POLICY "Members can create assets if subscription active"
  ON public.assets FOR INSERT
  WITH CHECK (
    public.is_org_member(org_id) 
    AND created_by = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE org_id = assets.org_id
      AND status IN ('past_due', 'canceled')
    )
  );

CREATE POLICY "Members can update assets if subscription active"
  ON public.assets FOR UPDATE
  USING (
    public.is_org_member(org_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE org_id = assets.org_id
      AND status IN ('past_due', 'canceled')
    )
  );

-- Keep delete policy as-is (admins can always delete)

-- ============================================
-- Add function to check subscription compatibility
-- ============================================

CREATE OR REPLACE FUNCTION public.check_subscription_downgrade_compatibility(
  _org_id UUID,
  _new_plan_status TEXT
)
RETURNS TABLE (
  is_compatible BOOLEAN,
  current_asset_count INTEGER,
  allowed_limit INTEGER,
  excess_count INTEGER,
  will_violate BOOLEAN
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH asset_count AS (
    SELECT COUNT(*) as count FROM public.assets WHERE org_id = _org_id
  ),
  plan_limit AS (
    SELECT 
      CASE 
        WHEN _new_plan_status = 'trialing' THEN 5
        WHEN _new_plan_status = 'active' THEN COALESCE(
          (SELECT max_assets FROM payment_plans 
           WHERE plan_key = (SELECT plan_key FROM subscriptions WHERE org_id = _org_id)
           AND is_active = true),
          100
        )
        ELSE NULL
      END as limit
  )
  SELECT
    ac.count <= COALESCE(pl.limit, 999999) as is_compatible,
    ac.count::INTEGER as current_asset_count,
    COALESCE(pl.limit, 999999)::INTEGER as allowed_limit,
    GREATEST(0, ac.count - COALESCE(pl.limit, 999999))::INTEGER as excess_count,
    ac.count > COALESCE(pl.limit, 999999) as will_violate
  FROM asset_count ac, plan_limit pl;
$$;

-- ============================================
-- Add column to track if user was warned about downgrade
-- ============================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS downgrade_warning_acknowledged BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.subscriptions.downgrade_warning_acknowledged IS 'Whether user acknowledged the asset incompatibility warning when scheduling cancellation.';
