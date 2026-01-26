import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Grid3X3, 
  LayoutGrid, 
  Square, 
  Palette,
  Building2,
  Loader2,
  Download,
  Check,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { PaintingDetailModal } from './PaintingDetailModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

type ViewMode = 'compact' | 'grid' | 'large';
type SourceFilter = 'all' | 'uploaded' | 'museum';

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

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-amber-100 text-amber-800',
  Summer: 'bg-blue-100 text-blue-800',
  Autumn: 'bg-orange-100 text-orange-800',
  Winter: 'bg-purple-100 text-purple-800',
};

const ITEMS_PER_PAGE_OPTIONS = [20, 40, 60, 100];

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

export function UnifiedGallery() {
  // Gallery state
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(40);

  // Museum import state
  const [museumOpen, setMuseumOpen] = useState(false);
  const [museumQuery, setMuseumQuery] = useState('');
  const [museumResults, setMuseumResults] = useState<MuseumArtwork[]>([]);
  const [selectedMuseumIds, setSelectedMuseumIds] = useState<Set<string>>(new Set());
  const [museumLoading, setMuseumLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeMuseum, setActiveMuseum] = useState<'all' | 'aic' | 'met'>('all');

  useEffect(() => {
    fetchPaintings();
  }, []);

  const fetchPaintings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching paintings:', error);
    } else {
      const typedPaintings = (data || []).map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
      })) as Painting[];
      setPaintings(typedPaintings);
    }
    setLoading(false);
  };

  const isMuseumPainting = (p: Painting) => {
    return p.notes?.includes('Imported from') || 
           p.original_filename?.includes('AIC-') || 
           p.original_filename?.includes('Met-') ||
           p.original_filename?.includes('Art Institute of Chicago') ||
           p.original_filename?.includes('Metropolitan Museum');
  };

  const filteredPaintings = useMemo(() => {
    return paintings.filter(painting => {
      // Source filter
      if (sourceFilter === 'museum' && !isMuseumPainting(painting)) return false;
      if (sourceFilter === 'uploaded' && isMuseumPainting(painting)) return false;

      // Text search
      const matchesSearch = !searchQuery || 
        painting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painting.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painting.palette_effect?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painting.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Season filter
      const matchesSeason = !selectedSeason || painting.suggested_season === selectedSeason;

      return matchesSearch && matchesSeason;
    });
  }, [paintings, searchQuery, selectedSeason, sourceFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPaintings.length / itemsPerPage);
  const paginatedPaintings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPaintings.slice(start, start + itemsPerPage);
  }, [filteredPaintings, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSeason, sourceFilter, itemsPerPage]);

  // Museum search
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
    setMuseumOpen(false);
    toast.success(`Imported ${imported} paintings! They now appear in your gallery.`);
    fetchPaintings();
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12';
      case 'large':
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      default:
        return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8';
    }
  };

  const museumCount = paintings.filter(isMuseumPainting).length;
  const uploadedCount = paintings.length - museumCount;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className={cn('grid gap-3', getGridClasses())}>
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Museum Import Collapsible */}
      <Collapsible open={museumOpen} onOpenChange={setMuseumOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between border-dashed border-2 hover:border-accent hover:bg-accent/5"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Import from Museum Collections</span>
              <Badge variant="secondary" className="ml-2">
                Art Institute of Chicago • The Met
              </Badge>
            </div>
            <ChevronDown className={cn("w-4 h-4 transition-transform", museumOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="pt-4">
          <Card className="p-4 border-accent/30 bg-accent/5">
            {/* Museum Search */}
            <div className="space-y-4">
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
                    { id: 'met', label: 'Met NYC' }
                  ].map(m => (
                    <Button
                      key={m.id}
                      variant={activeMuseum === m.id ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveMuseum(m.id as 'all' | 'aic' | 'met')}
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
              <div className="space-y-2">
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
                <div className="flex gap-2 items-center">
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
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search paintings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources ({paintings.length})</SelectItem>
              <SelectItem value="uploaded">📤 Uploaded ({uploadedCount})</SelectItem>
              <SelectItem value="museum">🏛️ Museum ({museumCount})</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedSeason || 'all'} onValueChange={(v) => setSelectedSeason(v === 'all' ? null : v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="Spring">🌸 Spring</SelectItem>
              <SelectItem value="Summer">☀️ Summer</SelectItem>
              <SelectItem value="Autumn">🍂 Autumn</SelectItem>
              <SelectItem value="Winter">❄️ Winter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map(n => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'compact' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('compact')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'large' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('large')}
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
          
          <span className="text-sm text-muted-foreground">
            {filteredPaintings.length} paintings
          </span>
        </div>
      </div>

      {/* Pagination Controls - Top */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredPaintings.length)} of {filteredPaintings.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {paintings.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No paintings yet</h3>
          <p className="text-muted-foreground">
            Upload paintings or import from museum collections above
          </p>
        </div>
      )}

      {/* Grid */}
      <div className={cn('grid gap-3', getGridClasses())}>
        {paginatedPaintings.map((painting, index) => (
          <motion.div
            key={painting.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(index * 0.02, 0.3) }}
            onClick={() => setSelectedPainting(painting)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted hover:border-primary transition-colors">
              <img
                src={painting.thumbnail_url || painting.image_url}
                alt={painting.title || 'Painting'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="font-serif text-white text-xs font-medium line-clamp-1">
                    {painting.title || 'Untitled'}
                  </p>
                  {painting.artist && (
                    <p className="text-white/70 text-[10px] line-clamp-1">
                      {painting.artist}
                    </p>
                  )}
                </div>
              </div>

              {/* Season Badge */}
              {painting.suggested_season && (
                <Badge 
                  className={`absolute top-1 right-1 text-[10px] px-1.5 py-0.5 ${SEASON_COLORS[painting.suggested_season] || 'bg-muted'}`}
                >
                  {painting.suggested_season}
                </Badge>
              )}

              {/* Source indicator */}
              {isMuseumPainting(painting) && (
                <Badge 
                  variant="secondary"
                  className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/80"
                >
                  {painting.original_filename?.includes('AIC') || painting.original_filename?.includes('Art Institute') ? 'AIC' : 
                   painting.original_filename?.includes('Met') || painting.original_filename?.includes('Metropolitan') ? 'Met' : '🏛️'}
                </Badge>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPainting && (
        <PaintingDetailModal
          painting={selectedPainting}
          onClose={() => setSelectedPainting(null)}
          onDelete={() => {
            setSelectedPainting(null);
            fetchPaintings();
          }}
        />
      )}
    </div>
  );
}
