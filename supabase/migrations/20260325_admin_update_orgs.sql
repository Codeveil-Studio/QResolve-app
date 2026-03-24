-- Allow system admins to update organizations (for name sync on claim approval)
DROP POLICY IF EXISTS "System admins can update all organizations" ON public.organizations;
CREATE POLICY "System admins can update all organizations" 
ON public.organizations FOR UPDATE 
USING (public.is_system_admin())
WITH CHECK (public.is_system_admin());
