import { useState, useMemo } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { StatusDot } from '../StatusDot';
import { cn } from '@/lib/utils';

export function PhotoGridTab() {
  const { photos, subtypes, confirmPhoto, confirmPhotoCorrect } = useHub();
  const [filter, setFilter] = useState<'analyzed' | 'confirmed' | 'all'>('analyzed');
  const [viewSize, setViewSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'all') return photos.filter(p => p.status !== 'pending');
    return photos.filter(p => p.status === filter);
  }, [photos, filter]);

  const sizes = { 
    small: 'grid-cols-10', 
    medium: 'grid-cols-6', 
    large: 'grid-cols-4' 
  };
  const thumbSizes = { 
    small: 'w-16 h-16', 
    medium: 'w-28 h-28', 
    large: 'w-40 h-40' 
  };

  const expandedPhoto = expanded ? photos.find(p => p.id === expanded) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-card border-b p-4 flex items-center justify-between">
        <div className="flex gap-2">
          {(['analyzed', 'confirmed', 'all'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === 'analyzed' ? 'Needs Review' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{filtered.length} photos</span>
          <div className="flex bg-muted rounded p-1">
            {(['small', 'medium', 'large'] as const).map(s => (
              <button 
                key={s} 
                onClick={() => setViewSize(s)}
                className={cn(
                  'px-2 py-1 rounded text-xs',
                  viewSize === s ? 'bg-card shadow' : ''
                )}
              >
                {s === 'small' ? '▪▪' : s === 'medium' ? '⊞' : '⬜'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className={cn('grid gap-2', sizes[viewSize])}>
          {filtered.map(photo => (
            <div 
              key={photo.id} 
              onClick={() => setExpanded(photo.id)}
              className={cn(
                'relative rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform border-2',
                photo.status === 'confirmed' 
                  ? photo.confirmedSubtype?.id === photo.aiPrediction?.id 
                    ? 'border-success' 
                    : 'border-warning'
                  : (photo.aiConfidence ?? 0) >= 80 
                    ? 'border-success/50' 
                    : (photo.aiConfidence ?? 0) >= 50 
                      ? 'border-warning/50' 
                      : 'border-destructive/50'
              )}
            >
              <img src={photo.preview} alt="" className={cn(thumbSizes[viewSize], 'object-cover')} />
              <StatusDot status={photo.status} confidence={photo.aiConfidence} />
              {viewSize === 'large' && photo.aiPrediction && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                  {photo.aiPrediction.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Modal */}
      {expandedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div 
            className="bg-card rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex gap-6">
              <img 
                src={expandedPhoto.preview} 
                alt="" 
                className="w-48 h-48 object-cover rounded-lg" 
              />
              <div className="flex-1 space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">AI Prediction</div>
                  <div className="text-lg font-medium">{expandedPhoto.aiPrediction?.name || '-'}</div>
                  {expandedPhoto.aiConfidence && (
                    <span className={cn(
                      'inline-block mt-1 px-2 py-0.5 rounded text-sm',
                      (expandedPhoto.aiConfidence ?? 0) >= 80 ? 'bg-success/10 text-success' : 
                      (expandedPhoto.aiConfidence ?? 0) >= 50 ? 'bg-warning/10 text-warning' : 
                      'bg-destructive/10 text-destructive'
                    )}>
                      {expandedPhoto.aiConfidence}%
                    </span>
                  )}
                </div>
                {expandedPhoto.extractedFeatures && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted rounded p-2">
                      <span className="text-muted-foreground">Undertone:</span> {expandedPhoto.extractedFeatures.undertone}
                    </div>
                    <div className="bg-muted rounded p-2">
                      <span className="text-muted-foreground">Depth:</span> {expandedPhoto.extractedFeatures.depth}
                    </div>
                    <div className="bg-muted rounded p-2">
                      <span className="text-muted-foreground">Contrast:</span> {expandedPhoto.extractedFeatures.contrast}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {expandedPhoto.status === 'analyzed' && (
                    <Button 
                      onClick={() => {
                        confirmPhotoCorrect(expandedPhoto.id);
                        setExpanded(null);
                      }}
                      className="bg-success hover:bg-success/90"
                    >
                      ✓ AI is Correct
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setExpanded(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
