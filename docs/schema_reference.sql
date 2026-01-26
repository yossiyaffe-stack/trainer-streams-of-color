-- ============================================================
-- STREAMS OF COLOR - COMPLETE SUPABASE SCHEMA
-- Nechama Yaffe's Color Analysis Methodology
-- ============================================================
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES - NECHAMA'S VOCABULARY
-- ============================================================

CREATE TYPE undertone_type AS ENUM ('warm', 'cool', 'neutral', 'warm-neutral', 'cool-neutral');
CREATE TYPE depth_type AS ENUM ('light', 'light-medium', 'medium', 'medium-deep', 'deep');
CREATE TYPE contrast_level_type AS ENUM ('low', 'low-medium', 'medium', 'medium-high', 'high');
CREATE TYPE season_type AS ENUM ('spring', 'summer', 'autumn', 'winter');

-- Nechama's 30 subtypes
CREATE TYPE color_subtype AS ENUM (
    -- SPRING (2)
    'french_spring', 'porcelain_spring',
    -- SUMMER (7)
    'ballerina_summer', 'cameo_summer', 'chinoiserie_summer', 'degas_summer',
    'summer_rose', 'sunset_summer', 'water_lily_summer',
    -- AUTUMN (11)
    'auburn_autumn', 'burnished_autumn', 'cloisonne_autumn', 'grecian_autumn',
    'mellow_autumn', 'multi_colored_autumn', 'oriental_autumn', 'renaissance_autumn',
    'sunlit_autumn', 'tapestry_autumn', 'topaz_autumn',
    -- WINTER (10)
    'burnished_winter', 'cameo_winter', 'crystal_winter', 'exotic_winter',
    'gemstone_winter', 'mediterranean_winter', 'ornamental_winter',
    'silk_road_winter', 'tapestry_winter', 'winter_rose'
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

CREATE TYPE data_source AS ENUM ('celeba_hq', 'ffhq', 'client_photo', 'training_upload', 'user_submission');

CREATE TYPE label_status AS ENUM (
    'unlabeled', 'ai_predicted', 'needs_review',
    'manually_labeled', 'expert_verified', 'nechama_verified'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Subtype definitions
CREATE TABLE subtype_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subtype_code color_subtype UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    season season_type NOT NULL,
    undertone undertone_type,
    typical_depth depth_type,
    typical_contrast contrast_level_type,
    description TEXT,
    palette_effect VARCHAR(255),
    matching_criteria JSONB,
    palette_colors JSONB,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Face images
CREATE TABLE face_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source data_source NOT NULL DEFAULT 'celeba_hq',
    source_id VARCHAR(100),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_filename VARCHAR(255),
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    is_good_lighting BOOLEAN,
    is_neutral_background BOOLEAN,
    is_no_makeup BOOLEAN,
    is_natural_hair_color BOOLEAN,
    quality_score FLOAT,
    celeba_attributes JSONB,
    is_processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Color labels (main training data)
CREATE TABLE color_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    face_image_id UUID NOT NULL REFERENCES face_images(id) ON DELETE CASCADE,
    
    -- Colors
    skin_hex VARCHAR(7),
    skin_rgb INTEGER[3],
    skin_tone_name skin_tone_name,
    skin_region_samples JSONB,
    
    eye_hex VARCHAR(7),
    eye_rgb INTEGER[3],
    eye_color_name eye_color_name,
    eye_details JSONB,
    
    hair_hex VARCHAR(7),
    hair_rgb INTEGER[3],
    hair_color_name hair_color_name,
    hair_details JSONB,
    
    lip_hex VARCHAR(7),
    lip_rgb INTEGER[3],
    
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
    ai_predicted_subtype color_subtype,
    ai_confidence FLOAT,
    ai_alternatives JSONB,
    ai_reasoning TEXT,
    
    -- Human Confirmation
    confirmed_subtype color_subtype,
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(face_image_id)
);

-- Paintings
CREATE TABLE paintings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_filename VARCHAR(255),
    title VARCHAR(255),
    artist VARCHAR(255),
    year_approximate VARCHAR(50),
    era VARCHAR(100),
    ai_analysis JSONB,
    fabrics TEXT[],
    silhouette VARCHAR(100),
    neckline VARCHAR(100),
    sleeves VARCHAR(100),
    color_mood VARCHAR(100),
    palette_effect VARCHAR(255),
    mood_primary VARCHAR(100),
    suggested_season season_type,
    tags TEXT[],
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by VARCHAR(100)
);

-- Painting-subtype links
CREATE TABLE painting_subtype_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    painting_id UUID REFERENCES paintings(id) ON DELETE CASCADE,
    subtype_code color_subtype NOT NULL,
    link_reason TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    UNIQUE(painting_id, subtype_code)
);

-- Training batches
CREATE TABLE training_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose VARCHAR(100),
    target_subtypes color_subtype[],
    total_images INTEGER DEFAULT 0,
    labeled_count INTEGER DEFAULT 0,
    verified_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE batch_images (
    batch_id UUID REFERENCES training_batches(id) ON DELETE CASCADE,
    face_image_id UUID REFERENCES face_images(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (batch_id, face_image_id)
);

-- Model runs
CREATE TABLE model_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(50),
    architecture TEXT,
    config JSONB,
    training_count INTEGER,
    validation_count INTEGER,
    subtypes_trained color_subtype[],
    overall_accuracy FLOAT,
    per_subtype_accuracy JSONB,
    confusion_matrix JSONB,
    model_path TEXT,
    weights_path TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vocabulary terms
CREATE TABLE vocabulary_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    term VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    hex_code VARCHAR(7),
    rgb_values INTEGER[3],
    related_terms TEXT[],
    parent_term VARCHAR(100),
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, term)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_face_images_source ON face_images(source);
CREATE INDEX idx_face_images_quality ON face_images(quality_score) WHERE quality_score IS NOT NULL;
CREATE INDEX idx_face_images_unprocessed ON face_images(id) WHERE NOT is_processed;

CREATE INDEX idx_color_labels_status ON color_labels(label_status);
CREATE INDEX idx_color_labels_subtype ON color_labels(confirmed_subtype);
CREATE INDEX idx_color_labels_season ON color_labels(confirmed_season);
CREATE INDEX idx_color_labels_undertone ON color_labels(undertone);
CREATE INDEX idx_color_labels_training ON color_labels(face_image_id) 
    WHERE is_good_for_training AND confirmed_subtype IS NOT NULL;

CREATE INDEX idx_paintings_status ON paintings(status);
CREATE INDEX idx_paintings_season ON paintings(suggested_season);
CREATE INDEX idx_paintings_fabrics ON paintings USING GIN(fabrics);
CREATE INDEX idx_paintings_tags ON paintings USING GIN(tags);

CREATE INDEX idx_vocabulary_category ON vocabulary_terms(category);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Get season from subtype
CREATE OR REPLACE FUNCTION get_season_from_subtype(subtype color_subtype)
RETURNS season_type AS $$
BEGIN
    RETURN CASE 
        WHEN subtype::text LIKE '%spring%' THEN 'spring'::season_type
        WHEN subtype::text LIKE '%summer%' THEN 'summer'::season_type
        WHEN subtype::text LIKE '%autumn%' THEN 'autumn'::season_type
        WHEN subtype::text LIKE '%winter%' THEN 'winter'::season_type
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-set season
CREATE OR REPLACE FUNCTION auto_set_season()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.confirmed_subtype IS NOT NULL THEN
        NEW.confirmed_season := get_season_from_subtype(NEW.confirmed_subtype);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_set_season
BEFORE INSERT OR UPDATE ON color_labels
FOR EACH ROW EXECUTE FUNCTION auto_set_season();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER face_images_updated_at BEFORE UPDATE ON face_images FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER color_labels_updated_at BEFORE UPDATE ON color_labels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER paintings_updated_at BEFORE UPDATE ON paintings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subtype_definitions_updated_at BEFORE UPDATE ON subtype_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate painting tags
CREATE OR REPLACE FUNCTION generate_painting_tags()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tags := ARRAY(
        SELECT DISTINCT unnest(
            COALESCE(NEW.fabrics, '{}') ||
            ARRAY[NEW.silhouette, NEW.neckline, NEW.sleeves, NEW.color_mood, 
                  NEW.palette_effect, NEW.mood_primary, NEW.suggested_season::text, NEW.era, NEW.artist]
        )
        WHERE unnest IS NOT NULL AND unnest != ''
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_painting_tags
BEFORE INSERT OR UPDATE ON paintings
FOR EACH ROW EXECUTE FUNCTION generate_painting_tags();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE VIEW v_training_data AS
SELECT 
    fi.id, fi.storage_path, fi.thumbnail_path, fi.source, fi.quality_score,
    cl.skin_hex, cl.skin_tone_name, cl.eye_hex, cl.eye_color_name,
    cl.hair_hex, cl.hair_color_name, cl.undertone, cl.depth, cl.contrast_level,
    cl.confirmed_subtype, cl.confirmed_season, cl.ai_predicted_subtype,
    cl.ai_confidence, cl.label_status, cl.is_good_for_training
FROM face_images fi
JOIN color_labels cl ON cl.face_image_id = fi.id
WHERE cl.is_good_for_training = true;

CREATE VIEW v_labeling_queue AS
SELECT 
    fi.id, fi.storage_path, fi.thumbnail_path, fi.source_id, fi.quality_score,
    cl.ai_predicted_subtype, cl.ai_confidence, cl.ai_alternatives, cl.label_status
FROM face_images fi
LEFT JOIN color_labels cl ON cl.face_image_id = fi.id
WHERE cl.label_status IN ('unlabeled', 'ai_predicted', 'needs_review')
ORDER BY cl.ai_confidence DESC NULLS LAST, fi.created_at;

CREATE VIEW v_dataset_stats AS
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
FROM face_images fi
LEFT JOIN color_labels cl ON cl.face_image_id = fi.id;

CREATE VIEW v_subtype_distribution AS
SELECT 
    confirmed_subtype, confirmed_season, COUNT(*) as count,
    COUNT(*) FILTER (WHERE label_status = 'nechama_verified') as nechama_verified_count,
    COUNT(*) FILTER (WHERE label_status IN ('expert_verified', 'nechama_verified')) as verified_count,
    ROUND(AVG(ai_confidence)::numeric, 3) as avg_ai_confidence
FROM color_labels
WHERE confirmed_subtype IS NOT NULL
GROUP BY confirmed_subtype, confirmed_season
ORDER BY confirmed_season, count DESC;

CREATE VIEW v_paintings_by_subtype AS
SELECT 
    psl.subtype_code, COUNT(p.id) as painting_count,
    ARRAY_AGG(p.thumbnail_path ORDER BY psl.display_order) as thumbnails,
    ARRAY_AGG(p.title ORDER BY psl.display_order) as titles
FROM painting_subtype_links psl
JOIN paintings p ON p.id = psl.painting_id
WHERE p.status IN ('reviewed', 'published')
GROUP BY psl.subtype_code;

-- ============================================================
-- SEED DATA: NECHAMA'S 30 SUBTYPES
-- ============================================================

INSERT INTO subtype_definitions (subtype_code, display_name, season, undertone, typical_depth, typical_contrast, palette_effect) VALUES
-- Spring
('french_spring', 'French Spring', 'spring', 'warm', 'light', 'low-medium', 'French Garden'),
('porcelain_spring', 'Porcelain Spring', 'spring', 'warm-neutral', 'light', 'medium', 'English Tea Rose'),
-- Summer
('ballerina_summer', 'Ballerina Summer', 'summer', 'cool', 'light', 'low', 'Swan Lake'),
('cameo_summer', 'Cameo Summer', 'summer', 'cool', 'light', 'medium', 'Victorian Cameo'),
('chinoiserie_summer', 'Chinoiserie Summer', 'summer', 'cool', 'light-medium', 'low-medium', 'Oriental Silk'),
('degas_summer', 'Degas Summer', 'summer', 'cool', 'light-medium', 'low', 'Impressionist Light'),
('summer_rose', 'Summer Rose', 'summer', 'cool', 'light-medium', 'medium', 'English Rose Garden'),
('sunset_summer', 'Sunset Summer', 'summer', 'cool-neutral', 'medium', 'medium', 'Mediterranean Sunset'),
('water_lily_summer', 'Water Lily Summer', 'summer', 'cool', 'light', 'low', 'Water Garden'),
-- Autumn
('auburn_autumn', 'Auburn Autumn', 'autumn', 'warm', 'medium', 'medium', 'Celtic Fire'),
('burnished_autumn', 'Burnished Autumn', 'autumn', 'warm', 'medium-deep', 'medium-high', 'Gilded Bronze'),
('cloisonne_autumn', 'Cloisonne Autumn', 'autumn', 'warm', 'medium', 'high', 'Byzantine Enamel'),
('grecian_autumn', 'Grecian Autumn', 'autumn', 'warm-neutral', 'medium', 'medium', 'Athenian Gold'),
('mellow_autumn', 'Mellow Autumn', 'autumn', 'warm', 'medium', 'low', 'Tuscan Afternoon'),
('multi_colored_autumn', 'Multi-Colored Autumn', 'autumn', 'warm', 'medium', 'high', 'Autumn Tapestry'),
('oriental_autumn', 'Oriental Autumn', 'autumn', 'warm', 'medium-deep', 'medium', 'Silk Road'),
('renaissance_autumn', 'Renaissance Autumn', 'autumn', 'warm', 'medium', 'medium-high', 'Florentine Masterwork'),
('sunlit_autumn', 'Sunlit Autumn', 'autumn', 'warm', 'light-medium', 'medium', 'Harvest Sun'),
('tapestry_autumn', 'Tapestry Autumn', 'autumn', 'warm', 'medium-deep', 'medium', 'Medieval Tapestry'),
('topaz_autumn', 'Topaz Autumn', 'autumn', 'warm', 'medium', 'medium-high', 'Amber Gemstone'),
-- Winter
('burnished_winter', 'Burnished Winter', 'winter', 'cool', 'medium-deep', 'high', 'Obsidian Mirror'),
('cameo_winter', 'Cameo Winter', 'winter', 'cool', 'light-medium', 'high', 'Onyx Cameo'),
('crystal_winter', 'Crystal Winter', 'winter', 'cool', 'light', 'high', 'Ice Crystal'),
('exotic_winter', 'Exotic Winter', 'winter', 'cool-neutral', 'deep', 'high', 'Midnight Jewel'),
('gemstone_winter', 'Gemstone Winter', 'winter', 'cool', 'medium-deep', 'high', 'Sapphire Crown'),
('mediterranean_winter', 'Mediterranean Winter', 'winter', 'cool-neutral', 'medium-deep', 'medium-high', 'Venetian Night'),
('ornamental_winter', 'Ornamental Winter', 'winter', 'cool', 'medium', 'high', 'Art Deco'),
('silk_road_winter', 'Silk Road Winter', 'winter', 'cool-neutral', 'medium-deep', 'medium-high', 'Persian Miniature'),
('tapestry_winter', 'Tapestry Winter', 'winter', 'cool', 'medium-deep', 'medium-high', 'Renaissance Queen'),
('winter_rose', 'Winter Rose', 'winter', 'cool', 'light-medium', 'high', 'Frost Rose');

-- ============================================================
-- SEED DATA: VOCABULARY
-- ============================================================

INSERT INTO vocabulary_terms (category, term, display_name) VALUES
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE face_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE paintings ENABLE ROW LEVEL SECURITY;
ALTER TABLE painting_subtype_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtype_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_runs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role access" ON face_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON color_labels FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON paintings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON painting_subtype_links FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON subtype_definitions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON vocabulary_terms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON training_batches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON batch_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access" ON model_runs FOR ALL USING (auth.role() = 'service_role');

-- Public read for reference data
CREATE POLICY "Public read" ON subtype_definitions FOR SELECT USING (true);
CREATE POLICY "Public read" ON vocabulary_terms FOR SELECT USING (true);

-- ============================================================
-- DONE! Your schema is ready.
-- ============================================================
