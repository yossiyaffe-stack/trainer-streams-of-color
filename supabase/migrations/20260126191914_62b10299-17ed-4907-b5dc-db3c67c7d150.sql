-- Add RLS policy to allow uploads to the paintings storage bucket
CREATE POLICY "Anyone can upload paintings"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'paintings');

CREATE POLICY "Anyone can update paintings"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'paintings');

CREATE POLICY "Anyone can delete paintings"
ON storage.objects
FOR DELETE
USING (bucket_id = 'paintings');