import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type Subtype, type Season, getSeasonBadge } from '@/data/subtypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  AlertCircle, 
  Save, 
  Loader2,
  ChevronDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  onSaveCorrection?: (correctedData: CorrectedAnalysis) => void;
}

export interface CorrectedAnalysis {
  confirmedSubtype: string;
  confirmedSeason: string;
  undertone: string;
  depth: string;
  eyeColor: string;
  hairColor: string;
  contrastLevel: string;
  notes: string;
}

const UNDERTONE_OPTIONS = ['warm', 'cool', 'neutral', 'warm-neutral', 'cool-neutral'];
const DEPTH_OPTIONS = ['light', 'light-medium', 'medium', 'medium-deep', 'deep'];
const CONTRAST_OPTIONS = ['low', 'low-medium', 'medium', 'medium-high', 'high'];
const SEASON_OPTIONS = ['spring', 'summer', 'autumn', 'winter'];

export function AnalysisResult({ predictions, extractedFeatures, onSaveCorrection }: AnalysisResultProps) {
  const topPrediction = predictions[0];
  const isHighConfidence = topPrediction?.confidence >= 80;

  // Editable state - all strings for flexibility
  const [confirmedSubtype, setConfirmedSubtype] = useState(topPrediction?.subtype.name || '');
  const [confirmedSeason, setConfirmedSeason] = useState<string>(topPrediction?.subtype.season || '');
  const [undertone, setUndertone] = useState<string>(extractedFeatures?.skinUndertone || 'neutral');
  const [depth, setDepth] = useState<string>(extractedFeatures?.skinDepth || 'medium');
  const [eyeColor, setEyeColor] = useState(extractedFeatures?.eyeColor || '');
  const [hairColor, setHairColor] = useState(extractedFeatures?.hairColor || '');
  const [contrastLevel, setContrastLevel] = useState<string>(extractedFeatures?.contrastLevel || 'medium');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Available subtypes from database
  const [subtypes, setSubtypes] = useState<Array<{ id: string; name: string; season: string; slug: string }>>([]);

  useEffect(() => {
    async function loadSubtypes() {
      const { data } = await supabase
        .from('subtypes')
        .select('id, name, season, slug')
        .eq('is_active', true)
        .order('season')
        .order('name');
      
      if (data) setSubtypes(data);
    }
    loadSubtypes();
  }, []);

  // Group subtypes by season
  const subtypesBySeason = subtypes.reduce((acc, st) => {
    if (!acc[st.season]) acc[st.season] = [];
    acc[st.season].push(st);
    return acc;
  }, {} as Record<string, typeof subtypes>);

  const handleSubtypeChange = (subtypeName: string) => {
    setConfirmedSubtype(subtypeName);
    // Auto-sync season
    const selected = subtypes.find(s => s.name === subtypeName);
    if (selected) {
      setConfirmedSeason(selected.season);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    const correctedData: CorrectedAnalysis = {
      confirmedSubtype,
      confirmedSeason,
      undertone,
      depth,
      eyeColor,
      hairColor,
      contrastLevel,
      notes,
    };

    try {
      if (onSaveCorrection) {
        onSaveCorrection(correctedData);
      }
      toast.success('Corrections saved for training');
    } catch (err) {
      console.error('Failed to save corrections:', err);
      toast.error('Failed to save corrections');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    confirmedSubtype !== (topPrediction?.subtype.name || '') ||
    undertone !== (extractedFeatures?.skinUndertone || 'neutral') ||
    depth !== (extractedFeatures?.skinDepth || 'medium') ||
    eyeColor !== (extractedFeatures?.eyeColor || '') ||
    hairColor !== (extractedFeatures?.hairColor || '') ||
    contrastLevel !== (extractedFeatures?.contrastLevel || 'medium') ||
    notes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main prediction - Editable */}
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">AI Prediction</p>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl text-muted-foreground line-through">
                {topPrediction?.subtype.name}
              </span>
              <span className="text-muted-foreground">→</span>
            </div>
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
            {topPrediction?.confidence}%
          </div>
        </div>

        {/* Editable Subtype Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Correct Subtype (Nechama's Classification)</label>
            <Select value={confirmedSubtype} onValueChange={handleSubtypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select correct subtype..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {SEASON_OPTIONS.map(season => (
                  <div key={season}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50">
                      {season}
                    </div>
                    {subtypesBySeason[season]?.map(st => (
                      <SelectItem key={st.id} value={st.name}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getSeasonBadge(confirmedSeason as Season)}>
              {confirmedSeason || 'Season'}
            </Badge>
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Modified
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Extracted features - All Editable */}
      <div className="p-6 rounded-2xl bg-muted/50 border border-border">
        <h4 className="font-medium mb-4">Edit Extracted Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Undertone</label>
            <Select value={undertone} onValueChange={setUndertone}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNDERTONE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="capitalize">
                    {opt.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Depth</label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPTH_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="capitalize">
                    {opt.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Contrast</label>
            <Select value={contrastLevel} onValueChange={setContrastLevel}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRAST_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="capitalize">
                    {opt.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Eye Color</label>
            <Input 
              value={eyeColor} 
              onChange={(e) => setEyeColor(e.target.value)}
              placeholder="e.g. Blue-Green"
              className="h-9"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Hair Color</label>
            <Input 
              value={hairColor} 
              onChange={(e) => setHairColor(e.target.value)}
              placeholder="e.g. Golden Blonde"
              className="h-9"
            />
          </div>
        </div>

        {/* Notes for training */}
        <div className="mt-4">
          <label className="text-xs text-muted-foreground block mb-1">Training Notes (Why this correction?)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain why you're making this correction to help train the AI..."
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>

      {/* Save Button */}
      <Button 
        onClick={handleSave} 
        disabled={saving || !confirmedSubtype}
        className="w-full"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Correction for Training
          </>
        )}
      </Button>

      {/* Alternative predictions */}
      {predictions.length > 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">AI Alternatives (click to use)</p>
          <div className="grid gap-2">
            {predictions.slice(1).map((prediction, index) => (
              <button
                key={index}
                onClick={() => {
                  setConfirmedSubtype(prediction.subtype.name);
                  setConfirmedSeason(prediction.subtype.season);
                }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-colors text-left",
                  confirmedSubtype === prediction.subtype.name
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/30 border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge className={getSeasonBadge(prediction.subtype.season as Season)}>
                    {prediction.subtype.season}
                  </Badge>
                  <span className="font-medium">{prediction.subtype.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {prediction.confidence}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
