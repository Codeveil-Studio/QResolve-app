-- Fix RLS policy for organizations to allow creators to view their organization
-- before the membership record is created.

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    public.is_org_member(id) 
    OR 
    owner_id = auth.uid()
  );
