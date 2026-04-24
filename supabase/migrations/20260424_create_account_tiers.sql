-- Create account_tiers table for managing custom asset limits per organization
-- This allows admins to set custom limits for demo/trial accounts

CREATE TABLE public.account_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  max_assets INTEGER NOT NULL DEFAULT 5,
  tier_name TEXT NOT NULL DEFAULT 'custom',
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Create index for faster lookups
CREATE INDEX idx_account_tiers_org ON public.account_tiers(org_id);

-- Add comments
COMMENT ON TABLE public.account_tiers IS 'Stores custom asset limits per organization. Allows admins to override default plan limits for demo/trial accounts.';
COMMENT ON COLUMN public.account_tiers.max_assets IS 'Maximum number of assets allowed for this organization';
COMMENT ON COLUMN public.account_tiers.tier_name IS 'Display name for the tier (e.g., "Demo", "Premium Demo", "Custom")';
COMMENT ON COLUMN public.account_tiers.description IS 'Optional notes about why this custom limit was set';

-- ============================================
-- RLS Policies for account_tiers
-- ============================================

ALTER TABLE public.account_tiers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admins can view all account tiers
CREATE POLICY "Admins can view all account tiers"
  ON public.account_tiers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Policy 2: Admins can insert account tiers
CREATE POLICY "Admins can insert account tiers"
  ON public.account_tiers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Policy 3: Admins can update account tiers
CREATE POLICY "Admins can update account tiers"
  ON public.account_tiers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Policy 4: Admins can delete account tiers
CREATE POLICY "Admins can delete account tiers"
  ON public.account_tiers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Policy 5: Regular users can view their organization's tier (read-only)
CREATE POLICY "Users can view their org tier"
  ON public.account_tiers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE org_id = account_tiers.org_id
      AND user_id = auth.uid()
    )
  );
