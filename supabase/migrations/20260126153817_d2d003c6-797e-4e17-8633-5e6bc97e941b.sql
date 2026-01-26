-- Create subtypes table for dynamic subtype management
CREATE TABLE public.subtypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
    description TEXT,
    
    -- Colors and palette
    palette_effect VARCHAR(100),
    key_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    avoid_colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Style attributes
    fabrics_perfect TEXT[] DEFAULT ARRAY[]::TEXT[],
    fabrics_good TEXT[] DEFAULT ARRAY[]::TEXT[],
    fabrics_avoid TEXT[] DEFAULT ARRAY[]::TEXT[],
    prints TEXT[] DEFAULT ARRAY[]::TEXT[],
    silhouettes TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Jewelry and accessories
    jewelry_metals TEXT[] DEFAULT ARRAY[]::TEXT[],
    jewelry_stones TEXT[] DEFAULT ARRAY[]::TEXT[],
    jewelry_styles TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Historical and artistic references
    eras TEXT[] DEFAULT ARRAY[]::TEXT[],
    artists TEXT[] DEFAULT ARRAY[]::TEXT[],
    designers TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Makeup
    makeup_lip TEXT[] DEFAULT ARRAY[]::TEXT[],
    makeup_cheek TEXT[] DEFAULT ARRAY[]::TEXT[],
    makeup_eye TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Best for client types
    best_for TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subtypes ENABLE ROW LEVEL SECURITY;

-- Anyone can view subtypes (public reference data)
CREATE POLICY "Anyone can view subtypes"
ON public.subtypes FOR SELECT
USING (true);

-- Authenticated users can manage subtypes (for admin functionality)
CREATE POLICY "Authenticated users can insert subtypes"
ON public.subtypes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update subtypes"
ON public.subtypes FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete subtypes"
ON public.subtypes FOR DELETE
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_subtypes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_subtypes_updated_at
BEFORE UPDATE ON public.subtypes
FOR EACH ROW
EXECUTE FUNCTION public.update_subtypes_updated_at();

-- Create index for common queries
CREATE INDEX idx_subtypes_season ON public.subtypes(season);
CREATE INDEX idx_subtypes_slug ON public.subtypes(slug);