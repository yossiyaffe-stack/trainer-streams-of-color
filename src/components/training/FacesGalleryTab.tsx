import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  FacesFilterToolbar, 
  SeasonFilter, 
  StatusFilter, 
  SourceFilter, 
  ConfidenceFilter 
} from './FacesFilterToolbar';
import { 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaceImage {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  source: string;
  source_id: string | null;
  quality_score: number | null;
  created_at: string;
  color_label?: {
    confirmed_season: string | null;
    confirmed_subtype: string | null;
    label_status: string | null;
    ai_confidence: number | null;
    ai_predicted_subtype: string | null;
  } | null;
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
      // Build query for face_images with color_labels join
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
            ai_predicted_subtype
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
          {filteredFaces.map((face, index) => (
            <motion.div
              key={face.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="group relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-primary cursor-pointer transition-all"
            >
              <img
                src={getImageUrl(face)}
                alt={`Face ${face.source_id || face.id}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
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
                  'absolute top-1 left-1 w-2 h-2 rounded-full',
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
          ))}
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
    </div>
  );
}
