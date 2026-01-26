import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Loader2, 
  Check, 
  AlertCircle, 
  X, 
  Eye, 
  Save,
  Building2,
  Search,
  Download,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { PaintingDetailModal } from './PaintingDetailModal';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

interface PaintingUploadProps {
  onUploadComplete?: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  paintingData?: Painting;
}

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
  { label: '👗 Gowns & Dresses', query: 'gown dress woman' },
  { label: '👸 Portraits', query: 'portrait woman lady' },
  { label: '🎨 Renaissance', query: 'renaissance portrait woman' },
  { label: '💎 Jewelry', query: 'woman pearls jewels necklace' },
  { label: '🌸 Romantic Era', query: 'romantic era portrait woman' },
  { label: '🖼️ Pre-Raphaelite', query: 'pre-raphaelite woman' },
  { label: '👑 Nobility', query: 'duchess queen noblewoman portrait' },
  { label: '🌺 Impressionist', query: 'impressionist portrait woman renoir' },
];

const SEASON_SEARCHES = [
  { label: 'Spring', query: 'spring flowers pastel woman portrait', emoji: '🌷' },
  { label: 'Summer', query: 'summer bright colors outdoor woman', emoji: '☀️' },
  { label: 'Autumn', query: 'autumn warm tones rich colors portrait', emoji: '🍂' },
  { label: 'Winter', query: 'winter deep colors velvet portrait woman', emoji: '❄️' },
];

// Nechama's Favorite Artists (from docs/fetch_paintings_reference.py)
const FAVORITE_ARTISTS = [
  { name: 'Claude Monet', query: 'monet', subtypes: 'Ballerina Summer, Water Lily Summer, Chinoiserie Summer' },
  { name: 'Johannes Vermeer', query: 'vermeer', subtypes: 'Summer Rose, Porcelain Winter, Renaissance Autumn' },
  { name: 'Leonardo da Vinci', query: 'da-vinci leonardo', subtypes: 'Sunlit Autumn, Tapestry Winter, Mediterranean Winter' },
  { name: 'Amedeo Modigliani', query: 'modigliani', subtypes: 'Mellow Autumn, Tapestry Winter, Burnished Autumn' },
  { name: 'Jean-Baptiste-Camille Corot', query: 'corot', subtypes: 'Burnished Autumn, Mellow Autumn, Tapestry Autumn' },
  { name: 'Mary Cassatt', query: 'cassatt', subtypes: 'French Spring, Ballerina Summer' },
  { name: 'Pierre-Auguste Renoir', query: 'renoir', subtypes: 'French Spring' },
  { name: 'John Singer Sargent', query: 'sargent', subtypes: 'Cloisonne Autumn, Renaissance Autumn, Cameo Summer' },
  { name: 'Dante Gabriel Rossetti', query: 'rossetti', subtypes: 'Water Lily Summer, Cloisonne Autumn' },
  { name: 'Edgar Degas', query: 'degas', subtypes: 'Degas Summer, Cameo Summer' },
  { name: 'Henri Matisse', query: 'matisse', subtypes: 'Crystal Winter, Water Lily Summer' },
  { name: 'Pablo Picasso', query: 'picasso', subtypes: 'Crystal Winter' },
  { name: 'Vincent van Gogh', query: 'van-gogh', subtypes: 'Sunlit Autumn' },
  { name: 'Paul Gauguin', query: 'gauguin', subtypes: 'Burnished Autumn, Multi-Colored Autumn' },
  { name: 'Édouard Manet', query: 'manet', subtypes: 'Chinoiserie Summer, Cameo Summer' },
  { name: 'El Greco', query: 'el-greco', subtypes: 'Mediterranean Winter' },
  { name: 'Ingres', query: 'ingres', subtypes: 'Cameo Summer' },
  { name: 'Odilon Redon', query: 'odilon-redon', subtypes: 'French Spring' },
];

// Additional master artists
const MORE_ARTISTS = [
  { name: 'Alphonse Mucha', query: 'mucha', movement: 'Art Nouveau' },
  { name: 'Caravaggio', query: 'caravaggio', movement: 'Baroque' },
  { name: 'Gustav Klimt', query: 'klimt', movement: 'Art Nouveau' },
  { name: 'Raphael', query: 'raphael', movement: 'High Renaissance' },
  { name: 'Rembrandt', query: 'rembrandt', movement: 'Dutch Golden Age' },
  { name: 'Botticelli', query: 'botticelli', movement: 'Early Renaissance' },
  { name: 'Titian', query: 'titian', movement: 'Venetian Renaissance' },
  { name: 'Waterhouse', query: 'waterhouse', movement: 'Pre-Raphaelite' },
  { name: 'Alma-Tadema', query: 'alma-tadema', movement: 'Victorian Classicism' },
  { name: 'Lord Leighton', query: 'leighton frederic', movement: 'Victorian Classicism' },
];

export function PaintingUpload({ onUploadComplete }: PaintingUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [recentPaintings, setRecentPaintings] = useState<Painting[]>([]);

  // Museum import state
  
  const [museumQuery, setMuseumQuery] = useState('');
  const [museumResults, setMuseumResults] = useState<MuseumArtwork[]>([]);
  const [selectedMuseumIds, setSelectedMuseumIds] = useState<Set<string>>(new Set());
  const [museumLoading, setMuseumLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeMuseum, setActiveMuseum] = useState<'all' | 'aic' | 'met' | 'cma'>('all');

  // Load recent paintings from database on mount
  useEffect(() => {
    fetchRecentPaintings();
  }, []);

  const fetchRecentPaintings = async () => {
    // Fetch only user-uploaded paintings (exclude museum imports)
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .not('notes', 'ilike', '%Imported from%')
      .order('created_at', { ascending: false })
      .limit(12);
    
    if (data && !error) {
      const paintings = data.map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
      })) as Painting[];
      setRecentPaintings(paintings);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadingFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const saveToGallery = async () => {
    setIsProcessing(true);
    
    for (const uploadFile of files.filter(f => f.status === 'pending')) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 20 } : f
        ));

        // Upload to storage
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `paintings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('paintings')
          .upload(filePath, uploadFile.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('paintings')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: 70 } : f
        ));

        // Save to database WITHOUT analysis
        const paintingRecord = {
          image_url: imageUrl,
          thumbnail_url: imageUrl,
          original_filename: uploadFile.file.name,
          title: uploadFile.file.name.replace(/\.[^/.]+$/, ''), // Use filename as title
          status: 'pending', // Not analyzed yet
        };

        const { data: savedPainting, error: dbError } = await supabase
          .from('paintings')
          .insert(paintingRecord)
          .select()
          .single();

        if (dbError) throw dbError;

        // Store the painting data for viewing
        const typedPainting = {
          ...savedPainting,
          ai_analysis: savedPainting.ai_analysis as PaintingAnalysis | null,
        } as Painting;

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100, paintingData: typedPainting } : f
        ));

        toast.success(`Saved: ${uploadFile.file.name}`);

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } 
            : f
        ));
        toast.error(`Failed to save ${uploadFile.file.name}`);
      }
    }

    setIsProcessing(false);
    
    // Refresh recent paintings list
    await fetchRecentPaintings();
    
    const successCount = files.filter(f => f.status === 'complete').length;
    if (successCount > 0) {
      toast.success(`Saved ${successCount} painting(s) to gallery! Click any painting to analyze it.`);
      setFiles([]);
      onUploadComplete?.();
    }
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const handlePaintingUpdate = async () => {
    await fetchRecentPaintings();
    setSelectedPainting(null);
  };

  // Museum search functions
  const searchMuseums = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setMuseumLoading(true);
    setMuseumResults([]);
    setSelectedMuseumIds(new Set());

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
      setMuseumLoading(false);
    }
  }, [activeMuseum]);

  const toggleMuseumSelect = (id: string) => {
    setSelectedMuseumIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllMuseum = () => {
    if (selectedMuseumIds.size === museumResults.length) {
      setSelectedMuseumIds(new Set());
    } else {
      setSelectedMuseumIds(new Set(museumResults.map(r => r.id)));
    }
  };

  const importSelected = async () => {
    const toImport = museumResults.filter(r => selectedMuseumIds.has(r.id));
    if (toImport.length === 0) return;

    setImporting(true);
    let imported = 0;

    for (const artwork of toImport) {
      try {
        const { error: insertError } = await supabase
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
          });

        if (!insertError) {
          imported++;
        }
      } catch (error) {
        console.error('Import error for', artwork.id, error);
      }
    }

    setImporting(false);
    setSelectedMuseumIds(new Set());
    setMuseumResults([]);
    toast.success(`Imported ${imported} paintings to gallery!`);
    onUploadComplete?.();
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const completedCount = files.filter(f => f.status === 'complete').length;

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="painting-upload"
        />
        <label htmlFor="painting-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-lg">Drop paintings here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP • Save first, then analyze from gallery
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Museum Import Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Import from Museum Collections</h3>
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Chicago • The Met • Cleveland
          </Badge>
        </div>
        
        <Card className="p-4 border-accent/30 bg-accent/5">
          <Card className="p-4 border-accent/30 bg-accent/5">
            <div className="space-y-4">
              {/* Museum Search */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for portraits, gowns, Renaissance art..."
                    value={museumQuery}
                    onChange={(e) => setMuseumQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchMuseums(museumQuery)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'aic', label: 'Chicago' },
                    { id: 'met', label: 'Met' },
                    { id: 'cma', label: 'Cleveland' }
                  ].map(m => (
                    <Button
                      key={m.id}
                      variant={activeMuseum === m.id ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveMuseum(m.id as 'all' | 'aic' | 'met' | 'cma')}
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => searchMuseums(museumQuery)} disabled={museumLoading}>
                  {museumLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="ml-2">Search</span>
                </Button>
              </div>

              {/* Quick Search Tags */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {QUICK_SEARCHES.map(qs => (
                    <Badge
                      key={qs.query}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-2 py-1 text-xs"
                      onClick={() => {
                        setMuseumQuery(qs.query);
                        searchMuseums(qs.query);
                      }}
                    >
                      {qs.label}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-xs text-muted-foreground">By Season:</span>
                  {SEASON_SEARCHES.map(s => (
                    <Badge
                      key={s.label}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                      onClick={() => {
                        setMuseumQuery(s.query);
                        searchMuseums(s.query);
                      }}
                    >
                      {s.emoji} {s.label}
                    </Badge>
                  ))}
                </div>
                
                {/* Favorite Artists */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">⭐ Favorite Artists</span>
                    <span className="text-[10px] text-muted-foreground">(Nechama's references - hover for subtypes)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {FAVORITE_ARTISTS.map(artist => (
                      <Badge
                        key={artist.query}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-2 py-0.5 text-xs border-primary/40"
                        onClick={() => {
                          setMuseumQuery(artist.name);
                          searchMuseums(artist.query);
                        }}
                        title={artist.subtypes}
                      >
                        {artist.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* More Artists */}
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">More masters:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {MORE_ARTISTS.map(artist => (
                      <Badge
                        key={artist.query}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-2 py-0.5 text-xs"
                        onClick={() => {
                          setMuseumQuery(artist.name);
                          searchMuseums(artist.query);
                        }}
                        title={artist.movement}
                      >
                        {artist.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Museum Results */}
              <AnimatePresence>
                {museumResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={selectAllMuseum}>
                          {selectedMuseumIds.size === museumResults.length ? 'Deselect All' : 'Select All'}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          {museumResults.length} artworks found • {selectedMuseumIds.size} selected
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setMuseumResults([])}>
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                        {selectedMuseumIds.size > 0 && (
                          <Button onClick={importSelected} disabled={importing}>
                            {importing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Import {selectedMuseumIds.size} to Gallery
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {museumResults.map(artwork => (
                          <Card
                            key={artwork.id}
                            className={cn(
                              'relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-accent group',
                              selectedMuseumIds.has(artwork.id) && 'ring-2 ring-primary'
                            )}
                            onClick={() => toggleMuseumSelect(artwork.id)}
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
                                selectedMuseumIds.has(artwork.id) ? 'opacity-100' : 'opacity-0'
                              )}>
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </div>
                              </div>
                              <div className="absolute top-1 left-1">
                                <Checkbox
                                  checked={selectedMuseumIds.has(artwork.id)}
                                  className="bg-background/80 h-4 w-4"
                                  onClick={(e) => e.stopPropagation()}
                                  onCheckedChange={() => toggleMuseumSelect(artwork.id)}
                                />
                              </div>
                              <Badge 
                                variant="secondary" 
                                className="absolute bottom-1 left-1 text-[9px] px-1 py-0 bg-background/80"
                              >
                                {artwork.museum.includes('Chicago') ? 'AIC' : 'Met'}
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Museum Loading */}
              {museumLoading && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">Searching museum collections...</p>
                </div>
              )}

              {/* Museum Empty State */}
              {!museumLoading && museumResults.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Search museum collections above or click a quick tag</p>
                </div>
              )}
            </div>
          </Card>
        </Card>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Prominent Save Button */}
          {pendingCount > 0 && (
            <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                📸 {pendingCount} painting{pendingCount > 1 ? 's' : ''} ready to save!
              </h3>
              <p className="text-muted-foreground mb-4">
                Save to gallery first, then analyze individual paintings with custom options
              </p>
              <Button 
                size="lg" 
                onClick={saveToGallery} 
                disabled={isProcessing}
                className="text-lg px-8 py-5 h-auto font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving to Gallery...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    💾 Save {pendingCount} to Gallery
                  </>
                )}
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {pendingCount} pending • {completedCount} complete
            </h3>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative aspect-square rounded-lg overflow-hidden border border-border group ${
                  file.status === 'complete' ? 'cursor-pointer hover:border-primary' : ''
                }`}
                onClick={() => {
                  if (file.status === 'complete' && file.paintingData) {
                    setSelectedPainting(file.paintingData);
                  }
                }}
              >
                <img
                  src={file.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button for pending files */}
                {file.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles(prev => prev.filter(f => f.id !== file.id));
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                
                {/* Status Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                  file.status === 'complete' ? 'bg-green-500/80 group-hover:bg-primary/80' :
                  file.status === 'error' ? 'bg-red-500/80' :
                  file.status !== 'pending' ? 'bg-black/60' : ''
                }`}>
                  {file.status === 'uploading' && (
                    <div className="text-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">Saving...</p>
                    </div>
                  )}
                  {file.status === 'complete' && (
                    <div className="text-center text-white">
                      <div className="group-hover:hidden">
                        <Check className="w-8 h-8" />
                      </div>
                      <div className="hidden group-hover:block">
                        <Eye className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs font-medium">View & Analyze</p>
                      </div>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="text-center text-white">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">{file.error || 'Error'}</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={file.progress} className="h-1 rounded-none" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Saved Paintings */}
      {recentPaintings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">📚 Recent Uploads ({recentPaintings.length})</h3>
            <p className="text-sm text-muted-foreground">Click to view & analyze</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentPaintings.map((painting) => (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border cursor-pointer group hover:border-primary hover:shadow-lg transition-all"
                onClick={() => setSelectedPainting(painting)}
              >
                <img
                  src={painting.thumbnail_url || painting.image_url}
                  alt={painting.title || 'Painting'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-medium truncate">{painting.title || 'Untitled'}</p>
                    {painting.status === 'pending' ? (
                      <span className="text-amber-300 text-[10px]">📋 Not analyzed yet</span>
                    ) : painting.suggested_season ? (
                      <span className="text-white/80 text-[10px]">{painting.suggested_season}</span>
                    ) : null}
                  </div>
                </div>
                {/* Status indicator */}
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  painting.status === 'analyzed' ? 'bg-green-500' : 'bg-amber-500'
                }`} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPainting && (
          <PaintingDetailModal
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            onDelete={handlePaintingUpdate}
            onUpdate={handlePaintingUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
