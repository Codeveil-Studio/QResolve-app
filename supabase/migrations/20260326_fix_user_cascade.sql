-- Fix: Handle foreign key dependencies before setting up cascading delete
-- This ensures that when a profile is deleted, its assets and organizations are also removed.

-- 1. Update Assets FK
ALTER TABLE public.assets
DROP CONSTRAINT IF EXISTS assets_created_by_fkey;

ALTER TABLE public.assets
ADD CONSTRAINT assets_created_by_fkey
FOREIGN KEY (created_by)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- 2. Update Organizations FK
ALTER TABLE public.organizations
DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;

ALTER TABLE public.organizations
ADD CONSTRAINT organizations_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;

-- 3. Now handle the profiles -> auth.users link
-- First, remove any orphaned profiles that don't have a corresponding auth user
DELETE FROM public.profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add the foreign key constraint with CASCADE
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;
