-- Fix RLS policies for subtypes and face_images tables
-- These policies have misleading names - they say "Authenticated" but don't restrict to authenticated role

-- ============================================
-- FIX SUBTYPES TABLE RLS POLICIES
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert subtypes" ON public.subtypes;
DROP POLICY IF EXISTS "Authenticated users can update subtypes" ON public.subtypes;
DROP POLICY IF EXISTS "Authenticated users can delete subtypes" ON public.subtypes;

-- Recreate with proper TO authenticated restriction
CREATE POLICY "Authenticated users can insert subtypes"
ON public.subtypes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update subtypes"
ON public.subtypes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete subtypes"
ON public.subtypes FOR DELETE
TO authenticated
USING (true);

-- ============================================
-- FIX FACE_IMAGES TABLE RLS POLICIES
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Auth users can insert face images" ON public.face_images;
DROP POLICY IF EXISTS "Auth users can update face images" ON public.face_images;
DROP POLICY IF EXISTS "Auth users can delete face images" ON public.face_images;

-- Recreate with proper TO authenticated restriction
CREATE POLICY "Authenticated users can insert face images"
ON public.face_images FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update face images"
ON public.face_images FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete face images"
ON public.face_images FOR DELETE
TO authenticated
USING (true);