import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Palette } from 'lucide-react';
import JSZip from 'jszip';
import { toast } from 'sonner';

// Painting component file contents - these will be fetched at build time
const PAINTING_FILES = {
  // Main painting components
  'src/components/paintings/AnalysisOptionsDialog.tsx': () => import('./AnalysisOptionsDialog.tsx?raw'),
  'src/components/paintings/MuseumPaintingsGrid.tsx': () => import('./MuseumPaintingsGrid.tsx?raw'),
  'src/components/paintings/PaintingDetailModal.tsx': () => import('./PaintingDetailModal.tsx?raw'),
  'src/components/paintings/PaintingGrid.tsx': () => import('./PaintingGrid.tsx?raw'),
  'src/components/paintings/PaintingUpload.tsx': () => import('./PaintingUpload.tsx?raw'),
  'src/components/paintings/PaletteGalleryTab.tsx': () => import('./PaletteGalleryTab.tsx?raw'),
  'src/components/paintings/UnifiedGallery.tsx': () => import('./UnifiedGallery.tsx?raw'),
  
  // Hub painting components
  'src/components/hub/paintings/MuseumImportTab.tsx': () => import('@/components/hub/paintings/MuseumImportTab.tsx?raw'),
  'src/components/hub/paintings/PaintingBySubtypeTab.tsx': () => import('@/components/hub/paintings/PaintingBySubtypeTab.tsx?raw'),
  'src/components/hub/paintings/PaintingGridTab.tsx': () => import('@/components/hub/paintings/PaintingGridTab.tsx?raw'),
  'src/components/hub/paintings/PaintingListTab.tsx': () => import('@/components/hub/paintings/PaintingListTab.tsx?raw'),
  'src/components/hub/paintings/PaintingUploadTab.tsx': () => import('@/components/hub/paintings/PaintingUploadTab.tsx?raw'),
  
  // Page
  'src/pages/Paintings.tsx': () => import('@/pages/Paintings.tsx?raw'),
  
  // Types
  'src/types/paintings.ts': () => import('@/types/paintings.ts?raw'),
  
  // Context
  'src/contexts/HubContext.tsx': () => import('@/contexts/HubContext.tsx?raw'),
  
  // Data
  'src/data/subtypes.ts': () => import('@/data/subtypes.ts?raw'),
  'src/data/fabrics.ts': () => import('@/data/fabrics.ts?raw'),
  'src/data/vocabulary.ts': () => import('@/data/vocabulary.ts?raw'),
};

// Static content for config files
const STATIC_FILES: Record<string, string> = {
  'README.md': `# Painting Library & Palette System

This bundle contains all the components needed to run the Painting Library for color palette curation.

## Features
- Upload artwork for AI-powered stylistic analysis
- Museum Import from Art Institute of Chicago, Met, and Cleveland Museum
- Palette Gallery for curated seasonal reference paintings
- Extract fabrics, silhouettes, jewelry, and mood from paintings

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

- \`/src/components/paintings/\` - Main painting UI components
- \`/src/components/hub/paintings/\` - Hub integration components
- \`/src/pages/Paintings.tsx\` - Main paintings page
- \`/src/types/paintings.ts\` - TypeScript definitions
- \`/src/contexts/HubContext.tsx\` - Shared state management
- \`/src/data/\` - Vocabulary, fabrics, and subtypes data
- \`/database/\` - SQL migrations for paintings table
- \`/supabase/functions/\` - Edge functions for AI analysis and museum import
`,

  'database/01_paintings_table.sql': `-- Paintings Table for Style Reference Library
CREATE TABLE public.paintings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  original_filename TEXT,
  title TEXT,
  artist TEXT,
  era TEXT,
  year_approximate TEXT,
  
  -- AI Analysis (stored as JSON)
  ai_analysis JSONB,
  analyzed_at TIMESTAMPTZ,
  
  -- Extracted fields for filtering/search
  fabrics TEXT[],
  silhouette TEXT,
  neckline TEXT,
  sleeves TEXT,
  color_mood TEXT,
  palette_effect TEXT,
  prints_patterns TEXT[],
  jewelry_types TEXT[],
  mood_primary TEXT,
  mood_secondary TEXT[],
  suggested_season TEXT,
  tags TEXT[],
  best_for TEXT[],
  client_talking_points TEXT[],
  
  -- Expert corrections
  corrections JSONB,
  notes TEXT,
  
  -- Status and workflow
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paintings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read paintings" ON public.paintings FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Auth write paintings" ON public.paintings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX idx_paintings_season ON public.paintings(suggested_season);
CREATE INDEX idx_paintings_status ON public.paintings(status);
CREATE INDEX idx_paintings_tags ON public.paintings USING GIN(tags);
CREATE INDEX idx_paintings_fabrics ON public.paintings USING GIN(fabrics);

-- Function to auto-generate tags from metadata
CREATE OR REPLACE FUNCTION public.generate_painting_tags()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tags := ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(NEW.fabrics, ARRAY[]::TEXT[]) ||
      ARRAY[NEW.silhouette, NEW.color_mood, NEW.era, NEW.artist, NEW.palette_effect]
    )
    WHERE unnest IS NOT NULL AND unnest != ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_painting_tags
BEFORE INSERT OR UPDATE ON public.paintings
FOR EACH ROW
EXECUTE FUNCTION public.generate_painting_tags();
`,

  'database/02_paintings_storage.sql': `-- Create storage bucket for paintings
INSERT INTO storage.buckets (id, name, public) 
VALUES ('paintings', 'paintings', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Public read painting images"
ON storage.objects FOR SELECT
USING (bucket_id = 'paintings');

-- Authenticated write access
CREATE POLICY "Auth upload painting images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'paintings');

CREATE POLICY "Auth update painting images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'paintings');

CREATE POLICY "Auth delete painting images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'paintings');
`,

  'supabase/functions/analyze-painting/index.ts': `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Authentication helper
async function authenticateRequest(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !data?.user) return null;
  return { user: { id: data.user.id, email: data.user.email } };
}

type AnalysisOption = 
  | 'color_palette' 
  | 'costume' 
  | 'facial_features' 
  | 'color_scheme' 
  | 'seasons' 
  | 'jewelry' 
  | 'clothing_cut';

const buildPrompt = (options: AnalysisOption[]): string => {
  const sections: string[] = [];
  
  sections.push(\`You are analyzing a painting for a personal color analysis system.
Analyze this painting and extract the requested elements.
Respond with JSON containing ONLY the sections requested below:\`);

  sections.push(\`
"title_suggestion": "A poetic title for this painting",
"artist_detected": "Artist name if recognizable",
"era_detected": "Time period of the painting",\`);

  if (options.includes('color_palette')) {
    sections.push(\`
"colors": {
  "dominant": ["List 2-3 dominant colors"],
  "accent": ["Accent colors"],
  "warmth": "warm or cool or neutral"
},\`);
  }

  if (options.includes('costume')) {
    sections.push(\`
"fabrics": {
  "primary": ["Main fabric(s) - Velvet, Silk, Satin, etc."],
  "secondary": ["Other fabrics"],
  "texture_notes": "Description of fabric textures"
},\`);
  }

  if (options.includes('seasons')) {
    sections.push(\`
"seasonal_analysis": {
  "primary_season": "Spring or Summer or Autumn or Winter",
  "subtype_suggestion": "Specific subtype name",
  "reasoning": "Why this painting fits this season"
},\`);
  }

  if (options.includes('jewelry')) {
    sections.push(\`
"jewelry_accessories": {
  "items": ["Jewelry pieces visible"],
  "metals": ["Gold, Silver, etc."],
  "style": "Overall jewelry style"
},\`);
  }

  if (options.includes('clothing_cut')) {
    sections.push(\`
"clothing_cut": {
  "silhouette": { "primary": "Main silhouette" },
  "neckline": "Primary neckline style",
  "sleeves": "Sleeve style"
},\`);
  }

  sections.push(\`
"best_for": ["What this painting best demonstrates"],
"client_talking_points": ["2-3 bullet points for clients"]\`);

  return sections.join('\\n') + '\\n\\nWrap your response in a valid JSON object.';
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64, imageUrl, analysisOptions } = await req.json();
    
    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Either imageBase64 or imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = analysisOptions?.length > 0 
      ? buildPrompt(analysisOptions)
      : "Analyze this painting for fabrics, silhouette, colors, mood, and seasonal palette.";

    const imageContent = imageBase64 
      ? { type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${imageBase64}\` } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${LOVABLE_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [{ role: "user", content: [{ type: "text", text: prompt }, imageContent] }],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(\`AI gateway error: \${response.status}\`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysis;
    const jsonMatch = content?.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      analysis = JSON.parse(jsonMatch[0]);
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-painting error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
`,

  'supabase/functions/fetch-museum-art/index.ts': `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  museum: string;
  isPublicDomain: boolean;
}

// Art Institute of Chicago
async function searchArtInstitute(query: string, limit = 20): Promise<MuseumArtwork[]> {
  const searchUrl = \`https://api.artic.edu/api/v1/artworks/search?q=\${encodeURIComponent(query)}&query[term][is_public_domain]=true&fields=id,title,artist_display,date_display,image_id&limit=\${limit}\`;
  
  const response = await fetch(searchUrl);
  if (!response.ok) throw new Error(\`AIC API error: \${response.status}\`);
  
  const data = await response.json();
  
  return data.data
    .filter((item: any) => item.image_id)
    .map((item: any) => ({
      id: \`aic-\${item.id}\`,
      title: item.title || 'Untitled',
      artist: item.artist_display || 'Unknown',
      date: item.date_display || '',
      imageUrl: \`https://www.artic.edu/iiif/2/\${item.image_id}/full/843,/0/default.jpg\`,
      thumbnailUrl: \`https://www.artic.edu/iiif/2/\${item.image_id}/full/200,/0/default.jpg\`,
      museum: 'Art Institute of Chicago',
      isPublicDomain: true
    }));
}

// Metropolitan Museum of Art
async function searchMetMuseum(query: string, limit = 20): Promise<MuseumArtwork[]> {
  const searchUrl = \`https://collectionapi.metmuseum.org/public/collection/v1/search?q=\${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true\`;
  
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) throw new Error(\`Met API error: \${searchResponse.status}\`);
  
  const searchData = await searchResponse.json();
  const objectIds = (searchData.objectIDs || []).slice(0, limit);
  
  const artworks: MuseumArtwork[] = [];
  
  for (const id of objectIds) {
    try {
      const detailUrl = \`https://collectionapi.metmuseum.org/public/collection/v1/objects/\${id}\`;
      const detailResponse = await fetch(detailUrl);
      
      if (detailResponse.ok) {
        const item = await detailResponse.json();
        if (item.primaryImage && item.isPublicDomain) {
          artworks.push({
            id: \`met-\${item.objectID}\`,
            title: item.title || 'Untitled',
            artist: item.artistDisplayName || 'Unknown',
            date: item.objectDate || '',
            imageUrl: item.primaryImage,
            thumbnailUrl: item.primaryImageSmall || item.primaryImage,
            museum: 'Metropolitan Museum of Art',
            isPublicDomain: true
          });
        }
      }
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      console.error(\`Failed to fetch Met object \${id}:\`, e);
    }
  }
  
  return artworks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, museum, limit = 20 } = await req.json();
    let results: MuseumArtwork[] = [];

    if (action === 'search') {
      const searchQuery = query || 'portrait woman';
      
      if (museum === 'aic' || museum === 'all') {
        results = [...results, ...await searchArtInstitute(searchQuery, limit)];
      }
      if (museum === 'met' || museum === 'all') {
        results = [...results, ...await searchMetMuseum(searchQuery, limit)];
      }
    }

    return new Response(
      JSON.stringify({ results, count: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("fetch-museum-art error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
`,
};

export function ExportPaintingsBundle() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      const totalFiles = Object.keys(PAINTING_FILES).length + Object.keys(STATIC_FILES).length;
      let processed = 0;

      // Add static files
      for (const [path, content] of Object.entries(STATIC_FILES)) {
        zip.file(path, content);
        processed++;
        setProgress(Math.round((processed / totalFiles) * 100));
      }

      // Add dynamic files
      for (const [path, importFn] of Object.entries(PAINTING_FILES)) {
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
      a.download = `paintings-bundle-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Paintings bundle exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export paintings bundle');
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-amber-500/10">
          <Palette className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Export Paintings Bundle</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download all painting library components, database schemas, and edge functions for palette curation.
          </p>
          
          <div className="text-xs text-muted-foreground mb-4 space-y-1">
            <p>• 7 painting components + 5 hub components</p>
            <p>• Paintings page & types</p>
            <p>• Database migrations (table, storage, indexes)</p>
            <p>• Edge functions (analyze-painting, fetch-museum-art)</p>
            <p>• Vocabulary, fabrics & subtypes data</p>
          </div>

          {isExporting && (
            <div className="mb-4">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bundling files... {progress}%
              </p>
            </div>
          )}

          <Button onClick={handleExport} disabled={isExporting} variant="outline" className="border-amber-500/50 hover:bg-amber-500/10">
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
