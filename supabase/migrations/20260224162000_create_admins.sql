-- Create admins table for superadmin access
CREATE TABLE public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Apply updated_at trigger
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view themselves
CREATE POLICY "Admins can view admins" ON public.admins
  FOR SELECT USING (auth.uid() = id);

-- No insert/update/delete policies needed since admins are managed manually in Supabase Dashboard
