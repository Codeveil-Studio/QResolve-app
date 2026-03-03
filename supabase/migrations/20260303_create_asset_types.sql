
-- 1. Create categories table (managed by admin)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories
CREATE POLICY "Everyone can view categories" 
  ON public.categories FOR SELECT 
  USING (true);

-- Only admins can insert/update/delete categories
CREATE POLICY "Admins can manage categories" 
  ON public.categories FOR ALL 
  USING (public.is_system_admin());

-- Seed initial categories
INSERT INTO public.categories (name) VALUES 
('Vending & Automated Retail'),
('EV Charger Maintenance'),
('Lift & Escalator'),
('HVAC & Refrigeration'),
('Commercial Cleaning'),
('Fire Safety Systems'),
('Alarms'),
('Sprinklers'),
('Electrical Services'),
('Plumbing & Water'),
('Security & Access'),
('Solar & Energy')
ON CONFLICT (name) DO NOTHING;

-- 2. Create asset_types table (managed by organization members)
CREATE TABLE public.asset_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS for asset_types
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;

-- Organization members can view their asset types
CREATE POLICY "Members can view asset types" 
  ON public.asset_types FOR SELECT 
  USING (public.is_org_member(org_id));

-- Organization members can create asset types
CREATE POLICY "Members can create asset types" 
  ON public.asset_types FOR INSERT 
  WITH CHECK (public.is_org_member(org_id));

-- Organization members can update their asset types
CREATE POLICY "Members can update asset types" 
  ON public.asset_types FOR UPDATE 
  USING (public.is_org_member(org_id));

-- Organization members can delete their asset types
CREATE POLICY "Members can delete asset types" 
  ON public.asset_types FOR DELETE 
  USING (public.is_org_member(org_id));

-- 3. Update assets table to reference asset_types
ALTER TABLE public.assets 
ADD COLUMN IF NOT EXISTS asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE SET NULL;

-- 4. Grant permissions
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.asset_types TO authenticated;
