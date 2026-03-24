-- Fix: Add cascading foreign key from profiles to auth.users
-- This ensures that when a user is deleted from auth.users, their data in public.profiles is also removed.

-- First, remove any orphaned profiles that don't have a corresponding auth user
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add the foreign key constraint with CASCADE
-- Note: We use user_id because that correlates with auth.users(id)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
