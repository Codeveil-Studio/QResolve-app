ALTER TABLE public.asset_types
  ADD COLUMN IF NOT EXISTS issue_types TEXT[] DEFAULT '{}';
