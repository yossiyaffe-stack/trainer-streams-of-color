import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BulkPhoto } from '@/types/training';
import { Subtype, SAMPLE_SUBTYPES } from '@/data/subtypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Grid3X3, 
  LayoutGrid, 
  Square, 
  Check, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  X,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'compact' | 'grid' | 'large';
type FilterSeason = 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
type FilterStatus = 'all' | 'pending' | 'analyzed' | 'confirmed';
type FilterConfidence = 'all' | 'high' | 'medium' | 'low';
type SortBy = 'date' | 'confidence-asc' | 'confidence-desc' | 'season' | 'subtype';

interface PhotoGridViewProps {
  photos: BulkPhoto[];
  onUpdatePhoto: (id: string, updates: Partial<BulkPhoto>) => void;
  onBatchAction: (action: 'confirm' | 'analyze', ids: string[]) => void;
}

export function PhotoGridView({ photos, onUpdatePhoto, onBatchAction }: PhotoGridViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterSeason, setFilterSeason] = useState<FilterSeason>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterConfidence, setFilterConfidence] = useState<FilterConfidence>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');

  const subtypes = SAMPLE_SUBTYPES;

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    if (filterSeason !== 'all') {
      result = result.filter(p => 
        p.aiPrediction?.season?.toLowerCase() === filterSeason.toLowerCase()
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterConfidence !== 'all') {
      switch (filterConfidence) {
        case 'high':
          result = result.filter(p => (p.aiConfidence || 0) >= 80);
          break;
        case 'medium':
          result = result.filter(p => (p.aiConfidence || 0) >= 50 && (p.aiConfidence || 0) < 80);
          break;
        case 'low':
          result = result.filter(p => (p.aiConfidence || 0) < 50);
          break;
      }
    }

    switch (sortBy) {
      case 'confidence-asc':
        result.sort((a, b) => (a.aiConfidence || 0) - (b.aiConfidence || 0));
        break;
      case 'confidence-desc':
        result.sort((a, b) => (b.aiConfidence || 0) - (a.aiConfidence || 0));
        break;
      case 'season':
        result.sort((a, b) => 
          (a.aiPrediction?.season || '').localeCompare(b.aiPrediction?.season || '')
        );
        break;
      case 'subtype':
        result.sort((a, b) => 
          (a.aiPrediction?.name || '').localeCompare(b.aiPrediction?.name || '')
        );
        break;
      case 'date':
      default:
        result.sort((a, b) => 
          new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
        );
    }

    return result;
  }, [photos, filterSeason, filterStatus, filterConfidence, sortBy]);

  const toggleSelect = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = () => setSelectedIds(new Set(filteredPhotos.map(p => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

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

  const getThumbnailSize = () => {
    switch (viewMode) {
      case 'compact': return 'aspect-square w-full';
      case 'large': return 'aspect-square w-full';
      default: return 'aspect-square w-full';
    }
  };

  // Group by season
  const photosBySeasons = useMemo(() => {
    if (sortBy !== 'season') return null;
    
    const grouped: Record<string, BulkPhoto[]> = { Spring: [], Summer: [], Autumn: [], Winter: [], Unknown: [] };
    filteredPhotos.forEach(p => {
      const season = p.aiPrediction?.season ? 
        p.aiPrediction.season.charAt(0).toUpperCase() + p.aiPrediction.season.slice(1) : 'Unknown';
      if (grouped[season]) {
        grouped[season].push(p);
      } else {
        grouped.Unknown.push(p);
      }
    });
    return grouped;
  }, [filteredPhotos, sortBy]);

  const expandedPhoto = photos.find(p => p.id === expandedId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterSeason} onValueChange={(v) => setFilterSeason(v as FilterSeason)}>
            <SelectTrigger className="w-[130px]">
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

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterConfidence} onValueChange={(v) => setFilterConfidence(v as FilterConfidence)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High (80%+)</SelectItem>
              <SelectItem value="medium">Medium (50-79%)</SelectItem>
              <SelectItem value="low">Low (&lt;50%)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="confidence-asc">Confidence ↑</SelectItem>
              <SelectItem value="confidence-desc">Confidence ↓</SelectItem>
              <SelectItem value="season">Group by Season</SelectItem>
              <SelectItem value="subtype">Group by Subtype</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode */}
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

        {/* Selection Actions */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredPhotos.length} photos
            {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
          </span>
          
          {selectedIds.size > 0 ? (
            <>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-success/50 text-success"
                onClick={() => onBatchAction('confirm', Array.from(selectedIds))}
              >
                <Check className="w-3 h-3 mr-1" />
                Confirm Selected
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onBatchAction('analyze', Array.from(selectedIds))}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Re-analyze
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {sortBy === 'season' && photosBySeasons ? (
        <div className="space-y-8">
          {Object.entries(photosBySeasons).map(([season, seasonPhotos]) => (
            seasonPhotos.length > 0 && (
              <div key={season}>
                <h3 className="font-serif text-lg font-semibold mb-3 flex items-center gap-2">
                  <SeasonIcon season={season} />
                  {season}
                  <Badge variant="secondary" className="ml-2">{seasonPhotos.length}</Badge>
                </h3>
                <div className={cn('grid gap-2', getGridClasses())}>
                  {seasonPhotos.map((photo, idx) => (
                    <PhotoThumbnail
                      key={photo.id}
                      photo={photo}
                      sizeClass={getThumbnailSize()}
                      isSelected={selectedIds.has(photo.id)}
                      onSelect={(e) => toggleSelect(photo.id, e)}
                      onClick={() => setExpandedId(photo.id)}
                      showLabel={viewMode === 'large'}
                      index={idx + 1}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className={cn('grid gap-2', getGridClasses())}>
          {filteredPhotos.map((photo, idx) => (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              sizeClass={getThumbnailSize()}
              isSelected={selectedIds.has(photo.id)}
              onSelect={(e) => toggleSelect(photo.id, e)}
              onClick={() => setExpandedId(photo.id)}
              showLabel={viewMode === 'large'}
              index={idx + 1}
            />
          ))}
        </div>
      )}

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No photos match your filters
        </div>
      )}

      {/* Detail Modal */}
      <PhotoDetailModal
        photo={expandedPhoto}
        subtypes={subtypes}
        open={!!expandedId}
        onClose={() => setExpandedId(null)}
        onUpdate={(updates) => {
          if (expandedId) onUpdatePhoto(expandedId, updates);
        }}
        onPrev={() => {
          const idx = filteredPhotos.findIndex(p => p.id === expandedId);
          if (idx > 0) setExpandedId(filteredPhotos[idx - 1].id);
        }}
        onNext={() => {
          const idx = filteredPhotos.findIndex(p => p.id === expandedId);
          if (idx < filteredPhotos.length - 1) setExpandedId(filteredPhotos[idx + 1].id);
        }}
        currentIndex={filteredPhotos.findIndex(p => p.id === expandedId)}
        totalCount={filteredPhotos.length}
      />
    </div>
  );
}

function PhotoThumbnail({ 
  photo, 
  sizeClass, 
  isSelected, 
  onSelect, 
  onClick, 
  showLabel,
  index
}: {
  photo: BulkPhoto;
  sizeClass: string;
  isSelected: boolean;
  onSelect: (e?: React.MouseEvent) => void;
  onClick: () => void;
  showLabel: boolean;
  index: number;
}) {
  const getStatusIndicator = () => {
    switch (photo.status) {
      case 'pending':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-muted-foreground rounded-full" />;
      case 'analyzing':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full animate-pulse" />;
      case 'analyzed':
        return <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />;
      case 'confirmed':
        return photo.confirmedSubtype?.id === photo.aiPrediction?.id
          ? <div className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full" />
          : <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full" />;
      default:
        return null;
    }
  };

  const getConfidenceBorderColor = () => {
    if (!photo.aiConfidence) return 'border-border';
    if (photo.aiConfidence >= 80) return 'border-success';
    if (photo.aiConfidence >= 50) return 'border-warning';
    return 'border-destructive';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'relative group cursor-pointer rounded-lg overflow-hidden',
        'border-2 transition-all',
        getConfidenceBorderColor(),
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={onClick}
    >
      {/* Index Number Badge */}
      <div className="absolute top-1 left-1 min-w-[1.5rem] h-6 px-1.5 rounded bg-black/70 text-white text-xs font-mono font-bold flex items-center justify-center z-10">
        {index}
      </div>

      {/* Selection checkbox */}
      <div
        className={cn(
          'absolute top-1 left-8 w-5 h-5 rounded border-2 z-10',
          'flex items-center justify-center cursor-pointer transition-opacity',
          isSelected 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'bg-background/80 border-border opacity-0 group-hover:opacity-100'
        )}
        onClick={onSelect}
      >
        {isSelected && <Check className="w-3 h-3" />}
      </div>

      {/* Image */}
      <img
        src={photo.preview}
        alt=""
        className={cn(sizeClass, 'object-cover')}
      />

      {/* Status indicator */}
      {getStatusIndicator()}

      {/* Confidence overlay */}
      {photo.aiConfidence && (
        <div className={cn(
          'absolute bottom-0 left-0 right-0',
          'bg-gradient-to-t from-foreground/70 to-transparent',
          'text-background text-xs p-1',
          showLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          'transition-opacity'
        )}>
          <div className="truncate font-medium">
            {photo.aiPrediction?.name || 'Unknown'}
          </div>
          <div className="opacity-80">
            {photo.aiConfidence}%
          </div>
        </div>
      )}

      {/* New subtype indicator */}
      {photo.isNewSubtype && (
        <div className="absolute top-1 left-7">
          <Sparkles className="w-3 h-3 text-warning" />
        </div>
      )}
    </motion.div>
  );
}

function PhotoDetailModal({
  photo,
  subtypes,
  open,
  onClose,
  onUpdate,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: {
  photo?: BulkPhoto;
  subtypes: Subtype[];
  open: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<BulkPhoto>) => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number;
  totalCount: number;
}) {
  const [notes, setNotes] = useState(photo?.notes || '');
  const [selectedSubtype, setSelectedSubtype] = useState(
    photo?.confirmedSubtype?.id || photo?.aiPrediction?.id || ''
  );

  // Update local state when photo changes
  useMemo(() => {
    setNotes(photo?.notes || '');
    setSelectedSubtype(photo?.confirmedSubtype?.id || photo?.aiPrediction?.id || '');
  }, [photo]);

  if (!photo) return null;

  const handleSave = () => {
    const subtype = subtypes.find(s => s.id === selectedSubtype);
    onUpdate({
      confirmedSubtype: subtype || null,
      notes,
      status: 'confirmed'
    });
    onNext();
  };

  const handleConfirmCorrect = () => {
    onUpdate({
      confirmedSubtype: photo.aiPrediction,
      status: 'confirmed'
    });
    onNext();
  };

  const subtypesBySeasons = useMemo(() => {
    const grouped: Record<string, Subtype[]> = { spring: [], summer: [], autumn: [], winter: [] };
    subtypes.forEach(s => {
      if (grouped[s.season]) {
        grouped[s.season].push(s);
      }
    });
    return grouped;
  }, [subtypes]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="flex">
          {/* Left: Photo */}
          <div className="flex-1 bg-foreground/95 flex items-center justify-center relative min-h-[500px]">
            <img
              src={photo.preview}
              alt=""
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Navigation arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-foreground/50 text-background px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {totalCount}
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-96 flex flex-col bg-card">
            <DialogHeader className="p-4 border-b">
              <DialogTitle className="font-serif">Photo Details</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* AI Prediction */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">AI Prediction</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg">
                    {photo.aiPrediction?.name || 'Not analyzed'}
                  </span>
                  {photo.aiConfidence && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        photo.aiConfidence >= 80 ? 'border-success text-success' :
                        photo.aiConfidence >= 50 ? 'border-warning text-warning' :
                        'border-destructive text-destructive'
                      )}
                    >
                      {photo.aiConfidence}%
                    </Badge>
                  )}
                </div>
                {photo.aiPrediction?.season && (
                  <div className="text-sm text-muted-foreground mt-1 capitalize">
                    {photo.aiPrediction.season}
                  </div>
                )}
              </div>

              {/* Extracted Features */}
              {photo.extractedFeatures && (
                <div>
                  <div className="text-sm font-medium mb-2">Extracted Features</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Undertone:</span>
                      <span className="ml-1 font-medium capitalize">{photo.extractedFeatures.undertone}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Depth:</span>
                      <span className="ml-1 font-medium capitalize">{photo.extractedFeatures.depth}</span>
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Contrast:</span>
                      <span className="ml-1 font-medium capitalize">{photo.extractedFeatures.contrast}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Correction */}
              <div>
                <div className="text-sm font-medium mb-2">Correct Subtype</div>
                <Select value={selectedSubtype} onValueChange={setSelectedSubtype}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subtype..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(subtypesBySeasons).map(([season, types]) => (
                      <SelectGroup key={season}>
                        <SelectLabel className="capitalize">{season}</SelectLabel>
                        {types.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                            {type.id === photo.aiPrediction?.id ? ' ✓' : ''}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <div className="text-sm font-medium mb-2">Notes</div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this photo..."
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t space-y-2">
              <Button onClick={handleConfirmCorrect} variant="outline" className="w-full border-success text-success">
                <Check className="w-4 h-4 mr-2" />
                AI is Correct
              </Button>
              <Button onClick={handleSave} className="w-full">
                Save & Next
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SeasonIcon({ season }: { season: string }) {
  switch (season.toLowerCase()) {
    case 'spring': return <span>🌸</span>;
    case 'summer': return <span>☀️</span>;
    case 'autumn': return <span>🍂</span>;
    case 'winter': return <span>❄️</span>;
    default: return <span>❓</span>;
  }
}
