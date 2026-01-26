import { useState, useCallback, useEffect } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { StatusDot } from '../StatusDot';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Painting } from '@/types/paintings';
import type { HubPainting } from '@/types/hub';

export function PaintingUploadTab() {
  const { paintings, addPaintings, paintingAnalyzing, paintingStats, setPaintings } = useHub();
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Load existing paintings from database on mount
  useEffect(() => {
    loadPaintingsFromDb();
  }, []);

  const loadPaintingsFromDb = async () => {
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      const dbPaintings: HubPainting[] = data.map((row) => {
        const p = row as unknown as Painting;
        return {
          id: p.id,
          dbId: p.id,
          preview: p.image_url,
          imageUrl: p.image_url,
          filename: p.original_filename || 'painting.jpg',
          status: p.status === 'analyzed' ? 'analyzed' as const : p.status === 'reviewed' ? 'reviewed' as const : 'pending' as const,
          title: p.title || '',
          analysis: p.ai_analysis || null,
          linkedSubtypes: [],
          notes: p.notes || '',
          uploadedAt: p.created_at || new Date().toISOString(),
          analyzedAt: p.analyzed_at || undefined,
          paletteEffect: p.palette_effect || undefined,
          artistDetected: p.artist || undefined,
          eraDetected: p.era || undefined,
          suggestedSeason: p.suggested_season || undefined
        };
      });
      setPaintings(dbPaintings);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addPaintings(files);
  }, [addPaintings]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addPaintings(files);
  }, [addPaintings]);

  const analyzePaintings = async () => {
    const pending = paintings.filter(p => p.status === 'pending' && p.file);
    if (pending.length === 0) return;

    setAnalyzing(true);

    for (const painting of pending) {
      if (!painting.file) continue;

      setPaintings(prev => prev.map(p => p.id === painting.id ? { ...p, status: 'analyzing' } : p));

      try {
        // Upload to storage
        const filename = `${Date.now()}-${painting.filename}`;
        const { error: uploadError } = await supabase.storage
          .from('paintings')
          .upload(filename, painting.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('paintings')
          .getPublicUrl(filename);

        // Call analyze edge function
        const { data: analysisData, error: analysisError } = await supabase.functions
          .invoke('analyze-painting', {
            body: { imageUrl: publicUrl }
          });

        if (analysisError) throw analysisError;

        const analysis = analysisData.analysis;

        // Insert into database
        const { data: insertedPainting, error: insertError } = await supabase
          .from('paintings')
          .insert({
            image_url: publicUrl,
            original_filename: painting.filename,
            title: analysis.title_suggestion,
            artist: analysis.artist_detected,
            era: analysis.era_detected,
            fabrics: analysis.fabrics?.primary,
            silhouette: analysis.silhouette?.primary,
            neckline: analysis.neckline,
            sleeves: analysis.sleeves,
            color_mood: analysis.colors?.color_mood,
            palette_effect: analysis.palette_effect,
            prints_patterns: analysis.prints_patterns,
            jewelry_types: analysis.jewelry_accessories?.types,
            mood_primary: analysis.mood?.primary,
            mood_secondary: analysis.mood?.secondary,
            suggested_season: analysis.suggested_seasons?.primary,
            best_for: analysis.best_for,
            client_talking_points: analysis.client_talking_points,
            ai_analysis: analysis,
            status: 'analyzed',
            analyzed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update local state
        setPaintings(prev => prev.map(p => p.id === painting.id ? {
          ...p,
          status: 'analyzed',
          dbId: insertedPainting.id,
          imageUrl: publicUrl,
          preview: publicUrl,
          title: analysis.title_suggestion || '',
          analysis,
          paletteEffect: analysis.palette_effect,
          artistDetected: analysis.artist_detected,
          eraDetected: analysis.era_detected,
          suggestedSeason: analysis.suggested_seasons?.primary,
          analyzedAt: new Date().toISOString()
        } : p));
      } catch (error) {
        console.error('Analysis error:', error);
        setPaintings(prev => prev.map(p => p.id === painting.id ? { ...p, status: 'error' } : p));
      }
    }

    setAnalyzing(false);
  };

  const pendingCount = paintings.filter(p => p.status === 'pending' && p.file).length;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center transition-colors bg-card',
          dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-muted-foreground'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-5xl mb-4">🖼️</div>
        <h3 className="text-xl font-medium mb-2">Upload Paintings</h3>
        <p className="text-muted-foreground mb-4">AI will analyze fabrics, silhouettes, colors & more</p>
        <label className="inline-block">
          <Button variant="secondary" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />
        </label>
      </div>

      {/* Action Bar */}
      {pendingCount > 0 && (
        <div className="mt-6 flex items-center justify-between bg-card rounded-lg shadow-elegant p-4">
          <span className="text-sm">
            <strong className="text-accent">{pendingCount}</strong> paintings pending analysis
          </span>
          <Button onClick={analyzePaintings} disabled={analyzing}>
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>🔍 Analyze {pendingCount} Paintings</>
            )}
          </Button>
        </div>
      )}

      {/* Recent Preview */}
      {paintings.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Recent Uploads ({paintings.length})</h3>
          <div className="grid grid-cols-8 gap-2">
            {paintings.slice(0, 16).map(p => (
              <div key={p.id} className="relative aspect-[3/4] rounded overflow-hidden">
                <img src={p.preview} alt="" className="w-full h-full object-cover" />
                <StatusDot status={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
