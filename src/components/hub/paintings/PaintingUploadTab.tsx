import { useState, useCallback, useEffect } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusDot } from '../StatusDot';
import { 
  Upload, 
  Loader2, 
  Search, 
  Download, 
  Building2, 
  Check,
  FolderUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Painting } from '@/types/paintings';
import type { HubPainting } from '@/types/hub';

interface MuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  museum: string;
  department?: string;
  medium?: string;
  isPublicDomain: boolean;
}

const QUICK_SEARCHES = [
  { label: '👗 Gowns', query: 'gown dress woman' },
  { label: '👸 Portraits', query: 'portrait woman lady' },
  { label: '🎨 Renaissance', query: 'renaissance portrait woman' },
  { label: '💎 Jewelry', query: 'woman pearls jewels' },
  { label: '🌸 Romantic', query: 'romantic era portrait woman' },
];

const SEASON_SEARCHES = [
  { label: 'Spring', query: 'spring flowers pastel woman', emoji: '🌷' },
  { label: 'Summer', query: 'summer bright colors woman', emoji: '☀️' },
  { label: 'Autumn', query: 'autumn warm tones rich colors', emoji: '🍂' },
  { label: 'Winter', query: 'winter deep colors velvet', emoji: '❄️' },
];

export function PaintingUploadTab() {
  const { paintings, addPaintings, setPaintings } = useHub();
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeSource, setActiveSource] = useState<'local' | 'museum'>('local');

  // Museum search states
  const [searchQuery, setSearchQuery] = useState('');
  const [museumResults, setMuseumResults] = useState<MuseumArtwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeMuseum, setActiveMuseum] = useState<'all' | 'aic' | 'met'>('all');

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

  // Museum search functions
  const searchMuseums = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setSearching(true);
    setMuseumResults([]);
    setSelectedIds(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('fetch-museum-art', {
        body: { action: 'search', query, museum: activeMuseum, limit: 30 }
      });

      if (error) throw error;
      setMuseumResults(data.results || []);
      
      if (data.results?.length === 0) {
        toast.info('No public domain artworks found. Try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search museums. Please try again.');
    } finally {
      setSearching(false);
    }
  }, [activeMuseum]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === museumResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(museumResults.map(r => r.id)));
    }
  };

  const importSelected = async () => {
    const toImport = museumResults.filter(r => selectedIds.has(r.id));
    if (toImport.length === 0) return;

    setImporting(true);
    let imported = 0;

    for (const artwork of toImport) {
      try {
        const { data: insertedPainting, error: insertError } = await supabase
          .from('paintings')
          .insert({
            image_url: artwork.imageUrl,
            thumbnail_url: artwork.thumbnailUrl,
            original_filename: `${artwork.museum}-${artwork.id}`,
            title: artwork.title,
            artist: artwork.artist,
            era: artwork.date,
            status: 'pending',
            notes: `Imported from ${artwork.museum}. ${artwork.medium || ''}`
          })
          .select()
          .single();

        if (!insertError && insertedPainting) {
          imported++;
          
          setPaintings(prev => [{
            id: insertedPainting.id,
            dbId: insertedPainting.id,
            preview: artwork.thumbnailUrl,
            imageUrl: artwork.imageUrl,
            filename: `${artwork.museum}-${artwork.id}`,
            status: 'pending',
            title: artwork.title,
            analysis: null,
            linkedSubtypes: [],
            notes: `Imported from ${artwork.museum}`,
            uploadedAt: new Date().toISOString(),
            artistDetected: artwork.artist,
            eraDetected: artwork.date
          }, ...prev]);
        }
      } catch (error) {
        console.error('Import error for', artwork.id, error);
      }
    }

    setImporting(false);
    setSelectedIds(new Set());
    toast.success(`Imported ${imported} paintings! Ready for AI analysis.`);
  };

  const pendingCount = paintings.filter(p => p.status === 'pending' && p.file).length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Source Toggle */}
      <Tabs value={activeSource} onValueChange={(v) => setActiveSource(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="local" className="gap-2">
            <FolderUp className="w-4 h-4" />
            Local Files
          </TabsTrigger>
          <TabsTrigger value="museum" className="gap-2">
            <Building2 className="w-4 h-4" />
            Museum Collections
          </TabsTrigger>
        </TabsList>

        {/* Local Upload Content */}
        <TabsContent value="local" className="mt-6">
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
        </TabsContent>

        {/* Museum Import Content */}
        <TabsContent value="museum" className="mt-6 space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for portraits, gowns, Renaissance art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchMuseums(searchQuery)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'aic', label: 'Chicago' },
                { id: 'met', label: 'Met NYC' }
              ].map(m => (
                <Button
                  key={m.id}
                  variant={activeMuseum === m.id ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveMuseum(m.id as any)}
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <Button onClick={() => searchMuseums(searchQuery)} disabled={searching}>
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(qs => (
              <Badge
                key={qs.query}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  setSearchQuery(qs.query);
                  searchMuseums(qs.query);
                }}
              >
                {qs.label}
              </Badge>
            ))}
            <span className="text-muted-foreground mx-2">|</span>
            {SEASON_SEARCHES.map(s => (
              <Badge
                key={s.label}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setSearchQuery(s.query);
                  searchMuseums(s.query);
                }}
              >
                {s.emoji} {s.label}
              </Badge>
            ))}
          </div>

          {/* Results Grid */}
          {museumResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    {selectedIds.size === museumResults.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {museumResults.length} found • {selectedIds.size} selected
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <Button onClick={importSelected} disabled={importing}>
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Import {selectedIds.size}
                      </>
                    )}
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {museumResults.map(artwork => (
                    <Card
                      key={artwork.id}
                      className={cn(
                        'relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-accent',
                        selectedIds.has(artwork.id) && 'ring-2 ring-primary'
                      )}
                      onClick={() => toggleSelect(artwork.id)}
                    >
                      <div className="aspect-[3/4] relative">
                        <img
                          src={artwork.thumbnailUrl}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className={cn(
                          'absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity',
                          selectedIds.has(artwork.id) ? 'opacity-100' : 'opacity-0'
                        )}>
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="absolute bottom-1 left-1 text-[9px] bg-background/80 px-1"
                        >
                          {artwork.museum.includes('Chicago') ? 'AIC' : 'Met'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty/Loading States */}
          {searching && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-accent" />
              <p className="text-muted-foreground text-sm">Searching museums...</p>
            </div>
          )}
          
          {!searching && museumResults.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Search museum collections above</p>
              <p className="text-sm">or click a quick search tag</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
