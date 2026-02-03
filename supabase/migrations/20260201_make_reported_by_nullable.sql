-- Make reported_by nullable to support anonymous reporting
ALTER TABLE public.issues ALTER COLUMN reported_by DROP NOT NULL;
