-- Create profile_claims table
CREATE TABLE IF NOT EXISTS public.profile_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add owner_id to providers table
ALTER TABLE public.providers 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS on profile_claims
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;

-- Policies for profile_claims
-- Requesters can see their own claims
CREATE POLICY "Users can view their own claims" 
ON public.profile_claims FOR SELECT 
USING (auth.uid() = user_id);

-- Requesters can insert their own claims
CREATE POLICY "Users can insert their own claims" 
ON public.profile_claims FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all claims (assuming admins table exists from migrations)
CREATE POLICY "Admins can view all claims" 
ON public.profile_claims FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));

-- Admins can update status
CREATE POLICY "Admins can update claim status" 
ON public.profile_claims FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid()));
