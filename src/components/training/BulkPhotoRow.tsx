import { useState, useMemo } from 'react';
import { BulkPhoto } from '@/types/training';
import { Subtype } from '@/data/subtypes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, X, ChevronDown, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BulkPhotoRowProps {
  photo: BulkPhoto;
  allSubtypes: Subtype[];
  onConfirmCorrect: () => void;
  onChangeSubtype: (subtypeId: string) => void;
  onUpdateNotes: (notes: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onEndEdit: () => void;
}

export function BulkPhotoRow({
  photo,
  allSubtypes,
  onConfirmCorrect,
  onChangeSubtype,
  onUpdateNotes,
  isEditing,
  onStartEdit,
  onEndEdit,
}: BulkPhotoRowProps) {
  const [localNotes, setLocalNotes] = useState(photo.notes);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const getStatusBg = () => {
    switch (photo.status) {
      case 'pending': return 'bg-muted/30';
      case 'analyzing': return 'bg-warning/10';
      case 'analyzed': return 'bg-primary/5';
      case 'confirmed': 
        return photo.confirmedSubtype?.id === photo.aiPrediction?.id 
          ? 'bg-success/10' 
          : 'bg-warning/10';
      case 'error': return 'bg-destructive/10';
      default: return '';
    }
  };

  const getConfidenceBadge = (conf: number) => {
    if (conf >= 80) return 'bg-success/20 text-success border-success/30';
    if (conf >= 60) return 'bg-primary/20 text-primary border-primary/30';
    if (conf >= 40) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-destructive/20 text-destructive border-destructive/30';
  };

  const saveNotes = () => {
    onUpdateNotes(localNotes);
    onEndEdit();
  };

  const subtypesBySeasons = useMemo(() => {
    const grouped: Record<string, Subtype[]> = { spring: [], summer: [], autumn: [], winter: [] };
    allSubtypes.forEach(s => {
      if (grouped[s.season]) {
        grouped[s.season].push(s);
      }
    });
    return grouped;
  }, [allSubtypes]);

  return (
    <tr className={cn('hover:bg-muted/50 transition-colors', getStatusBg())}>
      {/* Photo Thumbnail */}
      <td className="px-4 py-3">
        <div className="relative">
          <img 
            src={photo.preview} 
            alt={photo.filename}
            className="w-16 h-16 object-cover rounded-lg shadow-sm hover:scale-150 hover:z-10 transition-transform cursor-pointer"
          />
          {photo.status === 'analyzing' && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          )}
          {photo.isNewSubtype && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-warning-foreground" />
            </div>
          )}
        </div>
      </td>

      {/* Extracted Features */}
      <td className="px-4 py-3">
        {photo.extractedFeatures ? (
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Undertone:</span>
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs',
                  photo.extractedFeatures.undertone === 'warm' && 'border-autumn/50 text-autumn',
                  photo.extractedFeatures.undertone === 'cool' && 'border-winter/50 text-winter',
                  photo.extractedFeatures.undertone === 'neutral' && 'border-muted-foreground/50'
                )}
              >
                {photo.extractedFeatures.undertone}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Depth:</span>
              <span className="font-medium text-foreground">{photo.extractedFeatures.depth}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Contrast:</span>
              <span className="font-medium text-foreground">{photo.extractedFeatures.contrast}</span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>

      {/* AI Prediction */}
      <td className="px-4 py-3">
        {photo.aiPrediction ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{photo.aiPrediction.name}</span>
              <Badge 
                variant="outline" 
                className={cn('text-xs', getConfidenceBadge(photo.aiConfidence || 0))}
              >
                {photo.aiConfidence}%
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground capitalize">{photo.aiPrediction.season}</div>
            
            {photo.aiAlternatives?.length > 0 && (
              <div className="mt-1">
                <button 
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {showAlternatives ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  Alternatives
                </button>
                {showAlternatives && (
                  <div className="mt-1 space-y-0.5 pl-4">
                    {photo.aiAlternatives.map((alt, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        • {alt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Not analyzed</span>
        )}
      </td>

      {/* Confirmed Type (Editable) */}
      <td className="px-4 py-3">
        {(photo.status === 'analyzed' || photo.status === 'confirmed') ? (
          <Select
            value={photo.confirmedSubtype?.id || ''}
            onValueChange={onChangeSubtype}
          >
            <SelectTrigger 
              className={cn(
                'w-full text-sm',
                photo.confirmedSubtype && (
                  photo.confirmedSubtype.id === photo.aiPrediction?.id
                    ? 'border-success/50 bg-success/5'
                    : 'border-warning/50 bg-warning/5'
                )
              )}
            >
              <SelectValue placeholder="Select Type..." />
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
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>

      {/* Notes */}
      <td className="px-4 py-3">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveNotes()}
              placeholder="Add notes..."
              className="text-sm h-8"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={saveNotes} className="h-8 w-8 text-success">
              <Check className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onEndEdit} className="h-8 w-8 text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div 
            onClick={onStartEdit}
            className="text-sm text-foreground cursor-pointer hover:bg-muted/50 rounded px-2 py-1 min-h-[28px]"
          >
            {photo.notes || <span className="text-muted-foreground italic">Click to add notes...</span>}
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        {photo.status === 'analyzed' && (
          <Button
            onClick={onConfirmCorrect}
            size="sm"
            variant="outline"
            className="text-xs border-success/50 text-success hover:bg-success/10"
          >
            <Check className="w-3 h-3 mr-1" />
            Correct
          </Button>
        )}
        {photo.status === 'confirmed' && (
          <Badge 
            variant="outline"
            className={cn(
              'text-xs',
              photo.confirmedSubtype?.id === photo.aiPrediction?.id
                ? 'border-success/50 text-success bg-success/10'
                : 'border-warning/50 text-warning bg-warning/10'
            )}
          >
            {photo.confirmedSubtype?.id === photo.aiPrediction?.id ? '✓ Verified' : '↻ Corrected'}
          </Badge>
        )}
        {photo.status === 'pending' && (
          <span className="text-xs text-muted-foreground">Waiting...</span>
        )}
      </td>
    </tr>
  );
}
