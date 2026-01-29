-- Fix permissive storage policies that incorrectly target {public} role instead of {authenticated}
-- This addresses the storage_buckets_public security finding

-- ============================================
-- FIX PAINTINGS BUCKET STORAGE POLICIES
-- ============================================

-- Drop the dangerous policies that allow anyone (public role) to write/delete
DROP POLICY IF EXISTS "Anyone can upload paintings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update paintings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete paintings" ON storage.objects;

-- ============================================
-- FIX FACE-IMAGES BUCKET STORAGE POLICIES
-- ============================================

-- Drop the mislabeled policies that say "Auth users" but actually target public role
DROP POLICY IF EXISTS "Auth users can upload face images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update face images storage" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete face images storage" ON storage.objects;

-- Create properly restricted policies for face-images bucket
CREATE POLICY "Authenticated users can upload face images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'face-images');

CREATE POLICY "Authenticated users can update face images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'face-images');

CREATE POLICY "Authenticated users can delete face images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'face-images');