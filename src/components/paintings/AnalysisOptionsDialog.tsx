import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Shirt, User, Sparkles, Sun, Gem, Scissors, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type AnalysisOption = 
  | 'color_palette' 
  | 'costume' 
  | 'facial_features' 
  | 'color_scheme' 
  | 'seasons' 
  | 'jewelry' 
  | 'clothing_cut';

interface AnalysisOptionsDialogProps {
  open: boolean;
  onClose: () => void;
  onAnalyze: (options: AnalysisOption[]) => void;
  isAnalyzing: boolean;
  paintingPreview?: string;
}

const ANALYSIS_OPTIONS: { id: AnalysisOption; label: string; description: string; icon: React.ReactNode }[] = [
  { 
    id: 'color_palette', 
    label: 'Color Palette', 
    description: 'Extract dominant and accent colors',
    icon: <Palette className="w-5 h-5" />
  },
  { 
    id: 'costume', 
    label: 'Costume & Fabrics', 
    description: 'Identify fabrics, textures, and clothing styles',
    icon: <Shirt className="w-5 h-5" />
  },
  { 
    id: 'facial_features', 
    label: 'Facial Features', 
    description: 'Analyze face shape, skin tone, coloring',
    icon: <User className="w-5 h-5" />
  },
  { 
    id: 'color_scheme', 
    label: 'Color Scheme', 
    description: 'Analyze color harmony and mood',
    icon: <Sparkles className="w-5 h-5" />
  },
  { 
    id: 'seasons', 
    label: 'Seasonal Analysis', 
    description: 'Determine which season this fits',
    icon: <Sun className="w-5 h-5" />
  },
  { 
    id: 'jewelry', 
    label: 'Jewelry & Accessories', 
    description: 'Identify jewelry, metals, and accessories',
    icon: <Gem className="w-5 h-5" />
  },
  { 
    id: 'clothing_cut', 
    label: 'Cut of Clothes', 
    description: 'Analyze silhouettes, necklines, and sleeves',
    icon: <Scissors className="w-5 h-5" />
  },
];

export function AnalysisOptionsDialog({ 
  open, 
  onClose, 
  onAnalyze, 
  isAnalyzing,
  paintingPreview 
}: AnalysisOptionsDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<AnalysisOption[]>([
    'color_palette', 'costume', 'seasons', 'jewelry', 'clothing_cut'
  ]);

  const toggleOption = (option: AnalysisOption) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const selectAll = () => {
    setSelectedOptions(ANALYSIS_OPTIONS.map(o => o.id));
  };

  const selectNone = () => {
    setSelectedOptions([]);
  };

  const handleAnalyze = () => {
    if (selectedOptions.length > 0) {
      onAnalyze(selectedOptions);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-2xl font-bold">🎨 Analysis Options</h2>
              <p className="text-muted-foreground mt-1">Choose what aspects to analyze</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex">
            {/* Preview */}
            {paintingPreview && (
              <div className="w-48 p-4 border-r border-border hidden md:block">
                <img 
                  src={paintingPreview} 
                  alt="Painting to analyze" 
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                />
              </div>
            )}

            {/* Options */}
            <div className="flex-1 p-6">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {ANALYSIS_OPTIONS.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedOptions.includes(option.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => toggleOption(option.id)}
                  >
                    <Checkbox
                      id={option.id}
                      checked={selectedOptions.includes(option.id)}
                      onCheckedChange={() => toggleOption(option.id)}
                      className="h-6 w-6 border-2 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className={`p-2 rounded-lg ${
                      selectedOptions.includes(option.id) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <Label 
                        htmlFor={option.id} 
                        className="text-base font-semibold cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {selectedOptions.length} of {ANALYSIS_OPTIONS.length} selected
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyze} 
                disabled={selectedOptions.length === 0 || isAnalyzing}
                size="lg"
                className="font-bold"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze Painting
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
