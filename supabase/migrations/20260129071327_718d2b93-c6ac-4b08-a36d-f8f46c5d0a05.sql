-- QResolve Database Schema
-- Multi-tenant Asset Management & Issue Tracking System

-- 1. Create role enum for organization membership
CREATE TYPE public.org_role AS ENUM ('owner', 'admin', 'member');

-- 2. Create asset status enum
CREATE TYPE public.asset_status AS ENUM ('active', 'inactive', 'maintenance', 'retired');

-- 3. Create issue status enum
CREATE TYPE public.issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 4. Create issue priority enum
CREATE TYPE public.issue_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- 5. Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');

-- ============================================
-- BASE TABLES
-- ============================================

-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization Memberships table (links users to organizations)
CREATE TABLE public.organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- User Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table (Stripe billing per org)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  current_asset_count INTEGER NOT NULL DEFAULT 0,
  stripe_base_price DECIMAL(10,2),
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage History table
CREATE TABLE public.usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_count INTEGER NOT NULL,
  change_amount INTEGER NOT NULL DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location TEXT,
  status public.asset_status NOT NULL DEFAULT 'active',
  qr_code TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.issue_status NOT NULL DEFAULT 'open',
  priority public.issue_priority NOT NULL DEFAULT 'medium',
  reported_by UUID NOT NULL,
  assigned_to UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports table (for AI-generated reports)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  report_type TEXT,
  generated_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_org_memberships_user ON public.organization_memberships(user_id);
CREATE INDEX idx_org_memberships_org ON public.organization_memberships(org_id);
CREATE INDEX idx_assets_org ON public.assets(org_id);
CREATE INDEX idx_assets_status ON public.assets(status);
CREATE INDEX idx_issues_org ON public.issues(org_id);
CREATE INDEX idx_issues_status ON public.issues(status);
CREATE INDEX idx_issues_asset ON public.issues(asset_id);
CREATE INDEX idx_profiles_user ON public.profiles(user_id);
CREATE INDEX idx_usage_history_org ON public.usage_history(org_id);

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================

-- Check if user is a member of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE org_id = _org_id AND user_id = auth.uid()
  )
$$;

-- Check if user is an admin of an organization
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE org_id = _org_id 
    AND user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
$$;

-- Check if user is the owner of an organization
CREATE OR REPLACE FUNCTION public.is_org_owner(_org_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE org_id = _org_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
$$;

-- Get user's current organization ID
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.organization_memberships
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_memberships_updated_at BEFORE UPDATE ON public.organization_memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Organizations Policies
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.is_org_member(id));

CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (public.is_org_owner(id));

CREATE POLICY "Authenticated users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organization"
  ON public.organizations FOR DELETE
  USING (public.is_org_owner(id));

-- Organization Memberships Policies
CREATE POLICY "Members can view org memberships"
  ON public.organization_memberships FOR SELECT
  USING (public.is_org_member(org_id));

CREATE POLICY "Admins can manage memberships"
  ON public.organization_memberships FOR INSERT
  WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Admins can update memberships"
  ON public.organization_memberships FOR UPDATE
  USING (public.is_org_admin(org_id));

CREATE POLICY "Admins can delete memberships"
  ON public.organization_memberships FOR DELETE
  USING (public.is_org_admin(org_id));

-- Allow owner to create their own membership on org creation
CREATE POLICY "Users can create their own membership as owner"
  ON public.organization_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- Profiles Policies
CREATE POLICY "Users can view profiles in their org"
  ON public.profiles FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.organization_memberships om1
      JOIN public.organization_memberships om2 ON om1.org_id = om2.org_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.user_id
    )
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Subscriptions Policies
CREATE POLICY "Admins can view subscription"
  ON public.subscriptions FOR SELECT
  USING (public.is_org_admin(org_id));

CREATE POLICY "Admins can manage subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Admins can update subscription"
  ON public.subscriptions FOR UPDATE
  USING (public.is_org_admin(org_id));

-- Usage History Policies
CREATE POLICY "Admins can view usage history"
  ON public.usage_history FOR SELECT
  USING (public.is_org_admin(org_id));

-- Assets Policies
CREATE POLICY "Members can view assets"
  ON public.assets FOR SELECT
  USING (public.is_org_member(org_id));

CREATE POLICY "Members can create assets"
  ON public.assets FOR INSERT
  WITH CHECK (public.is_org_member(org_id) AND created_by = auth.uid());

CREATE POLICY "Members can update assets"
  ON public.assets FOR UPDATE
  USING (public.is_org_member(org_id));

CREATE POLICY "Admins can delete assets"
  ON public.assets FOR DELETE
  USING (public.is_org_admin(org_id));

-- Issues Policies
CREATE POLICY "Members can view issues"
  ON public.issues FOR SELECT
  USING (public.is_org_member(org_id));

CREATE POLICY "Members can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (public.is_org_member(org_id) AND reported_by = auth.uid());

CREATE POLICY "Members can update issues"
  ON public.issues FOR UPDATE
  USING (public.is_org_member(org_id));

CREATE POLICY "Admins can delete issues"
  ON public.issues FOR DELETE
  USING (public.is_org_admin(org_id));

-- Reports Policies
CREATE POLICY "Members can view reports"
  ON public.reports FOR SELECT
  USING (public.is_org_member(org_id));

CREATE POLICY "Members can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (public.is_org_member(org_id) AND generated_by = auth.uid());