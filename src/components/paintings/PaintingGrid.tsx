import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Palette, Shirt, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { PaintingDetailModal } from './PaintingDetailModal';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-amber-100 text-amber-800',
  Summer: 'bg-blue-100 text-blue-800',
  Autumn: 'bg-orange-100 text-orange-800',
  Winter: 'bg-purple-100 text-purple-800',
};

export function PaintingGrid() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);

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
      // Cast the data to our Painting type
      const typedPaintings = (data || []).map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
      })) as Painting[];
      setPaintings(typedPaintings);
    }
    setLoading(false);
  };

  const filteredPaintings = paintings.filter(painting => {
    const matchesSearch = !searchQuery || 
      painting.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      painting.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      painting.palette_effect?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      painting.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeason = !selectedSeason || painting.suggested_season === selectedSeason;

    return matchesSearch && matchesSeason;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search paintings, artists, effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedSeason === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeason(null)}
          >
            All Seasons
          </Button>
          {['Spring', 'Summer', 'Autumn', 'Winter'].map((season) => (
            <Button
              key={season}
              variant={selectedSeason === season ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeason(season)}
            >
              {season}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredPaintings.length} of {paintings.length} paintings
      </p>

      {/* Empty state */}
      {paintings.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No paintings yet</h3>
          <p className="text-muted-foreground">
            Upload your first painting to start building your reference library
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPaintings.map((painting, index) => (
          <motion.div
            key={painting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedPainting(painting)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={painting.image_url}
                alt={painting.title || 'Painting'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-serif text-white font-medium line-clamp-1">
                    {painting.title || 'Untitled'}
                  </p>
                  {painting.artist && (
                    <p className="text-white/70 text-sm line-clamp-1">
                      {painting.artist}
                    </p>
                  )}
                </div>
              </div>

              {/* Season Badge */}
              {painting.suggested_season && (
                <Badge 
                  className={`absolute top-2 right-2 ${SEASON_COLORS[painting.suggested_season] || 'bg-muted'}`}
                >
                  {painting.suggested_season}
                </Badge>
              )}
            </div>

            {/* Info below image */}
            <div className="mt-2 space-y-1">
              <p className="font-medium text-sm line-clamp-1">
                {painting.title || 'Untitled'}
              </p>
              {painting.palette_effect && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {painting.palette_effect}
                </p>
              )}
              {painting.fabrics && painting.fabrics.length > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shirt className="w-3 h-3" />
                  {painting.fabrics.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedPainting && (
        <PaintingDetailModal
          painting={selectedPainting}
          onClose={() => setSelectedPainting(null)}
        />
      )}
    </div>
  );
}