import { motion } from 'framer-motion';
import { type Subtype, getSeasonBadge } from '@/data/subtypes';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisResultProps {
  predictions: {
    subtype: Subtype;
    confidence: number;
  }[];
  extractedFeatures?: {
    skinUndertone: 'warm' | 'cool' | 'neutral';
    skinDepth: 'light' | 'medium' | 'deep';
    eyeColor: string;
    hairColor: string;
    contrastLevel: 'low' | 'medium' | 'medium-high' | 'high';
  };
}

export function AnalysisResult({ predictions, extractedFeatures }: AnalysisResultProps) {
  const topPrediction = predictions[0];
  const isHighConfidence = topPrediction?.confidence >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main prediction */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Top Prediction</p>
            <h3 className="font-serif text-2xl font-bold">{topPrediction?.subtype.name}</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            isHighConfidence 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          }`}>
            {isHighConfidence ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {topPrediction?.confidence}% confidence
          </div>
        </div>

        <Badge className={getSeasonBadge(topPrediction?.subtype.season)}>
          {topPrediction?.subtype.season}
        </Badge>

        {/* Color palette preview */}
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-2">Recommended Palette</p>
          <div className="flex gap-1">
            {topPrediction?.subtype.palette.skinTones?.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="h-10 flex-1 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                title={color}
              >
                {color.split(' ')[0]}
              </div>
            )) || topPrediction?.subtype.palette.colors?.slice(0, 6).map((color, i) => (
              <div
                key={i}
                className="h-10 flex-1 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground"
                title={color}
              >
                {color.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted features */}
      {extractedFeatures && (
        <div className="p-6 rounded-2xl bg-muted/50 border border-border">
          <h4 className="font-medium mb-4">Extracted Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Undertone</p>
              <p className="font-medium capitalize">{extractedFeatures.skinUndertone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Depth</p>
              <p className="font-medium capitalize">{extractedFeatures.skinDepth}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Eye Color</p>
              <p className="font-medium">{extractedFeatures.eyeColor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hair Color</p>
              <p className="font-medium">{extractedFeatures.hairColor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contrast</p>
              <p className="font-medium capitalize">{extractedFeatures.contrastLevel}</p>
            </div>
          </div>
        </div>
      )}

      {/* Alternative predictions */}
      {predictions.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Other possibilities</p>
          <div className="grid gap-3">
            {predictions.slice(1).map((prediction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-3">
                  <Badge className={getSeasonBadge(prediction.subtype.season)}>
                    {prediction.subtype.season}
                  </Badge>
                  <span className="font-medium">{prediction.subtype.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {prediction.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
