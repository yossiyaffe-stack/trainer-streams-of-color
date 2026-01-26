import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Eye, Palette, User, Sun, Moon, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

interface FaceDetailModalProps {
  face: FaceImage;
  onClose: () => void;
  onAnalyze: (face: FaceImage) => Promise<void>;
  onUpdate: () => void;
  isAnalyzing: boolean;
}

const SEASON_COLORS: Record<string, string> = {
  spring: 'bg-amber-100 text-amber-800 border-amber-200',
  summer: 'bg-blue-100 text-blue-800 border-blue-200',
  autumn: 'bg-orange-100 text-orange-800 border-orange-200',
  winter: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_LABELS: Record<string, string> = {
  unlabeled: 'Not Analyzed',
  ai_predicted: 'AI Predicted',
  needs_review: 'Needs Review',
  manually_labeled: 'Manually Labeled',
  expert_verified: 'Expert Verified',
  nechama_verified: 'Nechama Verified',
};

export function FaceDetailModal({ face, onClose, onAnalyze, onUpdate, isAnalyzing }: FaceDetailModalProps) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const label = face.color_label;

  const getImageUrl = () => {
    if (face.storage_path.startsWith('http')) {
      return face.storage_path;
    }
    const { data } = supabase.storage
      .from('face-images')
      .getPublicUrl(face.storage_path);
    return data.publicUrl;
  };

  const confirmPrediction = async () => {
    if (!label?.ai_predicted_subtype || !label?.confirmed_season) return;
    
    setConfirming(true);
    try {
      const { error } = await supabase
        .from('color_labels')
        .update({
          confirmed_subtype: label.ai_predicted_subtype,
          label_status: 'expert_verified',
          verified_at: new Date().toISOString(),
        })
        .eq('face_image_id', face.id);

      if (error) throw error;

      toast({ title: 'Confirmed', description: 'Prediction marked as verified' });
      onUpdate();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to confirm', variant: 'destructive' });
    } finally {
      setConfirming(false);
    }
  };

  const hasAnalysis = label && label.label_status !== 'unlabeled';

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
        className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
      >
        {/* Image */}
        <div className="md:w-1/2 bg-muted relative">
          <img
            src={getImageUrl()}
            alt={`Face ${face.source_id || face.id}`}
            className="w-full h-64 md:h-full object-contain"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                <p>Analyzing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <ScrollArea className="md:w-1/2 max-h-[60vh] md:max-h-[90vh]">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                {label?.confirmed_season && (
                  <Badge className={cn(SEASON_COLORS[label.confirmed_season] || 'bg-muted', 'capitalize')}>
                    {label.confirmed_season}
                  </Badge>
                )}
                <h2 className="font-serif text-2xl font-bold mt-2">
                  {label?.ai_predicted_subtype || label?.confirmed_subtype || 'Unanalyzed'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {STATUS_LABELS[label?.label_status || 'unlabeled']}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Source: {face.source}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Confidence */}
            {label?.ai_confidence && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Confidence
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        label.ai_confidence >= 80 ? "bg-success" :
                        label.ai_confidence >= 50 ? "bg-warning" : "bg-destructive"
                      )}
                      style={{ width: `${label.ai_confidence}%` }}
                    />
                  </div>
                  <span className="font-bold text-lg">{Math.round(label.ai_confidence)}%</span>
                </div>
              </div>
            )}

            {/* Color Analysis */}
            {hasAnalysis && (
              <>
                {/* Skin */}
                {label?.skin_hex && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Skin Tone
                    </h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-border"
                        style={{ backgroundColor: label.skin_hex }}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {label.skin_tone_name?.replace(/_/g, ' ') || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Undertone: <span className="capitalize">{label.undertone || 'Unknown'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eyes */}
                {label?.eye_hex && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      Eye Color
                    </h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full border-2 border-border"
                        style={{ backgroundColor: label.eye_hex }}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {label.eye_color_name?.replace(/_/g, ' ') || 'Unknown'}
                        </p>
                        {label.eye_details?.description && (
                          <p className="text-sm text-muted-foreground">
                            {label.eye_details.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hair */}
                {label?.hair_hex && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      Hair Color
                    </h4>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg border-2 border-border"
                        style={{ backgroundColor: label.hair_hex }}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {label.hair_color_name?.replace(/_/g, ' ') || 'Unknown'}
                        </p>
                        {label.hair_details?.is_natural !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            {label.hair_details.is_natural ? 'Natural' : 'May be dyed'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Contrast & Depth */}
                {(label?.contrast_level || label?.depth) && (
                  <div className="grid grid-cols-2 gap-4">
                    {label.contrast_level && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Sun className="w-4 h-4 text-primary" />
                          Contrast
                        </h4>
                        <Badge variant="secondary" className="capitalize">
                          {label.contrast_level.replace(/-/g, ' ')}
                        </Badge>
                        {label.contrast_value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Value: {label.contrast_value}
                          </p>
                        )}
                      </div>
                    )}
                    {label.depth && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Moon className="w-4 h-4 text-primary" />
                          Depth
                        </h4>
                        <Badge variant="secondary" className="capitalize">
                          {label.depth.replace(/-/g, ' ')}
                        </Badge>
                        {label.depth_value && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Value: {label.depth_value}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Alternatives */}
                {label?.ai_alternatives && label.ai_alternatives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Alternative Predictions</h4>
                    <div className="flex flex-wrap gap-2">
                      {label.ai_alternatives.map((alt, i) => (
                        <Badge key={i} variant="outline">
                          {alt.subtype} ({alt.confidence}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Reasoning */}
                {label?.ai_reasoning && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">💭 AI Reasoning</h4>
                    <p className="text-sm text-muted-foreground italic">
                      "{label.ai_reasoning}"
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {!hasAnalysis ? (
                <Button 
                  onClick={() => onAnalyze(face)}
                  disabled={isAnalyzing}
                  className="flex-1 gap-2"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Analyze Face
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => onAnalyze(face)}
                    disabled={isAnalyzing}
                    variant="outline"
                    className="gap-2"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Re-Analyze
                  </Button>
                  
                  {label?.label_status === 'ai_predicted' && (
                    <Button 
                      onClick={confirmPrediction}
                      disabled={confirming}
                      className="flex-1 gap-2 bg-success hover:bg-success/90"
                    >
                      {confirming ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Confirm Prediction
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}
