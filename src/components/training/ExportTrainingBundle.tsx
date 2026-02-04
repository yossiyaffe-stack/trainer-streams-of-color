import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Package } from 'lucide-react';
import JSZip from 'jszip';
import { toast } from 'sonner';

// Training component file contents - these will be fetched at build time
const TRAINING_FILES = {
  // Components
  'src/components/training/AnalysisResult.tsx': () => import('./AnalysisResult.tsx?raw'),
  'src/components/training/BatchReanalysis.tsx': () => import('./BatchReanalysis.tsx?raw'),
  'src/components/training/BulkPhotoRow.tsx': () => import('./BulkPhotoRow.tsx?raw'),
  'src/components/training/BulkTrainingTab.tsx': () => import('./BulkTrainingTab.tsx?raw'),
  'src/components/training/ConfirmedGalleryTab.tsx': () => import('./ConfirmedGalleryTab.tsx?raw'),
  'src/components/training/FaceDatasetsTab.tsx': () => import('./FaceDatasetsTab.tsx?raw'),
  'src/components/training/FaceDetailModal.tsx': () => import('./FaceDetailModal.tsx?raw'),
  'src/components/training/FacesFilterToolbar.tsx': () => import('./FacesFilterToolbar.tsx?raw'),
  'src/components/training/FacesGalleryTab.tsx': () => import('./FacesGalleryTab.tsx?raw'),
  'src/components/training/FacesUploadTab.tsx': () => import('./FacesUploadTab.tsx?raw'),
  'src/components/training/HuggingFaceImport.tsx': () => import('./HuggingFaceImport.tsx?raw'),
  'src/components/training/ImportExportPanel.tsx': () => import('./ImportExportPanel.tsx?raw'),
  'src/components/training/PhotoGridView.tsx': () => import('./PhotoGridView.tsx?raw'),
  'src/components/training/PhotoUpload.tsx': () => import('./PhotoUpload.tsx?raw'),
  'src/components/training/ProgressDashboard.tsx': () => import('./ProgressDashboard.tsx?raw'),
  'src/components/training/StatsOverview.tsx': () => import('./StatsOverview.tsx?raw'),
  'src/components/training/SubtypeManager.tsx': () => import('./SubtypeManager.tsx?raw'),
  // Page
  'src/pages/Training.tsx': () => import('@/pages/Training.tsx?raw'),
  // Types
  'src/types/training.ts': () => import('@/types/training.ts?raw'),
  // Data
  'src/data/subtypes.ts': () => import('@/data/subtypes.ts?raw'),
  // Lib
  'src/lib/dataHubApi.ts': () => import('@/lib/dataHubApi.ts?raw'),
};

// Static content for config files
const STATIC_FILES: Record<string, string> = {
  'README.md': `# Face Analysis Training Module

This bundle contains all the components needed to run the Face Analysis Training system.

## Installation

1. Install dependencies:
\`\`\`bash
npm install @tanstack/react-query framer-motion lucide-react sonner recharts @supabase/supabase-js
npm install @radix-ui/react-tabs @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-checkbox
npm install tailwindcss tailwind-merge class-variance-authority clsx
\`\`\`

2. Set up environment variables:
\`\`\`
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
\`\`\`

3. Run the database migrations (see /database folder)

4. Deploy edge functions (see /supabase/functions folder)

## Structure

- \`/src/components/training/\` - All training UI components
- \`/src/pages/Training.tsx\` - Main training page
- \`/src/types/training.ts\` - TypeScript definitions
- \`/src/data/subtypes.ts\` - Color analysis methodology data
- \`/database/\` - SQL migrations for tables and views
- \`/supabase/functions/\` - Edge functions for AI analysis
`,

  'database/01_enums.sql': `-- Color Analysis Enums
CREATE TYPE public.season_type AS ENUM ('spring', 'summer', 'autumn', 'winter');
CREATE TYPE public.undertone_type AS ENUM ('warm', 'cool', 'neutral', 'warm-neutral', 'cool-neutral');
CREATE TYPE public.depth_type AS ENUM ('light', 'light-medium', 'medium', 'medium-deep', 'deep');
CREATE TYPE public.contrast_level_type AS ENUM ('low', 'low-medium', 'medium', 'medium-high', 'high');
CREATE TYPE public.label_status AS ENUM ('unlabeled', 'ai_predicted', 'needs_review', 'manually_labeled', 'expert_verified', 'nechama_verified');
CREATE TYPE public.data_source AS ENUM ('celeba_hq', 'ffhq', 'client_photo', 'training_upload', 'user_submission');

CREATE TYPE public.eye_color_name AS ENUM (
  'dark_brown', 'chocolate_brown', 'golden_brown', 'amber', 'topaz', 'honey',
  'emerald', 'jade', 'olive', 'sage', 'moss', 'teal',
  'sapphire', 'sky_blue', 'steel_blue', 'periwinkle', 'navy',
  'charcoal', 'silver', 'slate', 'pewter',
  'hazel_green', 'hazel_brown', 'hazel_gold',
  'black', 'violet', 'mixed'
);

CREATE TYPE public.hair_color_name AS ENUM (
  'blue_black', 'soft_black', 'black_brown', 'espresso', 'dark_chocolate',
  'milk_chocolate', 'chestnut', 'walnut', 'caramel', 'toffee', 'golden_brown', 'mousy_brown',
  'auburn', 'copper', 'ginger', 'strawberry', 'burgundy', 'mahogany',
  'platinum', 'ash_blonde', 'golden_blonde', 'honey_blonde', 'champagne', 'dirty_blonde', 'dark_blonde',
  'silver', 'pewter', 'salt_pepper', 'white', 'steel_gray'
);

CREATE TYPE public.skin_tone_name AS ENUM (
  'porcelain', 'ivory', 'alabaster', 'fair', 'peaches_cream', 'cream',
  'light_beige', 'rose_beige', 'warm_beige', 'golden_beige', 'nude', 'sand',
  'honey', 'caramel', 'olive', 'tan', 'bronze', 'amber',
  'cinnamon', 'toffee', 'mocha', 'espresso', 'mahogany', 'cocoa', 'ebony', 'onyx'
);
`,

  'database/02_tables.sql': `-- Face Images Table
CREATE TABLE public.face_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT,
  source public.data_source DEFAULT 'training_upload',
  source_id TEXT,
  width INTEGER,
  height INTEGER,
  file_size_bytes INTEGER,
  quality_score NUMERIC,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  celeba_attributes JSONB,
  is_good_lighting BOOLEAN,
  is_neutral_background BOOLEAN,
  is_no_makeup BOOLEAN,
  is_natural_hair_color BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Color Labels Table
CREATE TABLE public.color_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  face_image_id UUID NOT NULL UNIQUE REFERENCES public.face_images(id) ON DELETE CASCADE,
  label_status public.label_status DEFAULT 'unlabeled',
  labeled_by TEXT,
  labeled_at TIMESTAMPTZ,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  
  -- AI predictions
  ai_predicted_subtype TEXT,
  ai_confidence NUMERIC,
  ai_alternatives JSONB,
  ai_reasoning TEXT,
  
  -- Confirmed values
  confirmed_season public.season_type,
  confirmed_subtype TEXT,
  
  -- Physical traits
  undertone public.undertone_type,
  undertone_confidence NUMERIC,
  undertone_indicators JSONB,
  depth public.depth_type,
  depth_value NUMERIC,
  contrast_level public.contrast_level_type,
  contrast_value NUMERIC,
  contrast_details JSONB,
  
  -- Colors
  skin_tone_name public.skin_tone_name,
  skin_hex TEXT,
  skin_rgb INTEGER[],
  skin_region_samples JSONB,
  eye_color_name public.eye_color_name,
  eye_hex TEXT,
  eye_rgb INTEGER[],
  eye_details JSONB,
  hair_color_name public.hair_color_name,
  hair_hex TEXT,
  hair_rgb INTEGER[],
  hair_details JSONB,
  lip_hex TEXT,
  lip_rgb INTEGER[],
  
  -- Quality flags
  is_good_for_training BOOLEAN DEFAULT true,
  exclude_reason TEXT,
  had_disagreement BOOLEAN DEFAULT false,
  disagreement_notes TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Batches Table
CREATE TABLE public.training_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  target_subtypes TEXT[],
  total_images INTEGER DEFAULT 0,
  labeled_count INTEGER DEFAULT 0,
  verified_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Batch Images Junction Table
CREATE TABLE public.batch_images (
  batch_id UUID NOT NULL REFERENCES public.training_batches(id) ON DELETE CASCADE,
  face_image_id UUID NOT NULL REFERENCES public.face_images(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (batch_id, face_image_id)
);

-- Enable RLS
ALTER TABLE public.face_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.color_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_images ENABLE ROW LEVEL SECURITY;

-- Public read policies (adjust as needed)
CREATE POLICY "Public read face_images" ON public.face_images FOR SELECT USING (true);
CREATE POLICY "Public read color_labels" ON public.color_labels FOR SELECT USING (true);
CREATE POLICY "Public read training_batches" ON public.training_batches FOR SELECT USING (true);
CREATE POLICY "Public read batch_images" ON public.batch_images FOR SELECT USING (true);

-- Auth write policies
CREATE POLICY "Auth write face_images" ON public.face_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write color_labels" ON public.color_labels FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write training_batches" ON public.training_batches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth write batch_images" ON public.batch_images FOR ALL TO authenticated USING (true) WITH CHECK (true);
`,

  'database/03_views.sql': `-- Dataset Statistics View
CREATE OR REPLACE VIEW public.v_dataset_stats AS
SELECT
  COUNT(*) AS total_images,
  COUNT(*) FILTER (WHERE cl.label_status = 'unlabeled' OR cl.id IS NULL) AS unlabeled,
  COUNT(*) FILTER (WHERE cl.label_status = 'ai_predicted') AS ai_predicted,
  COUNT(*) FILTER (WHERE cl.label_status = 'needs_review') AS needs_review,
  COUNT(*) FILTER (WHERE cl.label_status = 'manually_labeled') AS manually_labeled,
  COUNT(*) FILTER (WHERE cl.label_status = 'expert_verified') AS expert_verified,
  COUNT(*) FILTER (WHERE cl.label_status = 'nechama_verified') AS nechama_verified,
  COUNT(*) FILTER (WHERE cl.confirmed_subtype IS NOT NULL) AS has_confirmed_subtype,
  COUNT(*) FILTER (WHERE cl.is_good_for_training = true AND cl.confirmed_subtype IS NOT NULL) AS training_ready
FROM public.face_images fi
LEFT JOIN public.color_labels cl ON cl.face_image_id = fi.id;

-- Training Data View
CREATE OR REPLACE VIEW public.v_training_data AS
SELECT
  fi.id,
  fi.storage_path,
  fi.thumbnail_path,
  fi.source,
  fi.quality_score,
  cl.label_status,
  cl.ai_predicted_subtype,
  cl.ai_confidence,
  cl.confirmed_season,
  cl.confirmed_subtype,
  cl.undertone,
  cl.depth,
  cl.contrast_level,
  cl.skin_tone_name,
  cl.skin_hex,
  cl.eye_color_name,
  cl.eye_hex,
  cl.hair_color_name,
  cl.hair_hex,
  cl.is_good_for_training
FROM public.face_images fi
LEFT JOIN public.color_labels cl ON cl.face_image_id = fi.id;

-- Labeling Queue View
CREATE OR REPLACE VIEW public.v_labeling_queue AS
SELECT
  fi.id,
  fi.storage_path,
  fi.thumbnail_path,
  fi.source_id,
  fi.quality_score,
  cl.label_status,
  cl.ai_predicted_subtype,
  cl.ai_confidence,
  cl.ai_alternatives
FROM public.face_images fi
LEFT JOIN public.color_labels cl ON cl.face_image_id = fi.id
WHERE cl.label_status IN ('unlabeled', 'ai_predicted', 'needs_review')
   OR cl.id IS NULL
ORDER BY fi.quality_score DESC NULLS LAST, fi.created_at DESC;
`,

  'database/04_storage.sql': `-- Create storage bucket for face images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('face-images', 'face-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read face images"
ON storage.objects FOR SELECT
USING (bucket_id = 'face-images');

-- Authenticated write access
CREATE POLICY "Auth upload face images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'face-images');

CREATE POLICY "Auth update face images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'face-images');

CREATE POLICY "Auth delete face images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'face-images');
`,
};

export function ExportTrainingBundle() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      const totalFiles = Object.keys(TRAINING_FILES).length + Object.keys(STATIC_FILES).length;
      let processed = 0;

      // Add static files
      for (const [path, content] of Object.entries(STATIC_FILES)) {
        zip.file(path, content);
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      }

      // Add dynamic files
      for (const [path, importFn] of Object.entries(TRAINING_FILES)) {
        try {
          const module = await importFn();
          const content = (module as { default: string }).default;
          zip.file(path, content);
        } catch (err) {
          console.warn(`Could not load ${path}:`, err);
          zip.file(path, `// Failed to export: ${path}`);
        }
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      }

      // Generate the zip
      const blob = await zip.generateAsync({ type: 'blob' });
      
      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `face-training-bundle-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Training bundle exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export training bundle');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Package className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Export Training Bundle</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all training components, database schemas, and edge functions as a zip file for migration to another project.
          </p>
          
          <div className="text-xs text-muted-foreground mb-4 space-y-1">
            <p>• 17 React components</p>
            <p>• Training page & types</p>
            <p>• Database migrations (enums, tables, views)</p>
            <p>• Storage bucket setup</p>
            <p>• Subtypes methodology data</p>
          </div>

          {isExporting && (
            <div className="mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bundling files... {progress}%
              </p>
            </div>
          )}

          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Bundle
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
