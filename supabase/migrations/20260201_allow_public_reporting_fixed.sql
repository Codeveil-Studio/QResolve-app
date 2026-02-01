-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public reporting" ON public.issues;
DROP POLICY IF EXISTS "Allow public view assets" ON public.assets;

-- 1. Allow EVERYONE (public = anon + authenticated) to insert into issues table
-- This fixes the issue where a logged-in user (authenticated) who is NOT a member of the org
-- would fail the "Members only" policy and not match the "anon only" policy.
CREATE POLICY "Allow public reporting"
ON public.issues
FOR INSERT
TO public
WITH CHECK (true);

-- 2. Ensure both roles have permission to insert
GRANT INSERT ON public.issues TO anon;
GRANT INSERT ON public.issues TO authenticated;

-- 3. Allow EVERYONE to view assets (needed to verify asset ID and get org_id)
CREATE POLICY "Allow public view assets"
ON public.assets
FOR SELECT
TO public
USING (true);

GRANT SELECT ON public.assets TO anon;
GRANT SELECT ON public.assets TO authenticated;