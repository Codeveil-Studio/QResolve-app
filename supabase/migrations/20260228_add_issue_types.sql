
-- 1. Add issue_types to assets table (array of text)
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS issue_types TEXT[] DEFAULT '{}';

-- 2. Add issue_tags to issues table (array of text, to store selected tags)
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS issue_tags TEXT[] DEFAULT '{}';

-- 3. Update issue_types for existing assets if needed (optional)
-- For example, default to empty array or some generic types
UPDATE public.assets SET issue_types = ARRAY['General Issue', 'Maintenance'] WHERE issue_types IS NULL;
