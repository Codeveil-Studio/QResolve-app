-- Allow public users (anon) to insert into issues table
CREATE POLICY "Allow public reporting"
ON public.issues
FOR INSERT
TO anon
WITH CHECK (true);

-- Ensure the anon role has permission to insert
GRANT INSERT ON public.issues TO anon;

-- Allow public to view assets (needed to verify asset ID and get org_id)
CREATE POLICY "Allow public view assets"
ON public.assets
FOR SELECT
TO anon
USING (true);

GRANT SELECT ON public.assets TO anon;
