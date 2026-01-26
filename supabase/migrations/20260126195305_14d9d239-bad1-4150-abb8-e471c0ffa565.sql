-- Fix palette not updating for unauthenticated users by allowing UPDATE on paintings
-- (The table already allows public INSERT/SELECT/DELETE, so UPDATE should match that model.)

DROP POLICY IF EXISTS "Authenticated users can update paintings" ON public.paintings;

CREATE POLICY "Anyone can update paintings"
ON public.paintings
FOR UPDATE
USING (true)
WITH CHECK (true);