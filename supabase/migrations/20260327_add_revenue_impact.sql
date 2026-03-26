-- Add revenue_impact column to issues table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'revenue_impact_level') THEN
        CREATE TYPE public.revenue_impact_level AS ENUM ('high', 'low');
    END IF;
END $$;

ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS revenue_impact public.revenue_impact_level DEFAULT 'low';

-- Update RLS or other logic if needed
-- (Assuming standard organization-based RLS is already active)
