import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Shirt, Sparkles, Crown, Gem, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Painting } from '@/types/paintings';

interface PaintingDetailModalProps {
  painting: Painting;
  onClose: () => void;
  onDelete?: () => void;
}

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-amber-100 text-amber-800 border-amber-200',
  Summer: 'bg-blue-100 text-blue-800 border-blue-200',
  Autumn: 'bg-orange-100 text-orange-800 border-orange-200',
  Winter: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function PaintingDetailModal({ painting, onClose, onDelete }: PaintingDetailModalProps) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  
  const analysis = painting.ai_analysis || {};
  const colors = analysis.colors || {};
  const mood = analysis.mood || {};
  const jewelry = analysis.jewelry_accessories || {};
  const seasons = analysis.suggested_seasons || {};

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete from database
      const { error } = await supabase
        .from('paintings')
        .delete()
        .eq('id', painting.id);

      if (error) throw error;

      // If stored in Supabase storage, delete the file too
      if (painting.image_url && !painting.image_url.startsWith('http')) {
        await supabase.storage.from('paintings').remove([painting.image_url]);
      }

      toast({ title: 'Deleted', description: 'Painting removed from library' });
      onDelete?.();
      onClose();
    } catch (err) {
      toast({ 
        title: 'Delete Failed', 
        description: err instanceof Error ? err.message : 'Could not delete painting',
        variant: 'destructive' 
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Image */}
        <div className="md:w-1/2 bg-muted">
          <img
            src={painting.image_url}
            alt={painting.title || 'Painting'}
            className="w-full h-64 md:h-full object-contain"
          />
        </div>

        {/* Details */}
        <ScrollArea className="md:w-1/2 max-h-[60vh] md:max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                {painting.suggested_season && (
                  <Badge className={SEASON_COLORS[painting.suggested_season] || 'bg-muted'}>
                    {painting.suggested_season}
                  </Badge>
                )}
                <h2 className="font-serif text-2xl font-bold mt-2">
                  {painting.title || 'Untitled'}
                </h2>
                {painting.artist && (
                  <p className="text-muted-foreground">{painting.artist}</p>
                )}
                {painting.era && (
                  <p className="text-sm text-muted-foreground">{painting.era}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Palette Effect */}
            {painting.palette_effect && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Palette Effect
                </h4>
                <p className="text-lg font-serif text-primary">{painting.palette_effect}</p>
              </div>
            )}

            {/* Mood */}
            {painting.mood_primary && (
              <div>
                <h4 className="font-medium mb-2">Mood</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{painting.mood_primary}</Badge>
                  {painting.mood_secondary?.map((m) => (
                    <Badge key={m} variant="outline">{m}</Badge>
                  ))}
                </div>
                {mood.feeling && (
                  <p className="text-sm text-muted-foreground mt-2 italic">"{mood.feeling}"</p>
                )}
              </div>
            )}

            {/* Colors */}
            {(colors.dominant?.length || colors.accent?.length) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Colors
                </h4>
                <div className="space-y-2">
                  {colors.dominant && (
                    <div className="flex flex-wrap gap-2">
                      {colors.dominant.map((color) => (
                        <span key={color} className="px-3 py-1 rounded-full bg-primary/10 text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                  {colors.accent && (
                    <div className="flex flex-wrap gap-2">
                      {colors.accent.map((color) => (
                        <span key={color} className="px-3 py-1 rounded-full bg-muted text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fabrics */}
            {painting.fabrics && painting.fabrics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-primary" />
                  Fabrics
                </h4>
                <p className="text-muted-foreground">
                  {painting.fabrics.join(' • ')}
                </p>
              </div>
            )}

            {/* Silhouette & Details */}
            {(painting.silhouette || painting.neckline || painting.sleeves) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-primary" />
                  Style Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {painting.silhouette && (
                    <div>
                      <span className="text-muted-foreground">Silhouette:</span>{' '}
                      {painting.silhouette}
                    </div>
                  )}
                  {painting.neckline && (
                    <div>
                      <span className="text-muted-foreground">Neckline:</span>{' '}
                      {painting.neckline}
                    </div>
                  )}
                  {painting.sleeves && (
                    <div>
                      <span className="text-muted-foreground">Sleeves:</span>{' '}
                      {painting.sleeves}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jewelry */}
            {(painting.jewelry_types?.length || jewelry.metals?.length) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-primary" />
                  Jewelry
                </h4>
                <div className="space-y-1 text-sm">
                  {painting.jewelry_types && painting.jewelry_types.length > 0 && (
                    <p>{painting.jewelry_types.join(', ')}</p>
                  )}
                  {jewelry.metals && (
                    <p className="text-muted-foreground">
                      Metals: {jewelry.metals.join(', ')}
                    </p>
                  )}
                  {jewelry.style && (
                    <p className="text-muted-foreground">Style: {jewelry.style}</p>
                  )}
                </div>
              </div>
            )}

            {/* Best For */}
            {painting.best_for && painting.best_for.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Best For</h4>
                <div className="flex flex-wrap gap-2">
                  {painting.best_for.map((use) => (
                    <Badge key={use} variant="outline">{use}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Client Talking Points */}
            {painting.client_talking_points && painting.client_talking_points.length > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">💬 Client Talking Points</h4>
                <ul className="space-y-2 text-sm">
                  {painting.client_talking_points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Season Reasoning */}
            {seasons.reasoning && (
              <div className="text-sm text-muted-foreground border-t pt-4">
                <strong>Why {painting.suggested_season}?</strong> {seasons.reasoning}
              </div>
            )}

            {/* Delete Button */}
            <div className="pt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Painting
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this painting?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{painting.title || 'this painting'}" from your library. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}