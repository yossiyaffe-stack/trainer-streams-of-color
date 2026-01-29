import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { 
  FacesFilterToolbar, 
  SeasonFilter, 
  StatusFilter, 
  SourceFilter, 
  ConfidenceFilter 
} from './FacesFilterToolbar';
import { FaceDetailModal } from './FaceDetailModal';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Loader2,
  Trash2,
  FolderCheck,
  FolderOpen,
  ChevronDown,
  Clock,
  Palette
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface ColorLabel {
  confirmed_season: string | null;
  confirmed_subtype: string | null;
  label_status: string | null;
  ai_confidence: number | null;
  ai_predicted_subtype: string | null;
  skin_hex?: string | null;
  skin_tone_name?: string | null;
  undertone?: string | null;
  eye_hex?: string | null;
  eye_color_name?: string | null;
  eye_details?: { description?: string } | null;
  hair_hex?: string | null;
  hair_color_name?: string | null;
  hair_details?: { is_natural?: boolean } | null;
  contrast_level?: string | null;
  contrast_value?: number | null;
  depth?: string | null;
  depth_value?: number | null;
  ai_reasoning?: string | null;
  ai_alternatives?: Array<{ subtype: string; confidence: number }> | null;
}

interface FaceImage {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  source: string;
  source_id: string | null;
  quality_score: number | null;
  created_at: string;
  color_label?: ColorLabel | null;
}

interface SubtypeInfo {
  id: string;
  name: string;
  slug: string;
  season: string;
  time_period: string | null;
}

const SEASON_CONFIG = {
  spring: { emoji: '🌸', color: 'bg-spring/20 text-spring border-spring', gradient: 'from-spring/20 to-spring/5' },
  summer: { emoji: '☀️', color: 'bg-summer/20 text-summer border-summer', gradient: 'from-summer/20 to-summer/5' },
  autumn: { emoji: '🍂', color: 'bg-autumn/20 text-autumn border-autumn', gradient: 'from-autumn/20 to-autumn/5' },
  winter: { emoji: '❄️', color: 'bg-winter/20 text-winter border-winter', gradient: 'from-winter/20 to-winter/5' },
} as const;

const TIME_PERIODS = ['Early', 'Mid', 'Late'] as const;

const STATUS_COLORS: Record<string, string> = {
  unlabeled: 'bg-muted text-muted-foreground',
  ai_predicted: 'bg-primary/10 text-primary',
  needs_review: 'bg-warning/10 text-warning',
  manually_labeled: 'bg-accent/10 text-accent',
  expert_verified: 'bg-success/10 text-success',
  nechama_verified: 'bg-success/20 text-success',
};

// Extracted FaceCard component for reuse
function FaceCard({ 
  face, 
  index, 
  isAnalyzing, 
  isSelected, 
  onSelect, 
  onClick, 
  onAnalyze,
  getImageUrl,
  compact = false
}: { 
  face: FaceImage;
  index: number;
  isAnalyzing: boolean;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onClick: () => void;
  onAnalyze: (face: FaceImage) => void;
  getImageUrl: (face: FaceImage) => string;
  compact?: boolean;
}) {
  const isUnlabeled = !face.color_label?.label_status || face.color_label.label_status === 'unlabeled';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      onClick={onClick}
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all",
        isSelected ? "border-primary ring-2 ring-primary/30" :
        isAnalyzing ? "border-warning animate-pulse" :
        "border-border hover:border-primary"
      )}
    >
      <img
        src={getImageUrl(face)}
        alt={`Face ${face.source_id || face.id}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Analyzing overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}

      {/* Hover overlay with analyze button */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity",
        isAnalyzing ? "opacity-0" : "opacity-0 group-hover:opacity-100"
      )}>
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <p className="text-white text-[10px] truncate font-medium">
            {face.color_label?.confirmed_subtype || face.color_label?.ai_predicted_subtype || 'Unlabeled'}
          </p>
          {face.color_label?.ai_confidence && !compact && (
            <p className="text-white/70 text-[10px]">
              {Math.round(face.color_label.ai_confidence)}%
            </p>
          )}
        </div>
        
        {/* Quick analyze button */}
        {isUnlabeled && !compact && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-1 text-xs h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(face);
            }}
          >
            <Sparkles className="w-3 h-3" />
            Analyze
          </Button>
        )}
      </div>

      {/* Selection checkbox */}
      <div 
        className={cn(
          "absolute top-1 left-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
          isSelected ? "bg-primary border-primary text-primary-foreground" : "border-white/50 bg-black/30 opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(face.id, e);
        }}
      >
        {isSelected && <span className="text-[10px]">✓</span>}
      </div>

      {/* Status indicator */}
      {face.color_label?.label_status && face.color_label.label_status !== 'unlabeled' && (
        <div className={cn(
          'absolute bottom-1 left-1 w-2 h-2 rounded-full',
          face.color_label.label_status === 'nechama_verified' ? 'bg-success' :
          face.color_label.label_status === 'expert_verified' ? 'bg-success/80' :
          face.color_label.label_status === 'ai_predicted' ? 'bg-primary' :
          face.color_label.label_status === 'needs_review' ? 'bg-warning' :
          'bg-muted-foreground'
        )} />
      )}
    </motion.div>
  );
}

export function FacesGalleryTab() {
  const { toast } = useToast();
  const [faces, setFaces] = useState<FaceImage[]>([]);
  const [subtypes, setSubtypes] = useState<SubtypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFace, setSelectedFace] = useState<FaceImage | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set(['spring', 'summer', 'autumn', 'winter']));
  const [expandedPeriods, setExpandedPeriods] = useState<Set<string>>(new Set());
  const limit = 40;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [facesRes, subtypesRes] = await Promise.all([
        supabase
          .from('face_images')
          .select(`
            id,
            storage_path,
            thumbnail_path,
            source,
            source_id,
            quality_score,
            created_at,
            color_labels (
              confirmed_season,
              confirmed_subtype,
              label_status,
              ai_confidence,
              ai_predicted_subtype,
              skin_hex,
              skin_tone_name,
              undertone,
              eye_hex,
              eye_color_name,
              eye_details,
              hair_hex,
              hair_color_name,
              hair_details,
              contrast_level,
              contrast_value,
              depth,
              depth_value,
              ai_reasoning,
              ai_alternatives
            )
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1),
        supabase
          .from('subtypes')
          .select('id, name, slug, season, time_period')
          .eq('is_active', true)
      ]);

      if (facesRes.error) throw facesRes.error;
      if (subtypesRes.error) throw subtypesRes.error;

      const transformed = (facesRes.data || []).map((face: any) => ({
        ...face,
        color_label: Array.isArray(face.color_labels) 
          ? face.color_labels[0] 
          : face.color_labels,
      }));

      setFaces(transformed);
      setTotalCount(facesRes.count || 0);
      setSubtypes(subtypesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load face images',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [offset]);

  // Client-side filtering
  const filteredFaces = useMemo(() => {
    let result = [...faces];

    if (sourceFilter !== 'all') {
      result = result.filter(f => f.source === sourceFilter);
    }

    if (searchQuery) {
      result = result.filter(f => 
        f.source_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (seasonFilter !== 'all') {
      result = result.filter(f => 
        f.color_label?.confirmed_season?.toLowerCase() === seasonFilter
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(f => 
        f.color_label?.label_status === statusFilter
      );
    }

    if (confidenceFilter !== 'all') {
      result = result.filter(f => {
        const confidence = f.color_label?.ai_confidence || 0;
        switch (confidenceFilter) {
          case 'high': return confidence >= 80;
          case 'medium': return confidence >= 50 && confidence < 80;
          case 'low': return confidence < 50;
          default: return true;
        }
      });
    }

    return result;
  }, [faces, seasonFilter, statusFilter, confidenceFilter, sourceFilter, searchQuery]);

  // Split faces into confirmed (for 3-tier view) and unconfirmed
  const { confirmedFaces, unconfirmedFaces } = useMemo(() => {
    const confirmed = filteredFaces.filter(f => 
      f.color_label?.label_status === 'expert_verified' || 
      f.color_label?.label_status === 'nechama_verified'
    );
    const unconfirmed = filteredFaces.filter(f => 
      f.color_label?.label_status !== 'expert_verified' && 
      f.color_label?.label_status !== 'nechama_verified'
    );
    return { confirmedFaces: confirmed, unconfirmedFaces: unconfirmed };
  }, [filteredFaces]);

  // Build 3-tier hierarchy for confirmed faces: Season → Time Period → Subtype
  const confirmedHierarchy = useMemo(() => {
    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    
    return seasons.map(season => {
      const seasonFaces = confirmedFaces.filter(
        f => f.color_label?.confirmed_season?.toLowerCase() === season
      );
      const seasonSubtypes = subtypes.filter(s => s.season.toLowerCase() === season);
      
      // Group by time period
      const timePeriods = TIME_PERIODS.map(period => {
        const periodSubtypes = seasonSubtypes.filter(s => 
          s.time_period?.toLowerCase() === period.toLowerCase()
        );
        
        // Find faces linked to each subtype in this period
        const subtypeGroups = periodSubtypes.map(subtype => {
          const subtypeFaces = seasonFaces.filter(f => 
            f.color_label?.confirmed_subtype?.toLowerCase() === subtype.slug.toLowerCase() ||
            f.color_label?.confirmed_subtype?.toLowerCase() === subtype.name.toLowerCase()
          );
          return { subtype, faces: subtypeFaces };
        }).filter(g => g.faces.length > 0);
        
        return { period, subtypes: subtypeGroups };
      }).filter(tp => tp.subtypes.length > 0);
      
      // Faces with this season but no matching subtype time period
      const categorizedIds = new Set(
        timePeriods.flatMap(tp => tp.subtypes.flatMap(s => s.faces.map(f => f.id)))
      );
      const uncategorizedFaces = seasonFaces.filter(f => !categorizedIds.has(f.id));
      
      return { season, timePeriods, uncategorizedFaces };
    }).filter(node => node.timePeriods.length > 0 || node.uncategorizedFaces.length > 0);
  }, [confirmedFaces, subtypes]);

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

  const clearFilters = () => {
    setSearchQuery('');
    setSeasonFilter('all');
    setStatusFilter('all');
    setSourceFilter('all');
    setConfidenceFilter('all');
    setOffset(0);
  };

  const analyzeFace = async (face: FaceImage) => {
    setAnalyzingIds(prev => new Set(prev).add(face.id));
    
    try {
      const imageUrl = getImageUrl(face);
      
      const { data, error } = await supabase.functions.invoke('analyze-face', {
        body: { imageUrl, faceImageId: face.id }
      });

      if (error) throw error;

      toast({
        title: 'Analysis Complete',
        description: `Predicted: ${data.analysis?.predicted_subtype || 'Unknown'} (${data.analysis?.confidence || 0}% confidence)`,
      });

      fetchData();
    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: 'Analysis Failed',
        description: err instanceof Error ? err.message : 'Could not analyze face',
        variant: 'destructive',
      });
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(face.id);
        return next;
      });
    }
  };

  const analyzeSelected = async () => {
    const toAnalyze = filteredFaces.filter(f => selectedIds.has(f.id));
    for (const face of toAnalyze) {
      await analyzeFace(face);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    setSelectedIds(new Set());
  };

  const deleteSelected = async () => {
    const idsToDelete = Array.from(selectedIds);
    
    try {
      const { error: labelError } = await supabase
        .from('color_labels')
        .delete()
        .in('face_image_id', idsToDelete);

      if (labelError) throw labelError;

      const { error: faceError } = await supabase
        .from('face_images')
        .delete()
        .in('id', idsToDelete);

      if (faceError) throw faceError;

      toast({
        title: 'Deleted',
        description: `Removed ${idsToDelete.length} face(s)`,
      });

      setSelectedIds(new Set());
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: 'Delete Failed',
        description: err instanceof Error ? err.message : 'Could not delete faces',
        variant: 'destructive',
      });
    }
  };

  const analyzeAllUnlabeled = async () => {
    const unlabeled = filteredFaces.filter(f => 
      !f.color_label?.label_status || f.color_label.label_status === 'unlabeled'
    );
    
    if (unlabeled.length === 0) {
      toast({ title: 'No unlabeled faces', description: 'All visible faces have been analyzed' });
      return;
    }

    toast({ title: 'Starting bulk analysis', description: `Analyzing ${unlabeled.length} faces...` });
    
    for (let i = 0; i < unlabeled.length; i++) {
      await analyzeFace(unlabeled[i]);
      if (i < unlabeled.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getImageUrl = (face: FaceImage) => {
    if (face.storage_path.startsWith('http')) {
      return face.storage_path;
    }
    const { data } = supabase.storage
      .from('face-images')
      .getPublicUrl(face.storage_path);
    return data.publicUrl;
  };

  if (loading && faces.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analyze Actions Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          onClick={analyzeAllUnlabeled}
          disabled={analyzingIds.size > 0}
          className="gap-2"
        >
          {analyzingIds.size > 0 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Analyze All Unlabeled
        </Button>
        
        {selectedIds.size > 0 && (
          <>
            <Button
              variant="outline"
              onClick={analyzeSelected}
              disabled={analyzingIds.size > 0}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analyze Selected ({selectedIds.size})
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.size} face(s)?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove the selected faces and their analysis data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
        
        {analyzingIds.size > 0 && (
          <span className="text-sm text-muted-foreground">
            Analyzing {analyzingIds.size} face(s)...
          </span>
        )}
      </div>

      {/* Filter Toolbar */}
      <FacesFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setOffset(0); }}
        seasonFilter={seasonFilter}
        onSeasonChange={(s) => { setSeasonFilter(s); setOffset(0); }}
        statusFilter={statusFilter}
        onStatusChange={(s) => { setStatusFilter(s); setOffset(0); }}
        sourceFilter={sourceFilter}
        onSourceChange={(s) => { setSourceFilter(s); setOffset(0); }}
        confidenceFilter={confidenceFilter}
        onConfidenceChange={(c) => { setConfidenceFilter(c); setOffset(0); }}
        totalCount={totalCount}
        filteredCount={filteredFaces.length}
        onClearFilters={clearFilters}
      />

      {/* Empty State */}
      {faces.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">No Faces Yet</h3>
          <p className="text-muted-foreground">
            Import faces from Hugging Face datasets or upload your own photos
          </p>
        </div>
      )}

      {/* Confirmed Faces - 3-Tier Hierarchy View */}
      {confirmedHierarchy.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <FolderCheck className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-lg">Confirmed Training Data</h3>
            <Badge variant="secondary" className="bg-success/20 text-success">
              {confirmedFaces.length} faces
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">
              Organized by Season → Time Period → Subtype
            </span>
          </div>

          {confirmedHierarchy.map(seasonNode => {
            const config = SEASON_CONFIG[seasonNode.season as keyof typeof SEASON_CONFIG];
            const isExpanded = expandedSeasons.has(seasonNode.season);
            const totalCount = seasonNode.uncategorizedFaces.length + 
              seasonNode.timePeriods.reduce((acc, tp) => 
                acc + tp.subtypes.reduce((a, s) => a + s.faces.length, 0), 0);
            
            return (
              <Collapsible 
                key={seasonNode.season} 
                open={isExpanded} 
                onOpenChange={() => toggleExpandSeason(seasonNode.season)}
              >
                <CollapsibleTrigger asChild>
                  <button className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors hover:opacity-90",
                    config.color
                  )}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{config.emoji}</span>
                      <span className="font-semibold capitalize">{seasonNode.season}</span>
                      <Badge variant="secondary">{totalCount} faces</Badge>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="pt-3 pl-4 space-y-3">
                  {/* Time Periods */}
                  {seasonNode.timePeriods.map(periodNode => {
                    const periodKey = `${seasonNode.season}-${periodNode.period}`;
                    const isPeriodExpanded = expandedPeriods.has(periodKey);
                    const periodTotal = periodNode.subtypes.reduce((a, s) => a + s.faces.length, 0);
                    
                    return (
                      <Collapsible 
                        key={periodKey} 
                        open={isPeriodExpanded}
                        onOpenChange={() => toggleExpandPeriod(periodKey)}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center gap-3 p-2.5 bg-card rounded-lg border hover:bg-muted/50 transition-colors">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{periodNode.period} {seasonNode.season}</span>
                            <Badge variant="outline" className="ml-auto">{periodTotal}</Badge>
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform",
                              isPeriodExpanded && "rotate-180"
                            )} />
                          </button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="pt-2 pl-4 space-y-3">
                          {periodNode.subtypes.map(subtypeGroup => (
                            <div key={subtypeGroup.subtype.id} className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Palette className="w-3.5 h-3.5 text-primary" />
                                <span className="font-medium text-primary">{subtypeGroup.subtype.name}</span>
                                <span className="text-muted-foreground">({subtypeGroup.faces.length})</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-auto h-6 text-xs"
                                  onClick={() => {
                                    const faceIds = subtypeGroup.faces.map(f => f.id);
                                    const allSelected = faceIds.every(id => selectedIds.has(id));
                                    if (allSelected) {
                                      setSelectedIds(prev => {
                                        const next = new Set(prev);
                                        faceIds.forEach(id => next.delete(id));
                                        return next;
                                      });
                                    } else {
                                      setSelectedIds(prev => new Set([...prev, ...faceIds]));
                                    }
                                  }}
                                >
                                  {subtypeGroup.faces.every(f => selectedIds.has(f.id)) ? 'Deselect' : 'Select All'}
                                </Button>
                              </div>
                              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                                {subtypeGroup.faces.map((face, idx) => (
                                  <FaceCard
                                    key={face.id}
                                    face={face}
                                    index={idx}
                                    isAnalyzing={analyzingIds.has(face.id)}
                                    isSelected={selectedIds.has(face.id)}
                                    onSelect={toggleSelection}
                                    onClick={() => setSelectedFace(face)}
                                    onAnalyze={analyzeFace}
                                    getImageUrl={getImageUrl}
                                    compact
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                  
                  {/* Uncategorized faces for this season */}
                  {seasonNode.uncategorizedFaces.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                        <span className="italic">General {seasonNode.season} (no time period assigned)</span>
                        <Badge variant="outline">{seasonNode.uncategorizedFaces.length}</Badge>
                      </div>
                      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {seasonNode.uncategorizedFaces.map((face, idx) => (
                          <FaceCard
                            key={face.id}
                            face={face}
                            index={idx}
                            isAnalyzing={analyzingIds.has(face.id)}
                            isSelected={selectedIds.has(face.id)}
                            onSelect={toggleSelection}
                            onClick={() => setSelectedFace(face)}
                            onAnalyze={analyzeFace}
                            getImageUrl={getImageUrl}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {/* Unconfirmed Folder */}
      {unconfirmedFaces.length > 0 && (
        <Collapsible defaultOpen className="space-y-3">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex-1 justify-between px-4 py-3 h-auto bg-muted/50 hover:bg-muted border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Unconfirmed / Pending Review</span>
                  <Badge variant="secondary">
                    {unconfirmedFaces.length}
                  </Badge>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
            {unconfirmedFaces.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  const unconfirmedIds = unconfirmedFaces.map(f => f.id);
                  const allSelected = unconfirmedIds.every(id => selectedIds.has(id));
                  if (allSelected) {
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      unconfirmedIds.forEach(id => next.delete(id));
                      return next;
                    });
                  } else {
                    setSelectedIds(prev => new Set([...prev, ...unconfirmedIds]));
                  }
                }}
              >
                {unconfirmedFaces.every(f => selectedIds.has(f.id)) ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
          <CollapsibleContent>
            <motion.div 
              className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {unconfirmedFaces.map((face, index) => (
                <FaceCard
                  key={face.id}
                  face={face}
                  index={index}
                  isAnalyzing={analyzingIds.has(face.id)}
                  isSelected={selectedIds.has(face.id)}
                  onSelect={toggleSelection}
                  onClick={() => setSelectedFace(face)}
                  onAnalyze={analyzeFace}
                  getImageUrl={getImageUrl}
                />
              ))}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* No results for filters */}
      {faces.length > 0 && filteredFaces.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No faces match your filters. Try adjusting your criteria.
        </div>
      )}

      {/* Pagination */}
      {totalCount > limit && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {Math.floor(offset / limit) + 1} of {Math.ceil(totalCount / limit)}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= totalCount || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Face Detail Modal */}
      <AnimatePresence>
        {selectedFace && (
          <FaceDetailModal
            face={selectedFace}
            onClose={() => setSelectedFace(null)}
            onAnalyze={async (face) => {
              await analyzeFace(face);
              const updated = faces.find(f => f.id === face.id);
              if (updated) setSelectedFace(updated);
            }}
            onUpdate={() => {
              fetchData();
              setSelectedFace(null);
            }}
            onDelete={async (id) => {
              await supabase.from('color_labels').delete().eq('face_image_id', id);
              const { error } = await supabase.from('face_images').delete().eq('id', id);
              if (error) throw error;
              toast({ title: 'Deleted', description: 'Face removed successfully' });
              fetchData();
            }}
            isAnalyzing={analyzingIds.has(selectedFace.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
