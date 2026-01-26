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
  Trash2
} from 'lucide-react';
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

const SEASON_COLORS: Record<string, string> = {
  spring: 'bg-amber-100 text-amber-800 border-amber-300',
  summer: 'bg-blue-100 text-blue-800 border-blue-300',
  autumn: 'bg-orange-100 text-orange-800 border-orange-300',
  winter: 'bg-purple-100 text-purple-800 border-purple-300',
};

const STATUS_COLORS: Record<string, string> = {
  unlabeled: 'bg-muted text-muted-foreground',
  ai_predicted: 'bg-primary/10 text-primary',
  needs_review: 'bg-warning/10 text-warning',
  manually_labeled: 'bg-accent/10 text-accent',
  expert_verified: 'bg-success/10 text-success',
  nechama_verified: 'bg-success/20 text-success',
};

export function FacesGalleryTab() {
  const { toast } = useToast();
  const [faces, setFaces] = useState<FaceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFace, setSelectedFace] = useState<FaceImage | null>(null);
  const limit = 40;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');

  const fetchFaces = async () => {
    setLoading(true);
    try {
      // Build query for face_images with FULL color_labels join
      let query = supabase
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
        `, { count: 'exact' });

      // Apply source filter
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`source_id.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to flatten color_labels
      const transformed = (data || []).map((face: any) => ({
        ...face,
        color_label: Array.isArray(face.color_labels) 
          ? face.color_labels[0] 
          : face.color_labels,
      }));

      setFaces(transformed);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching faces:', err);
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
    fetchFaces();
  }, [offset, sourceFilter, searchQuery]);

  // Client-side filtering for label-related filters (since they're in joined table)
  const filteredFaces = useMemo(() => {
    let result = [...faces];

    // Filter by season
    if (seasonFilter !== 'all') {
      result = result.filter(f => 
        f.color_label?.confirmed_season?.toLowerCase() === seasonFilter
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(f => 
        f.color_label?.label_status === statusFilter
      );
    }

    // Filter by confidence
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
  }, [faces, seasonFilter, statusFilter, confidenceFilter]);

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

      // Refresh to show updated data
      fetchFaces();
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
    }
    setSelectedIds(new Set());
  };

  const deleteSelected = async () => {
    const idsToDelete = Array.from(selectedIds);
    
    try {
      // First delete color_labels (child records)
      const { error: labelError } = await supabase
        .from('color_labels')
        .delete()
        .in('face_image_id', idsToDelete);

      if (labelError) throw labelError;

      // Then delete face_images
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
      fetchFaces();
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
    
    for (const face of unlabeled) {
      await analyzeFace(face);
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
    // If it's a URL, return directly
    if (face.storage_path.startsWith('http')) {
      return face.storage_path;
    }
    // Otherwise, build Supabase storage URL
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

      {/* Face Grid */}
      {filteredFaces.length > 0 && (
        <motion.div 
          className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredFaces.map((face, index) => {
            const isAnalyzing = analyzingIds.has(face.id);
            const isSelected = selectedIds.has(face.id);
            const isUnlabeled = !face.color_label?.label_status || face.color_label.label_status === 'unlabeled';
            
            return (
              <motion.div
                key={face.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedFace(face)}
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
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Hover overlay with analyze button */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent transition-opacity",
                  isAnalyzing ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                )}>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs truncate font-medium">
                      {face.color_label?.confirmed_subtype || face.color_label?.ai_predicted_subtype || 'Unlabeled'}
                    </p>
                    {face.color_label?.ai_confidence && (
                      <p className="text-white/70 text-xs">
                        {Math.round(face.color_label.ai_confidence)}% confidence
                      </p>
                    )}
                  </div>
                  
                  {/* Quick analyze button */}
                  {isUnlabeled && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        analyzeFace(face);
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Analyze
                    </Button>
                  )}
                </div>

                {/* Selection checkbox - Shift+click to select */}
                <div 
                  className={cn(
                    "absolute top-1 left-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-white/50 bg-black/30 opacity-0 group-hover:opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(face.id, e);
                  }}
                >
                  {isSelected && <span className="text-xs">✓</span>}
                </div>

                {/* Season badge */}
                {face.color_label?.confirmed_season && (
                  <Badge 
                    className={cn(
                      'absolute top-1 right-1 text-[10px] px-1.5 py-0.5',
                      SEASON_COLORS[face.color_label.confirmed_season] || 'bg-muted'
                    )}
                  >
                    {face.color_label.confirmed_season}
                  </Badge>
                )}

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

                {/* Source badge */}
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {face.source}
                </Badge>
              </motion.div>
            );
          })}
        </motion.div>
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
              // Update the selected face with new data
              const updated = faces.find(f => f.id === face.id);
              if (updated) setSelectedFace(updated);
            }}
            onUpdate={() => {
              fetchFaces();
              setSelectedFace(null);
            }}
            isAnalyzing={analyzingIds.has(selectedFace.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
