import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Palette, Shirt, Sparkles, Crown, Gem, Trash2, Loader2, Check, Tag, Wand2, Settings2, Save, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import type { Json } from '@/integrations/supabase/types';
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
  /** If true, requires confirmation before delete (two-step). If false, deletes immediately. */
  isPaletteContext?: boolean;
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

export function PaintingDetailModal({ painting: initialPainting, onClose, onDelete, onUpdate, isPaletteContext = false }: PaintingDetailModalProps) {
  // Keyboard shortcut: Escape to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  const { toast } = useToast();
  const [painting, setPainting] = useState(initialPainting);
  const [deleting, setDeleting] = useState(false);
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [selectedSubtype, setSelectedSubtype] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSubtypes, setLoadingSubtypes] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  
  // Editable fields - basic
  const [editedTitle, setEditedTitle] = useState(initialPainting.title || '');
  const [editedNotes, setEditedNotes] = useState(initialPainting.notes || '');
  const [hasEdits, setHasEdits] = useState(false);
  const [savingEdits, setSavingEdits] = useState(false);
  const [isPalettePainting, setIsPalettePainting] = useState(
    initialPainting.status === 'palette' || initialPainting.tags?.includes('Palette Painting')
  );
  
  // Editable analysis fields - for Nechama's insights
  const [editedMoodPrimary, setEditedMoodPrimary] = useState(initialPainting.mood_primary || '');
  const [editedMoodSecondary, setEditedMoodSecondary] = useState(initialPainting.mood_secondary?.join(', ') || '');
  const [editedFabrics, setEditedFabrics] = useState(initialPainting.fabrics?.join(', ') || '');
  const [editedSilhouette, setEditedSilhouette] = useState(initialPainting.silhouette || '');
  const [editedNeckline, setEditedNeckline] = useState(initialPainting.neckline || '');
  const [editedSleeves, setEditedSleeves] = useState(initialPainting.sleeves || '');
  const [editedJewelry, setEditedJewelry] = useState(initialPainting.jewelry_types?.join(', ') || '');
  const [editedColorMood, setEditedColorMood] = useState(initialPainting.color_mood || '');
  const [editedBestFor, setEditedBestFor] = useState(initialPainting.best_for?.join(', ') || '');
  const [editedTalkingPoints, setEditedTalkingPoints] = useState(initialPainting.client_talking_points?.join('\n') || '');
  const [editedArtist, setEditedArtist] = useState(initialPainting.artist || '');
  const [editedEra, setEditedEra] = useState(initialPainting.era || '');
  const [editedSeasonReasoning, setEditedSeasonReasoning] = useState(
    (initialPainting.ai_analysis as PaintingAnalysis)?.suggested_seasons?.reasoning || ''
  );
  
  const analysis = painting.ai_analysis || {};
  const colors = analysis.colors || {};
  const mood = analysis.mood || {};
  const jewelry = analysis.jewelry_accessories || {};
  const seasons = analysis.suggested_seasons || {};

  const isNotAnalyzed = painting.status === 'pending' || !painting.ai_analysis || Object.keys(painting.ai_analysis).length === 0;

  // Track edits - check all editable fields
  useEffect(() => {
    const titleChanged = editedTitle !== (painting.title || '');
    const notesChanged = editedNotes !== (painting.notes || '');
    const artistChanged = editedArtist !== (painting.artist || '');
    const eraChanged = editedEra !== (painting.era || '');
    const moodPrimaryChanged = editedMoodPrimary !== (painting.mood_primary || '');
    const moodSecondaryChanged = editedMoodSecondary !== (painting.mood_secondary?.join(', ') || '');
    const fabricsChanged = editedFabrics !== (painting.fabrics?.join(', ') || '');
    const silhouetteChanged = editedSilhouette !== (painting.silhouette || '');
    const necklineChanged = editedNeckline !== (painting.neckline || '');
    const sleevesChanged = editedSleeves !== (painting.sleeves || '');
    const jewelryChanged = editedJewelry !== (painting.jewelry_types?.join(', ') || '');
    const colorMoodChanged = editedColorMood !== (painting.color_mood || '');
    const bestForChanged = editedBestFor !== (painting.best_for?.join(', ') || '');
    const talkingPointsChanged = editedTalkingPoints !== (painting.client_talking_points?.join('\n') || '');
    const seasonReasoningChanged = editedSeasonReasoning !== ((painting.ai_analysis as PaintingAnalysis)?.suggested_seasons?.reasoning || '');
    
    setHasEdits(
      titleChanged || notesChanged || artistChanged || eraChanged || 
      moodPrimaryChanged || moodSecondaryChanged || fabricsChanged || 
      silhouetteChanged || necklineChanged || sleevesChanged || 
      jewelryChanged || colorMoodChanged || bestForChanged || talkingPointsChanged ||
      seasonReasoningChanged
    );
  }, [
    editedTitle, editedNotes, editedArtist, editedEra, editedMoodPrimary, 
    editedMoodSecondary, editedFabrics, editedSilhouette, editedNeckline, 
    editedSleeves, editedJewelry, editedColorMood, editedBestFor, editedTalkingPoints,
    editedSeasonReasoning, painting
  ]);

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

      // Update database with analysis results - preserve existing title/artist if already set
      const updateData = {
        ai_analysis: analysisResult,
        title: painting.title || analysisResult.title_suggestion,
        artist: painting.artist || analysisResult.artist_detected,
        era: painting.era || analysisResult.era_detected,
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
      // Parse comma-separated fields back to arrays
      const parseFabrics = editedFabrics.trim() ? editedFabrics.split(',').map(s => s.trim()).filter(Boolean) : null;
      const parseMoodSecondary = editedMoodSecondary.trim() ? editedMoodSecondary.split(',').map(s => s.trim()).filter(Boolean) : null;
      const parseJewelry = editedJewelry.trim() ? editedJewelry.split(',').map(s => s.trim()).filter(Boolean) : null;
      const parseBestFor = editedBestFor.trim() ? editedBestFor.split(',').map(s => s.trim()).filter(Boolean) : null;
      const parseTalkingPoints = editedTalkingPoints.trim() ? editedTalkingPoints.split('\n').map(s => s.trim()).filter(Boolean) : null;

      // Update ai_analysis with new season reasoning if edited
      const currentAnalysis = (painting.ai_analysis || {}) as Record<string, unknown>;
      const updatedAiAnalysis = editedSeasonReasoning.trim() 
        ? {
            ...currentAnalysis,
            suggested_seasons: {
              ...((currentAnalysis.suggested_seasons as Record<string, unknown>) || {}),
              reasoning: editedSeasonReasoning.trim(),
            }
          }
        : currentAnalysis;

      const { error } = await supabase
        .from('paintings')
        .update({
          title: editedTitle.trim() || null,
          notes: editedNotes.trim() || null,
          artist: editedArtist.trim() || null,
          era: editedEra.trim() || null,
          mood_primary: editedMoodPrimary.trim() || null,
          mood_secondary: parseMoodSecondary,
          fabrics: parseFabrics,
          silhouette: editedSilhouette.trim() || null,
          neckline: editedNeckline.trim() || null,
          sleeves: editedSleeves.trim() || null,
          jewelry_types: parseJewelry,
          color_mood: editedColorMood.trim() || null,
          best_for: parseBestFor,
          client_talking_points: parseTalkingPoints,
          ai_analysis: updatedAiAnalysis as Json,
          status: isPalettePainting ? 'palette' : painting.status,
        })
        .eq('id', painting.id);

      if (error) throw error;

      setPainting(prev => ({
        ...prev,
        title: editedTitle.trim() || null,
        notes: editedNotes.trim() || null,
        artist: editedArtist.trim() || null,
        era: editedEra.trim() || null,
        mood_primary: editedMoodPrimary.trim() || null,
        mood_secondary: parseMoodSecondary,
        fabrics: parseFabrics,
        silhouette: editedSilhouette.trim() || null,
        neckline: editedNeckline.trim() || null,
        sleeves: editedSleeves.trim() || null,
        jewelry_types: parseJewelry,
        color_mood: editedColorMood.trim() || null,
        best_for: parseBestFor,
        client_talking_points: parseTalkingPoints,
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
      // Only update title, notes, and status - don't touch tags (let trigger regenerate)
      const { error } = await supabase
        .from('paintings')
        .update({
          title: editedTitle.trim() || painting.title,
          notes: editedNotes.trim() || painting.notes,
          status: 'palette',
        })
        .eq('id', painting.id);

      if (error) throw error;

      setPainting(prev => ({
        ...prev,
        title: editedTitle.trim() || prev.title,
        notes: editedNotes.trim() || prev.notes,
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
        {/* Native scrolling - much faster than ScrollArea */}
        <div className="md:w-1/2 max-h-[60vh] md:max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6 pb-24">
            {/* Header with Editable Title */}
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4 space-y-2">
                {(painting.suggested_season || selectedSubtypeData) && (
                  <Badge className={SEASON_COLORS[selectedSubtypeData?.season || painting.suggested_season || ''] || 'bg-muted'}>
                    {SEASON_EMOJIS[selectedSubtypeData?.season || painting.suggested_season || ''] || ''} {selectedSubtypeData?.season || painting.suggested_season}
                  </Badge>
                )}
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter painting title..."
                  className="font-serif text-2xl font-bold border-transparent hover:border-border focus:border-primary bg-transparent h-auto p-0"
                />
                <Input
                  value={editedArtist}
                  onChange={(e) => setEditedArtist(e.target.value)}
                  placeholder="Artist name..."
                  className="text-muted-foreground border-transparent hover:border-border focus:border-primary bg-transparent h-auto p-0"
                />
                <Input
                  value={editedEra}
                  onChange={(e) => setEditedEra(e.target.value)}
                  placeholder="Era / Period..."
                  className="text-sm text-muted-foreground border-transparent hover:border-border focus:border-primary bg-transparent h-auto p-0"
                />
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Notes - Always Editable */}
            <div>
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add notes, observations, or description..."
                rows={2}
                className="bg-muted/30 border-transparent hover:border-border focus:border-primary resize-none"
              />
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
                    <SelectContent className="bg-popover border border-border shadow-lg z-[200] max-h-80">
                      {['spring', 'summer', 'autumn', 'winter'].map(season => (
                        subtypesBySeason[season]?.length > 0 && (
                          <SelectGroup key={season}>
                            <SelectLabel className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold py-2 px-3 bg-muted/50">
                              {SEASON_EMOJIS[season]} {season.charAt(0).toUpperCase() + season.slice(1)} ({subtypesBySeason[season].length})
                            </SelectLabel>
                            {subtypesBySeason[season].map(subtype => (
                              <SelectItem 
                                key={subtype.id} 
                                value={subtype.id}
                                className="pl-6"
                              >
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

            {/* Mood - Editable */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Mood & Color
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Primary Mood</label>
                  <Input
                    value={editedMoodPrimary}
                    onChange={(e) => setEditedMoodPrimary(e.target.value)}
                    placeholder="e.g., Romantic, Regal, Serene"
                    className="bg-muted/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Secondary Moods (comma-separated)</label>
                  <Input
                    value={editedMoodSecondary}
                    onChange={(e) => setEditedMoodSecondary(e.target.value)}
                    placeholder="e.g., Elegant, Dreamy, Opulent"
                    className="bg-muted/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Color Mood</label>
                <Input
                  value={editedColorMood}
                  onChange={(e) => setEditedColorMood(e.target.value)}
                  placeholder="e.g., Rich/Warm, Cool/Muted, Bright/Vibrant"
                  className="bg-muted/30"
                />
              </div>
              {mood.feeling && (
                <p className="text-sm text-muted-foreground italic">AI insight: "{mood.feeling}"</p>
              )}
            </div>

            {/* Colors - Read Only (from AI) */}
            {(colors.dominant?.length || colors.accent?.length) && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Detected Colors
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

            {/* Fabrics - Editable */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-primary" />
                Fabrics
              </h4>
              <Input
                value={editedFabrics}
                onChange={(e) => setEditedFabrics(e.target.value)}
                placeholder="e.g., Silk, Velvet, Chiffon, Brocade (comma-separated)"
                className="bg-muted/30"
              />
            </div>

            {/* Style Details - Editable */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                Style Details
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Silhouette</label>
                  <Input
                    value={editedSilhouette}
                    onChange={(e) => setEditedSilhouette(e.target.value)}
                    placeholder="e.g., A-Line, Column"
                    className="bg-muted/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Neckline</label>
                  <Input
                    value={editedNeckline}
                    onChange={(e) => setEditedNeckline(e.target.value)}
                    placeholder="e.g., Portrait, Boat"
                    className="bg-muted/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sleeves</label>
                  <Input
                    value={editedSleeves}
                    onChange={(e) => setEditedSleeves(e.target.value)}
                    placeholder="e.g., Bishop, Cap"
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </div>

            {/* Jewelry - Editable */}
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Gem className="w-4 h-4 text-primary" />
                Jewelry
              </h4>
              <Input
                value={editedJewelry}
                onChange={(e) => setEditedJewelry(e.target.value)}
                placeholder="e.g., Pearl Necklace, Gold Earrings, Brooch (comma-separated)"
                className="bg-muted/30"
              />
              {jewelry.metals && (
                <p className="text-xs text-muted-foreground mt-1">
                  AI detected metals: {jewelry.metals.join(', ')}
                </p>
              )}
            </div>

            {/* Best For - Editable */}
            <div>
              <h4 className="font-medium mb-2">Best For</h4>
              <Input
                value={editedBestFor}
                onChange={(e) => setEditedBestFor(e.target.value)}
                placeholder="e.g., Soft glam looks, Romantic events (comma-separated)"
                className="bg-muted/30"
              />
            </div>

            {/* Client Talking Points - Editable */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-medium mb-2">💬 Client Talking Points</h4>
              <Textarea
                value={editedTalkingPoints}
                onChange={(e) => setEditedTalkingPoints(e.target.value)}
                placeholder="Add talking points for client consultations (one per line)..."
                rows={4}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">One point per line</p>
            </div>

            {/* Season Reasoning - Editable for AI Training */}
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                🎓 Why {painting.suggested_season || 'this Season'}?
                <span className="text-xs text-muted-foreground font-normal">(for AI training)</span>
              </h4>
              <Textarea
                value={editedSeasonReasoning}
                onChange={(e) => setEditedSeasonReasoning(e.target.value)}
                placeholder="Explain why this painting belongs to this season. Your insights will help train the AI to make better predictions..."
                rows={3}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Your expert reasoning helps improve AI season predictions for future paintings.
              </p>
            </div>

            {/* Save Actions */}
            <div className="border-t pt-4 space-y-3">
              {/* Palette Painting Indicator */}
              {isPalettePainting && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Star className="w-4 h-4 fill-primary" />
                  <span className="font-medium">This is a Palette Painting</span>
                </div>
              )}

              {/* Save Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={saveEdits}
                  disabled={savingEdits || !hasEdits}
                  variant={hasEdits ? "default" : "outline"}
                  className="flex-1"
                >
                  {savingEdits ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> {hasEdits ? 'Save Changes' : 'No Changes'}</>
                  )}
                </Button>
                
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

            {/* Delete Button - Two-step for palette, one-click for gallery */}
            <div className="pt-4 border-t">
              {isPaletteContext ? (
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
                      Delete from Palette
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this painting?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove "{painting.title || 'this painting'}" from your curated palette collection. This action cannot be undone.
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
              ) : (
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Painting
                </Button>
              )}
            </div>
          </div>
        </div>
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
