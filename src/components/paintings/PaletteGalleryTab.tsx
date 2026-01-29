import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Search, Star, Trash2, Loader2, Sparkles, ChevronDown, ChevronRight, Clock, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

const SEASON_CONFIG = {
  spring: { emoji: '🌸', color: 'bg-spring/20 text-spring border-spring', gradient: 'from-spring/20 to-spring/5' },
  summer: { emoji: '☀️', color: 'bg-summer/20 text-summer border-summer', gradient: 'from-summer/20 to-summer/5' },
  autumn: { emoji: '🍂', color: 'bg-autumn/20 text-autumn border-autumn', gradient: 'from-autumn/20 to-autumn/5' },
  winter: { emoji: '❄️', color: 'bg-winter/20 text-winter border-winter', gradient: 'from-winter/20 to-winter/5' },
} as const;

const TIME_PERIODS = ['Early', 'Mid', 'Late'] as const;

interface SubtypeInfo {
  id: string;
  name: string;
  slug: string;
  season: string;
  time_period: string | null;
}

interface HierarchyNode {
  season: string;
  timePeriods: {
    period: string;
    subtypes: {
      subtype: SubtypeInfo;
      paintings: Painting[];
    }[];
    unassignedPaintings: Painting[];
  }[];
  untimedPaintings: Painting[];
}

export function PaletteGalleryTab() {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [subtypes, setSubtypes] = useState<SubtypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set(['spring', 'summer', 'autumn', 'winter']));
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paintingsRes, subtypesRes] = await Promise.all([
        supabase
          .from('paintings')
          .select('*')
          .or('status.eq.palette,tags.cs.{"Palette Painting"}')
          .order('created_at', { ascending: false }),
        supabase
          .from('subtypes')
          .select('id, name, slug, season, time_period')
          .eq('is_active', true)
      ]);

      if (paintingsRes.error) throw paintingsRes.error;
      if (subtypesRes.error) throw subtypesRes.error;
      
      const typedPaintings = (paintingsRes.data || []).map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
        corrections: p.corrections as Record<string, unknown> | null,
      })) as Painting[];
      
      setPaintings(typedPaintings);
      setSubtypes(subtypesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load palette paintings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleSeason = (season: string) => {
    setSelectedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(season)) next.delete(season);
      else next.add(season);
      return next;
    });
  };

  const toggleExpandSeason = (season: string) => {
    setExpandedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(season)) next.delete(season);
      else next.add(season);
      return next;
    });
  };

  const toggleExpandPeriod = (key: string) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredPaintings = useMemo(() => {
    return paintings.filter(p => {
      const matchesSearch = !search || 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.artist?.toLowerCase().includes(search.toLowerCase()) ||
        p.palette_effect?.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesSeason = selectedSeasons.size === 0 || 
        (p.suggested_season && selectedSeasons.has(p.suggested_season.toLowerCase()));
      
      return matchesSearch && matchesSeason;
    });
  }, [paintings, search, selectedSeasons]);

  // Build 3-tier hierarchy: Season → Time Period → Subtype
  const hierarchy = useMemo<HierarchyNode[]>(() => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    
    return seasons.map(season => {
      const seasonPaintings = filteredPaintings.filter(
        p => p.suggested_season?.toLowerCase() === season
      );
      const seasonSubtypes = subtypes.filter(s => s.season.toLowerCase() === season);
      
      // Group subtypes by time period
      const timePeriods = TIME_PERIODS.map(period => {
        const periodSubtypes = seasonSubtypes.filter(s => 
          s.time_period?.toLowerCase() === period.toLowerCase()
        );
        
        // Find paintings linked to each subtype in this period
        const subtypeGroups = periodSubtypes.map(subtype => {
          const subtypePaintings = seasonPaintings.filter(p => 
            p.tags?.some(t => t.toLowerCase() === subtype.slug.toLowerCase() || t.toLowerCase() === subtype.name.toLowerCase())
          );
          return { subtype, paintings: subtypePaintings };
        }).filter(g => g.paintings.length > 0);
        
        // Paintings in this period but not assigned to a specific subtype
        const assignedIds = new Set(subtypeGroups.flatMap(g => g.paintings.map(p => p.id)));
        const unassignedPaintings = seasonPaintings.filter(p => 
          !assignedIds.has(p.id) && 
          p.tags?.some(t => t.toLowerCase().includes(period.toLowerCase()))
        );
        
        return { period, subtypes: subtypeGroups, unassignedPaintings };
      }).filter(tp => tp.subtypes.length > 0 || tp.unassignedPaintings.length > 0);
      
      // Paintings not assigned to any time period
      const timedPaintingIds = new Set([
        ...timePeriods.flatMap(tp => tp.subtypes.flatMap(s => s.paintings.map(p => p.id))),
        ...timePeriods.flatMap(tp => tp.unassignedPaintings.map(p => p.id))
      ]);
      const untimedPaintings = seasonPaintings.filter(p => !timedPaintingIds.has(p.id));
      
      return { season, timePeriods, untimedPaintings };
    }).filter(node => 
      node.timePeriods.length > 0 || node.untimedPaintings.length > 0
    );
  }, [filteredPaintings, subtypes]);

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
      fetchData();
    } catch (error) {
      console.error('Error removing from palette:', error);
      toast.error('Failed to remove from palette');
    }
  };

  const handlePaintingUpdate = () => {
    fetchData();
    setSelectedPainting(null);
  };

  const PaintingCard = ({ painting, index = 0 }: { painting: Painting; index?: number }) => {
    const isSelected = selectedIds.has(painting.id);
    const seasonKey = painting.suggested_season?.toLowerCase() as keyof typeof SEASON_CONFIG;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        onClick={() => setSelectedPainting(painting)}
        className={cn(
          "group relative bg-card rounded-lg overflow-hidden cursor-pointer border-2 transition-all hover:shadow-lg hover:scale-[1.02]",
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
          
          <div className="absolute top-1.5 left-1.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-lg" />
          </div>

          <div 
            className={cn(
              "absolute top-1.5 right-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
              isSelected 
                ? "bg-primary border-primary text-primary-foreground" 
                : "border-white/70 bg-black/40 opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => toggleSelection(painting.id, e)}
          >
            {isSelected && <span className="text-xs font-bold">✓</span>}
          </div>
        </div>

        <div className="p-2">
          <h3 className="font-medium text-xs truncate">{painting.title || 'Untitled'}</h3>
          {painting.palette_effect && (
            <p className="text-[10px] text-primary truncate">{painting.palette_effect}</p>
          )}
        </div>
      </motion.div>
    );
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
            <p className="text-muted-foreground">Organized by Season → Time Period → Subtype</p>
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
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(SEASON_CONFIG).map(([key, config]) => (
            <Toggle
              key={key}
              pressed={selectedSeasons.has(key)}
              onPressedChange={() => toggleSeason(key)}
              variant="outline"
              size="sm"
              className="gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {config.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
            </Toggle>
          ))}
        </div>

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
      {hierarchy.length === 0 && filteredPaintings.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border-2 border-dashed">
          <Star className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Palette Paintings Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Add paintings to your palette from the Gallery tab. Click any painting and either:
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
              <Star className="w-4 h-4 text-amber-500" />
              <span>Click <strong>"Save to Palette"</strong> button</span>
            </div>
            <span className="text-xs">OR</span>
            <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Assign a <strong>Nechama Subtype</strong> to auto-add</span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tier Hierarchy View */}
      <div className="space-y-4">
        <AnimatePresence>
          {hierarchy.map(seasonNode => {
            const config = SEASON_CONFIG[seasonNode.season as keyof typeof SEASON_CONFIG];
            const isExpanded = expandedSeasons.has(seasonNode.season);
            const totalCount = seasonNode.untimedPaintings.length + 
              seasonNode.timePeriods.reduce((acc, tp) => 
                acc + tp.unassignedPaintings.length + tp.subtypes.reduce((a, s) => a + s.paintings.length, 0), 0);
            
            return (
              <motion.div
                key={seasonNode.season}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("rounded-xl border-2 overflow-hidden", config.color)}
              >
                {/* Season Header */}
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpandSeason(seasonNode.season)}>
                  <CollapsibleTrigger asChild>
                    <button className={cn(
                      "w-full flex items-center justify-between p-4 bg-gradient-to-r transition-colors hover:opacity-90",
                      config.gradient
                    )}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <h3 className="text-xl font-serif font-bold capitalize">{seasonNode.season}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {totalCount} paintings
                        </Badge>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="p-4 space-y-4 bg-background/50">
                      {/* Time Periods */}
                      {seasonNode.timePeriods.map(periodNode => {
                        const periodKey = `${seasonNode.season}-${periodNode.period}`;
                        const isPeriodExpanded = expandedPeriods.has(periodKey);
                        const periodTotal = periodNode.unassignedPaintings.length + 
                          periodNode.subtypes.reduce((a, s) => a + s.paintings.length, 0);
                        
                        return (
                          <Collapsible 
                            key={periodKey} 
                            open={isPeriodExpanded} 
                            onOpenChange={() => toggleExpandPeriod(periodKey)}
                          >
                            <CollapsibleTrigger asChild>
                              <button className="w-full flex items-center gap-3 p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold">{periodNode.period} {seasonNode.season}</span>
                                <Badge variant="outline" className="ml-auto">
                                  {periodTotal}
                                </Badge>
                                {isPeriodExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="mt-3 pl-4 space-y-3">
                                {/* Subtypes within this time period */}
                                {periodNode.subtypes.map(subtypeGroup => (
                                  <div key={subtypeGroup.subtype.id} className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <Palette className="w-3.5 h-3.5 text-primary" />
                                      <span className="font-medium text-primary">{subtypeGroup.subtype.name}</span>
                                      <span className="text-muted-foreground">({subtypeGroup.paintings.length})</span>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                      {subtypeGroup.paintings.map((painting, idx) => (
                                        <PaintingCard key={painting.id} painting={painting} index={idx} />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                
                                {/* Unassigned to subtype but in this time period */}
                                {periodNode.unassignedPaintings.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <span className="italic">General {periodNode.period} {seasonNode.season}</span>
                                      <span>({periodNode.unassignedPaintings.length})</span>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                                      {periodNode.unassignedPaintings.map((painting, idx) => (
                                        <PaintingCard key={painting.id} painting={painting} index={idx} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                      
                      {/* Paintings not assigned to any time period */}
                      {seasonNode.untimedPaintings.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                            <span className="italic">General {seasonNode.season} (no time period)</span>
                            <Badge variant="outline">{seasonNode.untimedPaintings.length}</Badge>
                          </div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                            {seasonNode.untimedPaintings.map((painting, idx) => (
                              <PaintingCard key={painting.id} painting={painting} index={idx} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      {selectedPainting && (
        <PaintingDetailModal
          painting={selectedPainting}
          onClose={() => setSelectedPainting(null)}
          onUpdate={handlePaintingUpdate}
          onDelete={fetchData}
          isPaletteContext={true}
        />
      )}
    </div>
  );
}
