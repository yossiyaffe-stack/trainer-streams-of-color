import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  LayoutGrid, 
  Square, 
  Palette,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { PaintingDetailModal } from './PaintingDetailModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

type ViewMode = 'compact' | 'grid' | 'large';
type SourceFilter = 'all' | 'uploaded' | 'museum';

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-amber-100 text-amber-800',
  Summer: 'bg-blue-100 text-blue-800',
  Autumn: 'bg-orange-100 text-orange-800',
  Winter: 'bg-purple-100 text-purple-800',
};

const QUICK_FILTERS = [
  { label: '👗 Gowns & Dresses', query: 'gown dress' },
  { label: '👸 Portraits', query: 'portrait' },
  { label: '🎨 Renaissance', query: 'renaissance' },
  { label: '💎 Jewelry', query: 'jewels jewelry pearls' },
  { label: '🌸 Romantic Era', query: 'romantic' },
  { label: '🖼️ Pre-Raphaelite', query: 'pre-raphaelite' },
  { label: '👑 Nobility', query: 'duchess queen noble' },
  { label: '🌺 Impressionist', query: 'impressionist' },
];

const SEASON_FILTERS = [
  { label: 'Spring', emoji: '🌷' },
  { label: 'Summer', emoji: '☀️' },
  { label: 'Autumn', emoji: '🍂' },
  { label: 'Winter', emoji: '❄️' },
];

const ITEMS_PER_PAGE_OPTIONS = [20, 40, 60, 100];

export function UnifiedGallery() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(40);

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

  const handleDeletePainting = async (id: string) => {
    const { error } = await supabase.from('paintings').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete painting');
    } else {
      setPaintings(prev => prev.filter(p => p.id !== id));
      toast.success('Painting deleted');
    }
  };

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

      {/* Quick Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map(qf => (
            <Badge
              key={qf.query}
              variant={searchQuery === qf.query ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-2 py-1 text-xs"
              onClick={() => setSearchQuery(searchQuery === qf.query ? '' : qf.query)}
            >
              {qf.label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs text-muted-foreground">By Season:</span>
          {SEASON_FILTERS.map(s => (
            <Badge
              key={s.label}
              variant={selectedSeason === s.label ? 'default' : 'secondary'}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
              onClick={() => setSelectedSeason(selectedSeason === s.label ? null : s.label)}
            >
              {s.emoji} {s.label}
            </Badge>
          ))}
          {(searchQuery || selectedSeason) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => { setSearchQuery(''); setSelectedSeason(null); }}
            >
              Clear filters
            </Button>
          )}
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
            Upload paintings or import from museum collections in the Upload tab
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
              
              {/* Delete button - always visible */}
              <button
                className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-black/70 hover:bg-destructive flex items-center justify-center transition-colors cursor-pointer shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePainting(painting.id);
                }}
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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

              {/* Season Badge - bottom left to avoid delete button */}
              {painting.suggested_season && (
                <Badge 
                  className={`absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 ${SEASON_COLORS[painting.suggested_season] || 'bg-muted'}`}
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
