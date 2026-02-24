-- Supabase Migration: Allow Admins to read all platform data

-- 1. Create a secure helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE id = auth.uid()
  );
$$;

-- 2. Add SELECT policies for admins to all major tables so the Dashboard can load data
CREATE POLICY "System admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all organizations"
  ON public.organizations FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all assets"
  ON public.assets FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all issues"
  ON public.issues FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all organization memberships"
  ON public.organization_memberships FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all usage history"
  ON public.usage_history FOR SELECT
  USING (public.is_system_admin());

CREATE POLICY "System admins can view all reports"
  ON public.reports FOR SELECT
  USING (public.is_system_admin());
