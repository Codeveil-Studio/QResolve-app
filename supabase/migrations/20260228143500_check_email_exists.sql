-- Secure function to check if an email exists in auth.users
-- Uses SECURITY DEFINER to bypass RLS (only returns true/false, no data leak)
CREATE OR REPLACE FUNCTION public.check_email_exists(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = lower(target_email)
  );
$$;
