-- Enable RLS on providers
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view providers (public directory access)
DROP POLICY IF EXISTS "Anyone can view providers" ON public.providers;
CREATE POLICY "Anyone can view providers" 
ON public.providers FOR SELECT 
USING (true);

-- Allow admins to update providers (for claim approval)
DROP POLICY IF EXISTS "Admins can update providers" ON public.providers;
CREATE POLICY "Admins can update providers" 
ON public.providers FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());
