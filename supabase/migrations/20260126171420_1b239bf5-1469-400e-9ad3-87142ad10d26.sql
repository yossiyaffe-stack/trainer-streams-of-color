-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Authenticated users can insert paintings" ON public.paintings;

-- Create a permissive policy that allows anyone to insert paintings
CREATE POLICY "Anyone can insert paintings" 
ON public.paintings 
FOR INSERT 
WITH CHECK (true);

-- Also add delete policy for managing the library
DROP POLICY IF EXISTS "Anyone can delete paintings" ON public.paintings;
CREATE POLICY "Anyone can delete paintings" 
ON public.paintings 
FOR DELETE 
USING (true);