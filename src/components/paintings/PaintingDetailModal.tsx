import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Shirt, Sparkles, Crown, Gem, Trash2, Loader2, Check, Tag, Wand2, Settings2, Save, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { Painting, PaintingAnalysis } from '@/types/paintings';
import { AddSubtypeDialog } from '@/components/shared/AddSubtypeDialog';
import { AnalysisOptionsDialog, type AnalysisOption } from './AnalysisOptionsDialog';

interface Subtype {
  id: string;
  name: string;
  slug: string;
  season: string;
}

interface PaintingDetailModalProps {
  painting: Painting;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const SEASON_COLORS: Record<string, string> = {
  Spring: 'bg-amber-100 text-amber-800 border-amber-200',
  Summer: 'bg-blue-100 text-blue-800 border-blue-200',
  Autumn: 'bg-orange-100 text-orange-800 border-orange-200',
  Winter: 'bg-purple-100 text-purple-800 border-purple-200',
  spring: 'bg-amber-100 text-amber-800 border-amber-200',
  summer: 'bg-blue-100 text-blue-800 border-blue-200',
  autumn: 'bg-orange-100 text-orange-800 border-orange-200',
  winter: 'bg-purple-100 text-purple-800 border-purple-200',
};

const SEASON_EMOJIS: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
  Spring: '🌸',
  Summer: '☀️',
  Autumn: '🍂',
  Winter: '❄️',
};

export function PaintingDetailModal({ painting: initialPainting, onClose, onDelete, onUpdate }: PaintingDetailModalProps) {
  const { toast } = useToast();
  const [painting, setPainting] = useState(initialPainting);
  const [deleting, setDeleting] = useState(false);
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSubtypes, setLoadingSubtypes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  
  // Editable fields
  const [editedTitle, setEditedTitle] = useState(initialPainting.title || '');
  const [editedNotes, setEditedNotes] = useState(initialPainting.notes || '');
  const [hasEdits, setHasEdits] = useState(false);
  const [savingEdits, setSavingEdits] = useState(false);
  const [isPalettePainting, setIsPalettePainting] = useState(
    initialPainting.status === 'palette' || initialPainting.tags?.includes('Palette Painting')
  );
  
  const analysis = painting.ai_analysis || {};
  const colors = analysis.colors || {};
  const mood = analysis.mood || {};
  const jewelry = analysis.jewelry_accessories || {};
  const seasons = analysis.suggested_seasons || {};

  const isNotAnalyzed = painting.status === 'pending' || !painting.ai_analysis || Object.keys(painting.ai_analysis).length === 0;

  // Track edits
  useEffect(() => {
    const titleChanged = editedTitle !== (painting.title || '');
    const notesChanged = editedNotes !== (painting.notes || '');
    setHasEdits(titleChanged || notesChanged);
  }, [editedTitle, editedNotes, painting.title, painting.notes]);

  // Fetch subtypes on mount
  useEffect(() => {
    const fetchSubtypes = async () => {
      setLoadingSubtypes(true);
      const { data, error } = await supabase
        .from('subtypes')
        .select('id, name, slug, season')
        .eq('is_active', true)
        .order('season')
        .order('display_order');
      
      if (!error && data) {
        setSubtypes(data);
      }
      setLoadingSubtypes(false);
    };
    fetchSubtypes();
  }, []);

  // Initialize selected subtype from painting
  useEffect(() => {
    if (painting.palette_effect && subtypes.length > 0) {
      const match = subtypes.find(s => s.name === painting.palette_effect || s.slug === painting.palette_effect);
      if (match) {
        setSelectedSubtype(match.id);
      }
    }
  }, [painting, subtypes]);

  // Group subtypes by season
  const subtypesBySeason = subtypes.reduce((acc, subtype) => {
    const season = subtype.season.toLowerCase();
    if (!acc[season]) acc[season] = [];
    acc[season].push(subtype);
    return acc;
  }, {} as Record<string, Subtype[]>);

  const handleSubtypeChange = async (subtypeId: string) => {
    setSelectedSubtype(subtypeId);
    setSaving(true);
    
    const subtype = subtypes.find(s => s.id === subtypeId);
    if (!subtype) {
      setSaving(false);
      return;
    }

    try {
      const newSeason = subtype.season.charAt(0).toUpperCase() + subtype.season.slice(1);
      
      // Don't send tags - let the database trigger regenerate them
      // The trigger will auto-include the new suggested_season
      const { error } = await supabase
        .from('paintings')
        .update({
          palette_effect: subtype.name,
          suggested_season: newSeason,
          status: 'palette',
        })
        .eq('id', painting.id);

      if (error) throw error;

      setPainting(prev => ({
        ...prev,
        palette_effect: subtype.name,
        suggested_season: newSeason,
        status: 'palette',
      }));

      setIsPalettePainting(true);

      toast({
        title: '🎨 Classified & Added to Palette',
        description: `Set to ${subtype.name} (${subtype.season})`,
      });

      onUpdate?.();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save subtype',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const runAnalysis = async (options?: AnalysisOption[]) => {
    setAnalyzing(true);
    setShowAnalysisOptions(false);
    
    try {
      // Fetch the image and convert to base64
      const response = await fetch(painting.image_url);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Call AI analysis with options
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-painting', {
          body: { imageBase64: base64, analysisOptions: options }
        });

      if (analysisError) throw analysisError;

      const analysisResult = analysisData.analysis;

      // Update database with analysis results
      const updateData = {
        ai_analysis: analysisResult,
        title: analysisResult.title_suggestion || painting.title,
        artist: analysisResult.artist_detected || painting.artist,
        era: analysisResult.era_detected || painting.era,
        fabrics: [...(analysisResult.fabrics?.primary || []), ...(analysisResult.fabrics?.secondary || [])],
        silhouette: analysisResult.silhouette?.primary,
        neckline: analysisResult.neckline,
        sleeves: analysisResult.sleeves,
        color_mood: analysisResult.colors?.color_mood,
        palette_effect: analysisResult.palette_effect || painting.palette_effect,
        prints_patterns: analysisResult.prints_patterns,
        jewelry_types: analysisResult.jewelry_accessories?.items,
        mood_primary: analysisResult.mood?.primary,
        mood_secondary: analysisResult.mood?.secondary,
        suggested_season: analysisResult.suggested_seasons?.primary || painting.suggested_season,
        best_for: analysisResult.best_for,
        client_talking_points: analysisResult.client_talking_points,
        status: 'analyzed',
        analyzed_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('paintings')
        .update(updateData)
        .eq('id', painting.id);

      if (updateError) throw updateError;

      // Update local state
      setPainting(prev => ({
        ...prev,
        ...updateData,
        ai_analysis: analysisResult as PaintingAnalysis,
      }));

      toast({
        title: '✨ Analysis Complete',
        description: `Analyzed: ${analysisResult.title_suggestion || painting.title}`,
      });

      onUpdate?.();

    } catch (err) {
      console.error('Analysis error:', err);
      toast({
        title: 'Analysis Failed',
        description: err instanceof Error ? err.message : 'Could not analyze painting',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

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
      if (painting.image_url && painting.image_url.includes('supabase')) {
        const path = painting.image_url.split('/paintings/')[1];
        if (path) {
          await supabase.storage.from('paintings').remove([`paintings/${path}`]);
        }
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

  const saveEdits = async () => {
    setSavingEdits(true);
    try {
      const currentTags = painting.tags || [];
      let updatedTags = currentTags.filter(t => t !== 'Palette Painting');
      
      if (isPalettePainting) {
        updatedTags = [...updatedTags, 'Palette Painting'];
      }

      const { error } = await supabase
        .from('paintings')
        .update({
          title: editedTitle.trim() || null,
          notes: editedNotes.trim() || null,
          tags: updatedTags,
          status: isPalettePainting ? 'palette' : painting.status,
        })
        .eq('id', painting.id);

      if (error) throw error;

      setPainting(prev => ({
        ...prev,
        title: editedTitle.trim() || null,
        notes: editedNotes.trim() || null,
        tags: updatedTags,
        status: isPalettePainting ? 'palette' : prev.status,
      }));

      setHasEdits(false);

      toast({
        title: isPalettePainting ? '🎨 Saved to Palette Paintings' : '✓ Changes Saved',
        description: editedTitle || 'Painting updated successfully',
      });

      onUpdate?.();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save changes',
        variant: 'destructive',
      });
    } finally {
      setSavingEdits(false);
    }
  };

  const saveToPalette = async () => {
    setIsPalettePainting(true);
    setSavingEdits(true);
    try {
      const currentTags = painting.tags || [];
      const updatedTags = [...currentTags.filter(t => t !== 'Palette Painting'), 'Palette Painting'];

      const { error } = await supabase
        .from('paintings')
        .update({
          title: editedTitle.trim() || painting.title,
          notes: editedNotes.trim() || painting.notes,
          tags: updatedTags,
          status: 'palette',
        })
        .eq('id', painting.id);

      if (error) throw error;

      setPainting(prev => ({
        ...prev,
        title: editedTitle.trim() || prev.title,
        notes: editedNotes.trim() || prev.notes,
        tags: updatedTags,
        status: 'palette',
      }));

      setHasEdits(false);

      toast({
        title: '🎨 Added to Palette Paintings!',
        description: `"${editedTitle || painting.title}" is now a Palette Painting`,
      });

      onUpdate?.();
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not save to palette',
        variant: 'destructive',
      });
      setIsPalettePainting(false);
    } finally {
      setSavingEdits(false);
    }
  };

  const selectedSubtypeData = subtypes.find(s => s.id === selectedSubtype);

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
        <div className="md:w-1/2 bg-muted relative">
          <img
            src={painting.image_url}
            alt={painting.title || 'Painting'}
            className="w-full h-64 md:h-full object-contain"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                <p className="font-medium">Analyzing painting...</p>
                <p className="text-sm text-white/70">This may take a moment</p>
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
                {painting.suggested_season && (
                  <Badge className={SEASON_COLORS[painting.suggested_season] || 'bg-muted'}>
                    {SEASON_EMOJIS[painting.suggested_season] || ''} {painting.suggested_season}
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

            {/* Analysis Actions */}
            {isNotAnalyzed ? (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Wand2 className="w-4 h-4" />
                  Not Analyzed Yet
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  Run AI analysis to extract colors, fabrics, silhouettes, and style recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={() => runAnalysis()} 
                    disabled={analyzing}
                    className="flex-1"
                  >
                    {analyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-2" /> Full Analysis</>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAnalysisOptions(true)}
                    disabled={analyzing}
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Custom Options
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runAnalysis()}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Re-analyzing...</>
                  ) : (
                    <><Wand2 className="w-3 h-3 mr-1" /> Re-analyze</>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAnalysisOptions(true)}
                  disabled={analyzing}
                >
                  <Settings2 className="w-3 h-3 mr-1" />
                  Options
                </Button>
              </div>
            )}

            {/* Nechama Subtype Selector */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Nechama's Classification
              </h4>
              
              {loadingSubtypes ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading subtypes...
                </div>
              ) : subtypes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subtypes found. Add subtypes in the Subtype Manager first.
                </p>
              ) : (
                <div className="space-y-3">
                  <Select
                    value={selectedSubtype || ''}
                    onValueChange={handleSubtypeChange}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select Nechama's subtype..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-[100]">
                      {['spring', 'summer', 'autumn', 'winter'].map(season => (
                        subtypesBySeason[season]?.length > 0 && (
                          <SelectGroup key={season}>
                            <SelectLabel className="flex items-center gap-2 text-xs uppercase tracking-wide">
                              {SEASON_EMOJIS[season]} {season.charAt(0).toUpperCase() + season.slice(1)}
                            </SelectLabel>
                            {subtypesBySeason[season].map(subtype => (
                              <SelectItem key={subtype.id} value={subtype.id}>
                                {subtype.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      ))}
                    </SelectContent>
                  </Select>

                  <AddSubtypeDialog
                    onSubtypeAdded={(newSubtype) => {
                      setSubtypes(prev => [...prev, newSubtype]);
                      handleSubtypeChange(newSubtype.id);
                    }}
                  />

                  {selectedSubtypeData && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-muted-foreground">
                        Classified as{' '}
                        <span className="font-medium text-foreground">
                          {selectedSubtypeData.name}
                        </span>
                        {' '}({selectedSubtypeData.season})
                      </span>
                      {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Palette Effect */}
            {painting.palette_effect && !selectedSubtypeData && (
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
                      {colors.dominant.map((color: string) => (
                        <span key={color} className="px-3 py-1 rounded-full bg-primary/10 text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  )}
                  {colors.accent && (
                    <div className="flex flex-wrap gap-2">
                      {colors.accent.map((color: string) => (
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

            {/* Editable Description Section */}
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Edit Details
              </h4>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-title" className="text-sm text-muted-foreground">Title</Label>
                  <Input
                    id="edit-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Enter painting title..."
                    className="mt-1 bg-background border-muted-foreground/30"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-notes" className="text-sm text-muted-foreground">Notes / Description</Label>
                  <Textarea
                    id="edit-notes"
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add notes, observations, or description..."
                    rows={3}
                    className="mt-1 bg-background border-muted-foreground/30 resize-none"
                  />
                </div>

                {/* Palette Painting Indicator */}
                {isPalettePainting && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Star className="w-4 h-4 fill-primary" />
                    <span className="font-medium">This is a Palette Painting</span>
                  </div>
                )}
              </div>

              {/* Save Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {hasEdits && (
                  <Button
                    onClick={saveEdits}
                    disabled={savingEdits}
                    variant="outline"
                    className="flex-1"
                  >
                    {savingEdits ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                    )}
                  </Button>
                )}
                
                {!isPalettePainting && (
                  <Button
                    onClick={saveToPalette}
                    disabled={savingEdits}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {savingEdits ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      <><Star className="w-4 h-4 mr-2" /> 🎨 Save to Palette Paintings</>
                    )}
                  </Button>
                )}
              </div>
            </div>

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
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </ScrollArea>
      </motion.div>

      {/* Analysis Options Dialog */}
      <AnalysisOptionsDialog
        open={showAnalysisOptions}
        onClose={() => setShowAnalysisOptions(false)}
        onAnalyze={runAnalysis}
        isAnalyzing={analyzing}
        paintingPreview={painting.image_url}
      />
    </motion.div>
  );
}
