-- 1. Add is_banned column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. Create a function to delete a user from auth.users (requires security definer)
CREATE OR REPLACE FUNCTION public.delete_user_by_admin(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the executing user is an admin
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete users.';
  END IF;

  -- Delete the user from auth.users
  -- This will cascade to public.profiles and other tables if foreign keys are set correctly with ON DELETE CASCADE
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- 3. Grant execute permission to authenticated users (RLS will handle the rest via the function logic)
GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;

-- 4. Update profiles policy to allow admins to update is_banned
-- Assuming RLS is enabled on profiles
-- We need to ensure admins can update ANY profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- 5. Create a function to delete an organization (and cascade all org data)
CREATE OR REPLACE FUNCTION public.delete_organization_by_admin(target_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete organizations.';
  END IF;

  DELETE FROM public.organizations WHERE id = target_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_organization_by_admin(UUID) TO authenticated;

-- 6. Create a function to delete an asset (and cascade all asset data)
CREATE OR REPLACE FUNCTION public.delete_asset_by_admin(target_asset_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Only admins can delete assets.';
  END IF;

  DELETE FROM public.assets WHERE id = target_asset_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_asset_by_admin(UUID) TO authenticated;

-- 7. Add Foreign Keys for Join Support (Fixes PGRST200 error)
-- These allow PostgREST to join assets/orgs with profiles

-- FIRST: Ensure all referenced users actually exist in profiles to avoid FK violations
DO $$
DECLARE
  missing_id UUID;
BEGIN
  -- Fix missing profiles for assets.created_by
  FOR missing_id IN
    SELECT DISTINCT created_by FROM public.assets
    WHERE created_by NOT IN (SELECT user_id FROM public.profiles)
  LOOP
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (missing_id, 'Unknown User (Orphaned)', 'orphaned_user@system.local')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;

  -- Fix missing profiles for organizations.owner_id
  FOR missing_id IN
    SELECT DISTINCT owner_id FROM public.organizations
    WHERE owner_id NOT IN (SELECT user_id FROM public.profiles)
  LOOP
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (missing_id, 'Unknown Owner (Orphaned)', 'orphaned_owner@system.local')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END $$;

-- NOW: Safe to add constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'assets_created_by_fkey'
  ) THEN
    ALTER TABLE public.assets
    ADD CONSTRAINT assets_created_by_fkey
    FOREIGN KEY (created_by)
    REFERENCES public.profiles(user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'organizations_owner_id_fkey'
  ) THEN
    ALTER TABLE public.organizations
    ADD CONSTRAINT organizations_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES public.profiles(user_id);
  END IF;
END $$;
