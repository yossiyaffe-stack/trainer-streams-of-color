import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Eye, Palette, User, Sun, Moon, Loader2, Check, Trash2, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { cn } from '@/lib/utils';
import { Constants } from '@/integrations/supabase/types';

interface SubtypeOption {
  id: string;
  name: string;
  season: string;
  slug: string;
}

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
  onDelete?: (id: string) => Promise<void>;
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

// Extract enum values from Constants
const SKIN_TONE_OPTIONS = Constants.public.Enums.skin_tone_name;
const EYE_COLOR_OPTIONS = Constants.public.Enums.eye_color_name;
const HAIR_COLOR_OPTIONS = Constants.public.Enums.hair_color_name;
const UNDERTONE_OPTIONS = Constants.public.Enums.undertone_type;
const CONTRAST_OPTIONS = Constants.public.Enums.contrast_level_type;
const DEPTH_OPTIONS = Constants.public.Enums.depth_type;
const SEASON_OPTIONS = Constants.public.Enums.season_type;

interface EditableFields {
  skin_hex: string;
  skin_tone_name: string;
  undertone: string;
  eye_hex: string;
  eye_color_name: string;
  hair_hex: string;
  hair_color_name: string;
  contrast_level: string;
  depth: string;
  confirmed_season: string;
  confirmed_subtype: string;
}

export function FaceDetailModal({ face, onClose, onAnalyze, onUpdate, onDelete, isAnalyzing }: FaceDetailModalProps) {
  const { toast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subtypes, setSubtypes] = useState<SubtypeOption[]>([]);
  const label = face.color_label;

  // Fetch Nechama's subtypes from database
  useEffect(() => {
    async function fetchSubtypes() {
      const { data } = await supabase
        .from('subtypes')
        .select('id, name, season, slug')
        .eq('is_active', true)
        .order('season')
        .order('display_order');
      if (data) setSubtypes(data);
    }
    fetchSubtypes();
  }, []);

  // Initialize editable fields from current label
  const [editFields, setEditFields] = useState<EditableFields>({
    skin_hex: label?.skin_hex || '#c4a484',
    skin_tone_name: label?.skin_tone_name || '',
    undertone: label?.undertone || '',
    eye_hex: label?.eye_hex || '#634e34',
    eye_color_name: label?.eye_color_name || '',
    hair_hex: label?.hair_hex || '#3b2f2f',
    hair_color_name: label?.hair_color_name || '',
    contrast_level: label?.contrast_level || '',
    depth: label?.depth || '',
    confirmed_season: label?.confirmed_season || '',
    confirmed_subtype: label?.confirmed_subtype || label?.ai_predicted_subtype || '',
  });

  // Filter subtypes by selected season
  const filteredSubtypes = editFields.confirmed_season 
    ? subtypes.filter(s => s.season.toLowerCase() === editFields.confirmed_season.toLowerCase())
    : subtypes;

  const handleFieldChange = (field: keyof EditableFields, value: string) => {
    setEditFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      // Check if color_labels record exists
      const { data: existingLabel } = await supabase
        .from('color_labels')
        .select('id')
        .eq('face_image_id', face.id)
        .maybeSingle();

      // Cast enum values properly
      type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
      type SkinToneName = typeof SKIN_TONE_OPTIONS[number];
      type EyeColorName = typeof EYE_COLOR_OPTIONS[number];
      type HairColorName = typeof HAIR_COLOR_OPTIONS[number];
      type UndertoneType = typeof UNDERTONE_OPTIONS[number];
      type ContrastType = typeof CONTRAST_OPTIONS[number];
      type DepthType = typeof DEPTH_OPTIONS[number];

      const updateData = {
        skin_hex: editFields.skin_hex || null,
        skin_tone_name: (editFields.skin_tone_name || null) as SkinToneName | null,
        undertone: (editFields.undertone || null) as UndertoneType | null,
        eye_hex: editFields.eye_hex || null,
        eye_color_name: (editFields.eye_color_name || null) as EyeColorName | null,
        hair_hex: editFields.hair_hex || null,
        hair_color_name: (editFields.hair_color_name || null) as HairColorName | null,
        contrast_level: (editFields.contrast_level || null) as ContrastType | null,
        depth: (editFields.depth || null) as DepthType | null,
        confirmed_season: (editFields.confirmed_season || null) as SeasonType | null,
        confirmed_subtype: editFields.confirmed_subtype || null,
        label_status: 'manually_labeled' as const,
        labeled_at: new Date().toISOString(),
      };

      if (existingLabel) {
        const { error } = await supabase
          .from('color_labels')
          .update(updateData)
          .eq('face_image_id', face.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('color_labels')
          .insert([{ ...updateData, face_image_id: face.id }]);
        if (error) throw error;
      }

      toast({ title: 'Saved', description: 'Palette updated successfully' });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      toast({ 
        title: 'Save Failed', 
        description: err instanceof Error ? err.message : 'Could not save changes',
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setDeleting(true);
    try {
      await onDelete(face.id);
      onClose();
    } catch (err) {
      toast({ 
        title: 'Delete Failed', 
        description: err instanceof Error ? err.message : 'Could not delete face',
        variant: 'destructive' 
      });
    } finally {
      setDeleting(false);
    }
  };

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

  const formatOptionLabel = (value: string) => value.replace(/_/g, ' ').replace(/-/g, ' ');

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
                {(isEditing ? editFields.confirmed_season : label?.confirmed_season) && (
                  <Badge className={cn(SEASON_COLORS[(isEditing ? editFields.confirmed_season : label?.confirmed_season) || ''] || 'bg-muted', 'capitalize')}>
                    {isEditing ? editFields.confirmed_season : label?.confirmed_season}
                  </Badge>
                )}
                <h2 className="font-serif text-2xl font-bold mt-2">
                  {isEditing ? editFields.confirmed_subtype || 'Set Subtype' : (label?.ai_predicted_subtype || label?.confirmed_subtype || 'Unanalyzed')}
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
              <div className="flex items-center gap-1">
                {hasAnalysis && !isEditing && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsEditing(true)}
                    title="Edit Palette"
                  >
                    <Edit3 className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-5">
                {/* Season & Subtype */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Season</Label>
                    <Select 
                      value={editFields.confirmed_season} 
                      onValueChange={(v) => handleFieldChange('confirmed_season', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASON_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt} className="capitalize">
                            {formatOptionLabel(opt)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subtype (Nechama's Names)</Label>
                    <Select 
                      value={editFields.confirmed_subtype} 
                      onValueChange={(v) => handleFieldChange('confirmed_subtype', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subtype" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSubtypes.length > 0 ? (
                          filteredSubtypes.map(subtype => (
                            <SelectItem key={subtype.id} value={subtype.name}>
                              {subtype.name}
                            </SelectItem>
                          ))
                        ) : (
                          subtypes.map(subtype => (
                            <SelectItem key={subtype.id} value={subtype.name}>
                              <span className="capitalize text-muted-foreground text-xs mr-2">{subtype.season}</span>
                              {subtype.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Skin */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Skin
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={editFields.skin_hex}
                          onChange={(e) => handleFieldChange('skin_hex', e.target.value)}
                          className="w-10 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input 
                          value={editFields.skin_hex}
                          onChange={(e) => handleFieldChange('skin_hex', e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tone Name</Label>
                      <Select 
                        value={editFields.skin_tone_name} 
                        onValueChange={(v) => handleFieldChange('skin_tone_name', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {SKIN_TONE_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt} className="capitalize">
                              {formatOptionLabel(opt)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Undertone</Label>
                    <Select 
                      value={editFields.undertone} 
                      onValueChange={(v) => handleFieldChange('undertone', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select undertone" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNDERTONE_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt} className="capitalize">
                            {formatOptionLabel(opt)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Eyes */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    Eyes
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={editFields.eye_hex}
                          onChange={(e) => handleFieldChange('eye_hex', e.target.value)}
                          className="w-10 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input 
                          value={editFields.eye_hex}
                          onChange={(e) => handleFieldChange('eye_hex', e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Color Name</Label>
                      <Select 
                        value={editFields.eye_color_name} 
                        onValueChange={(v) => handleFieldChange('eye_color_name', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {EYE_COLOR_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt} className="capitalize">
                              {formatOptionLabel(opt)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Hair */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    Hair
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={editFields.hair_hex}
                          onChange={(e) => handleFieldChange('hair_hex', e.target.value)}
                          className="w-10 h-10 rounded border-0 cursor-pointer"
                        />
                        <Input 
                          value={editFields.hair_hex}
                          onChange={(e) => handleFieldChange('hair_hex', e.target.value)}
                          className="flex-1 font-mono text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Color Name</Label>
                      <Select 
                        value={editFields.hair_color_name} 
                        onValueChange={(v) => handleFieldChange('hair_color_name', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {HAIR_COLOR_OPTIONS.map(opt => (
                            <SelectItem key={opt} value={opt} className="capitalize">
                              {formatOptionLabel(opt)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contrast & Depth */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-primary" />
                      Contrast
                    </Label>
                    <Select 
                      value={editFields.contrast_level} 
                      onValueChange={(v) => handleFieldChange('contrast_level', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contrast" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTRAST_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt} className="capitalize">
                            {formatOptionLabel(opt)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-primary" />
                      Depth
                    </Label>
                    <Select 
                      value={editFields.depth} 
                      onValueChange={(v) => handleFieldChange('depth', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select depth" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPTH_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt} className="capitalize">
                            {formatOptionLabel(opt)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdits}
                    className="flex-1 gap-2"
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                <div className="flex flex-col gap-3 pt-4 border-t">
                  <div className="flex gap-2">
                    {!hasAnalysis ? (
                      <>
                        <Button 
                          onClick={() => onAnalyze(face)}
                          disabled={isAnalyzing || deleting}
                          className="flex-1 gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Analyze Face
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Manual Entry
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={() => onAnalyze(face)}
                          disabled={isAnalyzing || deleting}
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
                        
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Palette
                        </Button>
                        
                        {label?.label_status === 'ai_predicted' && (
                          <Button 
                            onClick={confirmPrediction}
                            disabled={confirming || deleting}
                            className="flex-1 gap-2 bg-success hover:bg-success/90"
                          >
                            {confirming ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            Confirm
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Delete Button */}
                  {onDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={isAnalyzing || deleting}
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete Face
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this face?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove the face image and all associated analysis data. This action cannot be undone.
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
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
}
