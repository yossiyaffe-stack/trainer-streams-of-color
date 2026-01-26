-- ============================================================================
-- STREAMS OF COLOR - PAINTING LIBRARY SCHEMA
-- ============================================================================

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PAINTINGS TABLE
-- =============================================================================

CREATE TABLE public.paintings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Image
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    original_filename VARCHAR(255),
    
    -- Basic Info (AI-suggested, human-corrected)
    title VARCHAR(255),
    artist VARCHAR(255),
    era VARCHAR(100),
    year_approximate VARCHAR(50),
    
    -- AI Analysis Results
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    
    -- Human Corrections (override AI)
    corrections JSONB DEFAULT '{}'::jsonb,
    
    -- Final Categorization (merged AI + corrections)
    fabrics TEXT[],
    silhouette VARCHAR(100),
    neckline VARCHAR(100),
    sleeves VARCHAR(100),
    color_mood VARCHAR(100),
    palette_effect VARCHAR(255),
    prints_patterns TEXT[],
    jewelry_types TEXT[],
    mood_primary VARCHAR(100),
    mood_secondary TEXT[],
    suggested_season VARCHAR(50),
    
    -- Searchable tags
    tags TEXT[],
    
    -- Usage
    best_for TEXT[],
    client_talking_points TEXT[],
    
    -- Notes
    notes TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Indexes for filtering
CREATE INDEX idx_paintings_fabrics ON public.paintings USING GIN(fabrics);
CREATE INDEX idx_paintings_silhouette ON public.paintings(silhouette);
CREATE INDEX idx_paintings_neckline ON public.paintings(neckline);
CREATE INDEX idx_paintings_era ON public.paintings(era);
CREATE INDEX idx_paintings_mood ON public.paintings(mood_primary);
CREATE INDEX idx_paintings_season ON public.paintings(suggested_season);
CREATE INDEX idx_paintings_palette_effect ON public.paintings(palette_effect);
CREATE INDEX idx_paintings_tags ON public.paintings USING GIN(tags);
CREATE INDEX idx_paintings_status ON public.paintings(status);

-- Enable RLS
ALTER TABLE public.paintings ENABLE ROW LEVEL SECURITY;

-- Public read access (paintings library is public reference)
CREATE POLICY "Anyone can view paintings" 
ON public.paintings 
FOR SELECT 
USING (true);

-- Authenticated users can insert paintings
CREATE POLICY "Authenticated users can insert paintings" 
ON public.paintings 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Authenticated users can update paintings
CREATE POLICY "Authenticated users can update paintings" 
ON public.paintings 
FOR UPDATE 
TO authenticated 
USING (true);

-- =============================================================================
-- STORAGE BUCKET FOR PAINTING IMAGES
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('paintings', 'paintings', true);

-- Storage policies
CREATE POLICY "Anyone can view painting images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'paintings');

CREATE POLICY "Authenticated users can upload painting images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'paintings');

CREATE POLICY "Authenticated users can update painting images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'paintings');

CREATE POLICY "Authenticated users can delete painting images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'paintings');

-- =============================================================================
-- FUNCTION: Auto-generate tags from all categories
-- =============================================================================

CREATE OR REPLACE FUNCTION public.generate_painting_tags()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tags := ARRAY(
        SELECT DISTINCT unnest(
            COALESCE(NEW.fabrics, ARRAY[]::TEXT[]) ||
            ARRAY[NEW.silhouette] ||
            ARRAY[NEW.neckline] ||
            ARRAY[NEW.sleeves] ||
            ARRAY[NEW.color_mood] ||
            ARRAY[NEW.palette_effect] ||
            COALESCE(NEW.prints_patterns, ARRAY[]::TEXT[]) ||
            COALESCE(NEW.jewelry_types, ARRAY[]::TEXT[]) ||
            ARRAY[NEW.mood_primary] ||
            COALESCE(NEW.mood_secondary, ARRAY[]::TEXT[]) ||
            ARRAY[NEW.suggested_season] ||
            ARRAY[NEW.artist] ||
            ARRAY[NEW.era]
        )
        WHERE unnest IS NOT NULL AND unnest != ''
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_generate_painting_tags
BEFORE INSERT OR UPDATE ON public.paintings
FOR EACH ROW
EXECUTE FUNCTION public.generate_painting_tags();