-- ============================================================
-- STREAMS OF COLOR - Face Training Pipeline Schema
-- ============================================================

-- ENUM TYPES
CREATE TYPE undertone_type AS ENUM ('warm', 'cool', 'neutral', 'warm-neutral', 'cool-neutral');
CREATE TYPE depth_type AS ENUM ('light', 'light-medium', 'medium', 'medium-deep', 'deep');
CREATE TYPE contrast_level_type AS ENUM ('low', 'low-medium', 'medium', 'medium-high', 'high');
CREATE TYPE season_type AS ENUM ('spring', 'summer', 'autumn', 'winter');

CREATE TYPE data_source AS ENUM ('celeba_hq', 'ffhq', 'client_photo', 'training_upload', 'user_submission');

CREATE TYPE label_status AS ENUM (
    'unlabeled', 'ai_predicted', 'needs_review',
    'manually_labeled', 'expert_verified', 'nechama_verified'
);

CREATE TYPE eye_color_name AS ENUM (
    'dark_brown', 'chocolate_brown', 'golden_brown', 'amber', 'topaz', 'honey',
    'emerald', 'jade', 'olive', 'sage', 'moss', 'teal',
    'sapphire', 'sky_blue', 'steel_blue', 'periwinkle', 'navy',
    'charcoal', 'silver', 'slate', 'pewter',
    'hazel_green', 'hazel_brown', 'hazel_gold',
    'black', 'violet', 'mixed'
);

CREATE TYPE hair_color_name AS ENUM (
    'blue_black', 'soft_black', 'black_brown',
    'espresso', 'dark_chocolate', 'milk_chocolate', 'chestnut', 'walnut',
    'caramel', 'toffee', 'golden_brown', 'mousy_brown',
    'auburn', 'copper', 'ginger', 'strawberry', 'burgundy', 'mahogany',
    'platinum', 'ash_blonde', 'golden_blonde', 'honey_blonde',
    'champagne', 'dirty_blonde', 'dark_blonde',
    'silver', 'pewter', 'salt_pepper', 'white', 'steel_gray'
);

CREATE TYPE skin_tone_name AS ENUM (
    'porcelain', 'ivory', 'alabaster', 'fair',
    'peaches_cream', 'cream', 'light_beige', 'rose_beige',
    'warm_beige', 'golden_beige', 'nude', 'sand',
    'honey', 'caramel', 'olive', 'tan', 'bronze',
    'amber', 'cinnamon', 'toffee', 'mocha',
    'espresso', 'mahogany', 'cocoa', 'ebony', 'onyx'
);

-- ============================================================
-- FACE IMAGES TABLE
-- ============================================================
CREATE TABLE public.face_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source data_source NOT NULL DEFAULT 'training_upload',
    source_id VARCHAR(100),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_filename VARCHAR(255),
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    is_good_lighting BOOLEAN DEFAULT true,
    is_neutral_background BOOLEAN DEFAULT true,
    is_no_makeup BOOLEAN,
    is_natural_hair_color BOOLEAN,
    quality_score FLOAT,
    celeba_attributes JSONB,
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COLOR LABELS TABLE (main training data)
-- ============================================================
CREATE TABLE public.color_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    face_image_id UUID NOT NULL REFERENCES public.face_images(id) ON DELETE CASCADE,
    
    -- Skin colors
    skin_hex VARCHAR(7),
    skin_rgb INTEGER[],
    skin_tone_name skin_tone_name,
    skin_region_samples JSONB,
    
    -- Eye colors
    eye_hex VARCHAR(7),
    eye_rgb INTEGER[],
    eye_color_name eye_color_name,
    eye_details JSONB,
    
    -- Hair colors
    hair_hex VARCHAR(7),
    hair_rgb INTEGER[],
    hair_color_name hair_color_name,
    hair_details JSONB,
    
    -- Lip colors
    lip_hex VARCHAR(7),
    lip_rgb INTEGER[],
    
    -- Analysis
    undertone undertone_type,
    undertone_confidence FLOAT,
    undertone_indicators JSONB,
    
    depth depth_type,
    depth_value FLOAT,
    
    contrast_level contrast_level_type,
    contrast_value FLOAT,
    contrast_details JSONB,
    
    -- AI Prediction
    ai_predicted_subtype VARCHAR(100),
    ai_confidence FLOAT,
    ai_alternatives JSONB,
    ai_reasoning TEXT,
    
    -- Human Confirmation
    confirmed_subtype VARCHAR(100),
    confirmed_season season_type,
    
    -- Workflow
    label_status label_status DEFAULT 'unlabeled',
    labeled_by VARCHAR(100),
    labeled_at TIMESTAMPTZ,
    verified_by VARCHAR(100),
    verified_at TIMESTAMPTZ,
    had_disagreement BOOLEAN DEFAULT false,
    disagreement_notes TEXT,
    notes TEXT,
    is_good_for_training BOOLEAN DEFAULT true,
    exclude_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(face_image_id)
);

-- ============================================================
-- TRAINING BATCHES
-- ============================================================
CREATE TABLE public.training_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose VARCHAR(100),
    target_subtypes TEXT[],
    total_images INTEGER DEFAULT 0,
    labeled_count INTEGER DEFAULT 0,
    verified_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.batch_images (
    batch_id UUID REFERENCES public.training_batches(id) ON DELETE CASCADE,
    face_image_id UUID REFERENCES public.face_images(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (batch_id, face_image_id)
);

-- ============================================================
-- MODEL RUNS (for tracking training iterations)
-- ============================================================
CREATE TABLE public.model_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(50),
    architecture TEXT,
    config JSONB,
    training_count INTEGER,
    validation_count INTEGER,
    subtypes_trained TEXT[],
    overall_accuracy FLOAT,
    per_subtype_accuracy JSONB,
    confusion_matrix JSONB,
    model_path TEXT,
    weights_path TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- VOCABULARY TERMS
-- ============================================================
CREATE TABLE public.vocabulary_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    term VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    hex_code VARCHAR(7),
    rgb_values INTEGER[],
    related_terms TEXT[],
    parent_term VARCHAR(100),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(category, term)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_face_images_source ON public.face_images(source);
CREATE INDEX idx_face_images_quality ON public.face_images(quality_score) WHERE quality_score IS NOT NULL;
CREATE INDEX idx_face_images_unprocessed ON public.face_images(id) WHERE NOT is_processed;

CREATE INDEX idx_color_labels_status ON public.color_labels(label_status);
CREATE INDEX idx_color_labels_subtype ON public.color_labels(confirmed_subtype);
CREATE INDEX idx_color_labels_season ON public.color_labels(confirmed_season);
CREATE INDEX idx_color_labels_undertone ON public.color_labels(undertone);
CREATE INDEX idx_color_labels_training ON public.color_labels(face_image_id) 
    WHERE is_good_for_training AND confirmed_subtype IS NOT NULL;

CREATE INDEX idx_vocabulary_category ON public.vocabulary_terms(category);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update timestamps function
CREATE OR REPLACE FUNCTION public.update_face_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER face_images_updated_at 
    BEFORE UPDATE ON public.face_images 
    FOR EACH ROW EXECUTE FUNCTION public.update_face_updated_at();

CREATE TRIGGER color_labels_updated_at 
    BEFORE UPDATE ON public.color_labels 
    FOR EACH ROW EXECUTE FUNCTION public.update_face_updated_at();

CREATE TRIGGER training_batches_updated_at 
    BEFORE UPDATE ON public.training_batches 
    FOR EACH ROW EXECUTE FUNCTION public.update_face_updated_at();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW public.v_training_data AS
SELECT 
    fi.id, fi.storage_path, fi.thumbnail_path, fi.source, fi.quality_score,
    cl.skin_hex, cl.skin_tone_name, cl.eye_hex, cl.eye_color_name,
    cl.hair_hex, cl.hair_color_name, cl.undertone, cl.depth, cl.contrast_level,
    cl.confirmed_subtype, cl.confirmed_season, cl.ai_predicted_subtype,
    cl.ai_confidence, cl.label_status, cl.is_good_for_training
FROM public.face_images fi
JOIN public.color_labels cl ON cl.face_image_id = fi.id
WHERE cl.is_good_for_training = true;

CREATE VIEW public.v_labeling_queue AS
SELECT 
    fi.id, fi.storage_path, fi.thumbnail_path, fi.source_id, fi.quality_score,
    cl.ai_predicted_subtype, cl.ai_confidence, cl.ai_alternatives, cl.label_status
FROM public.face_images fi
LEFT JOIN public.color_labels cl ON cl.face_image_id = fi.id
WHERE cl.label_status IN ('unlabeled', 'ai_predicted', 'needs_review')
ORDER BY cl.ai_confidence DESC NULLS LAST, fi.created_at;

CREATE VIEW public.v_dataset_stats AS
SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE cl.label_status = 'unlabeled') as unlabeled,
    COUNT(*) FILTER (WHERE cl.label_status = 'ai_predicted') as ai_predicted,
    COUNT(*) FILTER (WHERE cl.label_status = 'needs_review') as needs_review,
    COUNT(*) FILTER (WHERE cl.label_status = 'manually_labeled') as manually_labeled,
    COUNT(*) FILTER (WHERE cl.label_status = 'expert_verified') as expert_verified,
    COUNT(*) FILTER (WHERE cl.label_status = 'nechama_verified') as nechama_verified,
    COUNT(*) FILTER (WHERE cl.confirmed_subtype IS NOT NULL) as has_confirmed_subtype,
    COUNT(*) FILTER (WHERE cl.is_good_for_training) as training_ready
FROM public.face_images fi
LEFT JOIN public.color_labels cl ON cl.face_image_id = fi.id;

CREATE VIEW public.v_subtype_distribution AS
SELECT 
    confirmed_subtype, confirmed_season, COUNT(*) as count,
    COUNT(*) FILTER (WHERE label_status = 'nechama_verified') as nechama_verified_count,
    COUNT(*) FILTER (WHERE label_status IN ('expert_verified', 'nechama_verified')) as verified_count,
    ROUND(AVG(ai_confidence)::numeric, 3) as avg_ai_confidence
FROM public.color_labels
WHERE confirmed_subtype IS NOT NULL
GROUP BY confirmed_subtype, confirmed_season
ORDER BY confirmed_season, count DESC;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.face_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_terms ENABLE ROW LEVEL SECURITY;

-- Public read for training data and vocabulary
CREATE POLICY "Anyone can view face images" ON public.face_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view color labels" ON public.color_labels FOR SELECT USING (true);
CREATE POLICY "Anyone can view vocabulary" ON public.vocabulary_terms FOR SELECT USING (true);
CREATE POLICY "Anyone can view training batches" ON public.training_batches FOR SELECT USING (true);
CREATE POLICY "Anyone can view batch images" ON public.batch_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view model runs" ON public.model_runs FOR SELECT USING (true);

-- Authenticated users can manage training data
CREATE POLICY "Auth users can insert face images" ON public.face_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can update face images" ON public.face_images FOR UPDATE USING (true);
CREATE POLICY "Auth users can delete face images" ON public.face_images FOR DELETE USING (true);

CREATE POLICY "Auth users can insert color labels" ON public.color_labels FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can update color labels" ON public.color_labels FOR UPDATE USING (true);
CREATE POLICY "Auth users can delete color labels" ON public.color_labels FOR DELETE USING (true);

CREATE POLICY "Auth users can insert vocabulary" ON public.vocabulary_terms FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can update vocabulary" ON public.vocabulary_terms FOR UPDATE USING (true);

CREATE POLICY "Auth users can insert batches" ON public.training_batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth users can update batches" ON public.training_batches FOR UPDATE USING (true);
CREATE POLICY "Auth users can delete batches" ON public.training_batches FOR DELETE USING (true);

CREATE POLICY "Auth users can manage batch images" ON public.batch_images FOR ALL USING (true);
CREATE POLICY "Auth users can manage model runs" ON public.model_runs FOR ALL USING (true);

-- ============================================================
-- STORAGE BUCKET FOR FACES
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('face-images', 'face-images', true);

CREATE POLICY "Anyone can view face images storage" ON storage.objects FOR SELECT USING (bucket_id = 'face-images');
CREATE POLICY "Auth users can upload face images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'face-images');
CREATE POLICY "Auth users can update face images storage" ON storage.objects FOR UPDATE USING (bucket_id = 'face-images');
CREATE POLICY "Auth users can delete face images storage" ON storage.objects FOR DELETE USING (bucket_id = 'face-images');

-- ============================================================
-- SEED VOCABULARY
-- ============================================================
INSERT INTO public.vocabulary_terms (category, term, display_name) VALUES
-- Fabrics
('fabrics', 'velvet', 'Velvet'), ('fabrics', 'silk', 'Silk'), ('fabrics', 'satin', 'Satin'),
('fabrics', 'brocade', 'Brocade'), ('fabrics', 'damask', 'Damask'), ('fabrics', 'lace', 'Lace'),
('fabrics', 'chiffon', 'Chiffon'), ('fabrics', 'taffeta', 'Taffeta'), ('fabrics', 'organza', 'Organza'),
('fabrics', 'cashmere', 'Cashmere'), ('fabrics', 'wool', 'Wool'), ('fabrics', 'tweed', 'Tweed'),
-- Silhouettes
('silhouettes', 'empire_waist', 'Empire Waist'), ('silhouettes', 'a_line', 'A-Line'),
('silhouettes', 'fitted', 'Fitted/Sheath'), ('silhouettes', 'ball_gown', 'Ball Gown'),
('silhouettes', 'column', 'Column'), ('silhouettes', 'draped', 'Draped'), ('silhouettes', 'flowing', 'Flowing'),
-- Necklines
('necklines', 'portrait', 'Portrait'), ('necklines', 'off_shoulder', 'Off-Shoulder'),
('necklines', 'square', 'Square'), ('necklines', 'sweetheart', 'Sweetheart'),
('necklines', 'v_neck', 'V-Neck'), ('necklines', 'boat', 'Boat/Bateau'),
-- Palette Effects
('palette_effects', 'renaissance_queen', 'Renaissance Queen'),
('palette_effects', 'venetian_splendor', 'Venetian Splendor'),
('palette_effects', 'french_court', 'French Court'),
('palette_effects', 'pre_raphaelite', 'Pre-Raphaelite'),
('palette_effects', 'baroque_opulence', 'Baroque Opulence'),
('palette_effects', 'impressionist_light', 'Impressionist Light'),
('palette_effects', 'edwardian_grace', 'Edwardian Grace'),
-- Moods
('moods', 'elegant', 'Elegant'), ('moods', 'romantic', 'Romantic'), ('moods', 'dramatic', 'Dramatic'),
('moods', 'regal', 'Regal'), ('moods', 'ethereal', 'Ethereal'), ('moods', 'opulent', 'Opulent');