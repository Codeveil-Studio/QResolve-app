-- Add performance and contact fields to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS business_email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trust_score integer DEFAULT 85,
ADD COLUMN IF NOT EXISTS response_time_avg integer DEFAULT 120; -- in minutes

-- Update existing owners to be verified if they have an owner_id
UPDATE public.providers SET is_verified = true WHERE owner_id IS NOT NULL;

-- RLS Policy: Allow owners to update their own provider record
DROP POLICY IF EXISTS "Owners can update their own provider" ON public.providers;
CREATE POLICY "Owners can update their own provider" 
ON public.providers FOR UPDATE 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

