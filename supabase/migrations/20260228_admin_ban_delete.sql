-- 1. Add is_banned column to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_banned BOOLEAN DEFAULT false;

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
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );
