import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PaintingDetailModal } from './PaintingDetailModal';
import { Search, Star, Trash2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

const SEASON_COLORS = {
  spring: 'bg-spring/20 text-spring border-spring',
  summer: 'bg-summer/20 text-summer border-summer',
  autumn: 'bg-autumn/20 text-autumn border-autumn',
  winter: 'bg-winter/20 text-winter border-winter',
} as const;

export function PaletteGalleryTab() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);

  const fetchPalettePaintings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('paintings')
        .select('*')
        .or('status.eq.palette,tags.cs.{"Palette Painting"}')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to the Painting type
      const typedData = (data || []).map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
        corrections: p.corrections as Record<string, unknown> | null,
      })) as Painting[];
      
      setPaintings(typedData);
    } catch (error) {
      console.error('Error fetching palette paintings:', error);
      toast.error('Failed to load palette paintings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPalettePaintings();
  }, []);

  const filteredPaintings = paintings.filter(p => {
    const matchesSearch = !search || 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.artist?.toLowerCase().includes(search.toLowerCase()) ||
      p.palette_effect?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSeason = seasonFilter === 'all' || 
      p.suggested_season?.toLowerCase() === seasonFilter.toLowerCase();
    
    return matchesSearch && matchesSeason;
  });

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRemoveFromPalette = async (ids: string[]) => {
    try {
      for (const id of ids) {
        const painting = paintings.find(p => p.id === id);
        if (!painting) continue;

        const updatedTags = (painting.tags || []).filter(t => t !== 'Palette Painting');
        
        await supabase
          .from('paintings')
          .update({ 
            status: 'analyzed',
            tags: updatedTags 
          })
          .eq('id', id);
      }

      toast.success(`Removed ${ids.length} painting(s) from palette`);
      setSelectedIds(new Set());
      fetchPalettePaintings();
    } catch (error) {
      console.error('Error removing from palette:', error);
      toast.error('Failed to remove from palette');
    }
  };

  const handlePaintingUpdate = () => {
    fetchPalettePaintings();
    setSelectedPainting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-6 border-2 border-primary/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary fill-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold">Palette Gallery</h2>
            <p className="text-muted-foreground">Your curated collection of reference paintings</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary" className="text-lg px-4 py-1">
            <Sparkles className="w-4 h-4 mr-2" />
            {paintings.length} Paintings
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card rounded-xl p-4 border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, artist, palette effect..."
            className="pl-10"
          />
        </div>
        
        <Select value={seasonFilter} onValueChange={setSeasonFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seasons</SelectItem>
            <SelectItem value="spring">🌸 Spring</SelectItem>
            <SelectItem value="summer">☀️ Summer</SelectItem>
            <SelectItem value="autumn">🍂 Autumn</SelectItem>
            <SelectItem value="winter">❄️ Winter</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Remove ({selectedIds.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove from Palette?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {selectedIds.size} painting(s) from your palette collection. 
                  The paintings will still be available in your gallery.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleRemoveFromPalette(Array.from(selectedIds))}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Empty State */}
      {filteredPaintings.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
          <Star className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Palette Paintings Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Save paintings to your palette from the gallery or after uploading. 
            These become your curated reference collection for client consultations.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredPaintings.map((painting, index) => {
          const isSelected = selectedIds.has(painting.id);
          const seasonKey = painting.suggested_season?.toLowerCase() as keyof typeof SEASON_COLORS;
          
          return (
            <motion.div
              key={painting.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => setSelectedPainting(painting)}
              className={cn(
                "group relative bg-card rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:shadow-xl hover:scale-[1.02]",
                isSelected ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
              )}
            >
              <div className="aspect-[3/4] relative">
                <img 
                  src={painting.thumbnail_url || painting.image_url} 
                  alt={painting.title || 'Painting'} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Star indicator */}
                <div className="absolute top-2 left-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-lg" />
                </div>

                {/* Selection checkbox */}
                <div 
                  className={cn(
                    "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                    isSelected 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-white/70 bg-black/40 opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => toggleSelection(painting.id, e)}
                >
                  {isSelected && <span className="text-xs font-bold">✓</span>}
                </div>

                {/* Season badge */}
                {painting.suggested_season && (
                  <div className={cn(
                    "absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium border",
                    SEASON_COLORS[seasonKey] || 'bg-muted'
                  )}>
                    {painting.suggested_season}
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{painting.title || 'Untitled'}</h3>
                {painting.palette_effect && (
                  <p className="text-xs text-primary truncate">{painting.palette_effect}</p>
                )}
                {painting.artist && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{painting.artist}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedPainting && (
        <PaintingDetailModal
          painting={selectedPainting}
          onClose={() => setSelectedPainting(null)}
          onUpdate={handlePaintingUpdate}
          onDelete={fetchPalettePaintings}
          isPaletteContext={true}
        />
      )}
    </div>
  );
}
