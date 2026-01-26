import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BulkPhoto, BulkTrainingStats, FilterType, SortType } from '@/types/training';
import { Subtype, SAMPLE_SUBTYPES } from '@/data/subtypes';
import { BulkPhotoRow } from './BulkPhotoRow';
import { ImportExportPanel } from './ImportExportPanel';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  Play, 
  CheckCircle2, 
  Loader2, 
  Download, 
  Upload as UploadIcon,
  ImageIcon,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportResult } from '@/lib/csv-utils';

export function BulkTrainingTab() {
  const [photos, setPhotos] = useState<BulkPhoto[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('confidence');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);
  const [allSubtypes, setAllSubtypes] = useState<Subtype[]>(SAMPLE_SUBTYPES);

  // Fetch active subtypes from database
  useEffect(() => {
    async function loadSubtypes() {
      const { data, error } = await supabase
        .from('subtypes')
        .select('id, name, season, slug')
        .eq('is_active', true)
        .order('season', { ascending: true });
      
      if (!error && data) {
        // Map to Subtype with required fields populated with defaults
        const mapped: Subtype[] = data.map(s => ({
          id: s.id,
          name: s.name,
          season: s.season as 'spring' | 'summer' | 'autumn' | 'winter',
          palette: {},
          colorCombinations: [],
          paletteEffects: [],
          fabrics: [],
          prints: [],
          jewelry: {},
        }));
        setAllSubtypes(mapped);
      }
    }
    loadSubtypes();
  }, []);

  // Handle bulk file upload
  const handleBulkUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newPhotos: BulkPhoto[] = files.map((file, index) => ({
      id: `photo-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending',
      aiPrediction: null,
      aiConfidence: null,
      aiAlternatives: [],
      extractedFeatures: null,
      confirmedSubtype: null,
      notes: '',
      isNewSubtype: false,
      uploadedAt: new Date().toISOString()
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  }, []);

  // Analyze all pending photos using real AI
  const analyzeAll = async () => {
    setAnalyzing(true);
    
    const pendingPhotos = photos.filter(p => p.status === 'pending');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < pendingPhotos.length; i++) {
      const photo = pendingPhotos[i];
      
      setPhotos(prev => prev.map(p => 
        p.id === photo.id ? { ...p, status: 'analyzing' } : p
      ));

      try {
        // Upload to storage first
        const filename = `training/${Date.now()}_${photo.filename}`;
        const { error: uploadError } = await supabase.storage
          .from('face-images')
          .upload(filename, photo.file);

        if (uploadError) throw uploadError;

        // Create face_images record
        const { data: imageRecord, error: dbError } = await supabase
          .from('face_images')
          .insert({
            storage_path: filename,
            original_filename: photo.filename,
            source: 'training_upload',
            file_size_bytes: photo.file.size,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Get public URL for analysis
        const { data: publicUrl } = supabase.storage
          .from('face-images')
          .getPublicUrl(filename);

        // Call the real AI analysis edge function
        const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-face', {
          body: { 
            faceImageId: imageRecord.id,
            imageUrl: publicUrl.publicUrl,
          },
        });

        if (analyzeError) throw analyzeError;

        const analysis = analysisResult?.analysis;
        
        // Map AI result to subtype
        const predictedSubtype = allSubtypes.find(s => 
          s.name.toLowerCase().includes(analysis?.predicted_subtype?.toLowerCase() || '') ||
          analysis?.predicted_subtype?.toLowerCase().includes(s.name.toLowerCase())
        ) || (analysis?.predicted_subtype ? {
          id: `ai-${Date.now()}`,
          name: analysis.predicted_subtype,
          season: (analysis.predicted_season || 'autumn') as 'spring' | 'summer' | 'autumn' | 'winter',
          palette: {},
          colorCombinations: [],
          paletteEffects: [],
          fabrics: [],
          prints: [],
          jewelry: {},
        } : null);

        // Map alternatives
        const alternativeSubtypes: Subtype[] = (analysis?.alternatives || []).map((alt: any) => {
          const found = allSubtypes.find(s => 
            s.name.toLowerCase().includes(alt.subtype?.toLowerCase() || '')
          );
          return found || { 
            id: `alt-${Date.now()}`, 
            name: alt.subtype, 
            season: 'autumn' as const,
            palette: {},
            colorCombinations: [],
            paletteEffects: [],
            fabrics: [],
            prints: [],
            jewelry: {},
          };
        });

        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? {
            ...p,
            status: 'analyzed',
            aiPrediction: predictedSubtype,
            aiConfidence: analysis?.confidence || 0,
            aiAlternatives: alternativeSubtypes,
            extractedFeatures: {
              undertone: analysis?.skin?.undertone || 'neutral',
              depth: analysis?.depth?.level?.replace('-', '') as any || 'medium',
              contrast: analysis?.contrast?.level?.replace('-', '') as any || 'medium',
              eyeColor: analysis?.eyes?.color_name,
              hairColor: analysis?.hair?.color_name
            },
            isNewSubtype: (analysis?.confidence || 0) < 50
          } : p
        ));
        
        successCount++;
      } catch (error) {
        console.error('Analysis failed:', error);
        errorCount++;
        setPhotos(prev => prev.map(p => 
          p.id === photo.id ? { ...p, status: 'error' } : p
        ));
      }
    }

    setAnalyzing(false);
    
    if (successCount > 0) {
      toast.success(`Analyzed ${successCount} photo${successCount !== 1 ? 's' : ''}`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} photo${errorCount !== 1 ? 's' : ''} failed to analyze`);
    }
  };

  const confirmCorrect = (photoId: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? {
        ...p,
        status: 'confirmed',
        confirmedSubtype: p.aiPrediction
      } : p
    ));
  };

  const changeSubtype = (photoId: string, subtypeId: string) => {
    const subtype = allSubtypes.find(s => s.id === subtypeId);
    if (!subtype) return;
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? {
        ...p,
        status: 'confirmed',
        confirmedSubtype: subtype
      } : p
    ));
  };

  const updateNotes = (photoId: string, notes: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, notes } : p
    ));
  };

  // Delete a photo from the list
  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    toast.success('Photo removed');
  };

  // Re-analyze a single photo
  const reanalyzePhoto = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    setPhotos(prev => prev.map(p => 
      p.id === photoId ? { ...p, status: 'analyzing' } : p
    ));

    try {
      // Upload to storage first
      const filename = `training/${Date.now()}_${photo.filename}`;
      const { error: uploadError } = await supabase.storage
        .from('face-images')
        .upload(filename, photo.file);

      if (uploadError) throw uploadError;

      // Create face_images record
      const { data: imageRecord, error: dbError } = await supabase
        .from('face_images')
        .insert({
          storage_path: filename,
          original_filename: photo.filename,
          source: 'training_upload',
          file_size_bytes: photo.file.size,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Get public URL for analysis
      const { data: publicUrl } = supabase.storage
        .from('face-images')
        .getPublicUrl(filename);

      // Call the real AI analysis edge function
      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-face', {
        body: { 
          faceImageId: imageRecord.id,
          imageUrl: publicUrl.publicUrl,
        },
      });

      if (analyzeError) throw analyzeError;

      const analysis = analysisResult?.analysis;
      
      // Map AI result to subtype
      const predictedSubtype = allSubtypes.find(s => 
        s.name.toLowerCase().includes(analysis?.predicted_subtype?.toLowerCase() || '') ||
        analysis?.predicted_subtype?.toLowerCase().includes(s.name.toLowerCase())
      ) || (analysis?.predicted_subtype ? {
        id: `ai-${Date.now()}`,
        name: analysis.predicted_subtype,
        season: (analysis.predicted_season || 'autumn') as 'spring' | 'summer' | 'autumn' | 'winter',
        palette: {},
        colorCombinations: [],
        paletteEffects: [],
        fabrics: [],
        prints: [],
        jewelry: {},
      } : null);

      // Map alternatives
      const alternativeSubtypes: Subtype[] = (analysis?.alternatives || []).map((alt: any) => {
        const found = allSubtypes.find(s => 
          s.name.toLowerCase().includes(alt.subtype?.toLowerCase() || '')
        );
        return found || { 
          id: `alt-${Date.now()}`, 
          name: alt.subtype, 
          season: 'autumn' as const,
          palette: {},
          colorCombinations: [],
          paletteEffects: [],
          fabrics: [],
          prints: [],
          jewelry: {},
        };
      });

      setPhotos(prev => prev.map(p => 
        p.id === photoId ? {
          ...p,
          status: 'analyzed',
          aiPrediction: predictedSubtype,
          aiConfidence: analysis?.confidence || 0,
          aiAlternatives: alternativeSubtypes,
          extractedFeatures: {
            undertone: analysis?.skin?.undertone || 'neutral',
            depth: analysis?.depth?.level?.replace('-', '') as any || 'medium',
            contrast: analysis?.contrast?.level?.replace('-', '') as any || 'medium',
            eyeColor: analysis?.eyes?.color_name,
            hairColor: analysis?.hair?.color_name
          },
          confirmedSubtype: null, // Reset confirmed subtype
          isNewSubtype: (analysis?.confidence || 0) < 50
        } : p
      ));
      
      toast.success('Photo re-analyzed');
    } catch (error) {
      console.error('Re-analysis failed:', error);
      setPhotos(prev => prev.map(p => 
        p.id === photoId ? { ...p, status: 'error' } : p
      ));
      toast.error('Re-analysis failed');
    }
  };

  const batchConfirmHighConfidence = () => {
    setPhotos(prev => prev.map(p => 
      p.status === 'analyzed' && (p.aiConfidence || 0) >= 80
        ? { ...p, status: 'confirmed', confirmedSubtype: p.aiPrediction }
        : p
    ));
  };

  // Filter photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];
    
    switch (filter) {
      case 'pending':
        result = result.filter(p => p.status === 'pending' || p.status === 'analyzed');
        break;
      case 'correct':
        result = result.filter(p => 
          p.status === 'confirmed' && 
          p.confirmedSubtype?.id === p.aiPrediction?.id
        );
        break;
      case 'wrong':
        result = result.filter(p => 
          p.status === 'confirmed' && 
          p.confirmedSubtype?.id !== p.aiPrediction?.id
        );
        break;
      case 'new-subtype':
        result = result.filter(p => p.isNewSubtype);
        break;
    }

    switch (sortBy) {
      case 'confidence':
        result.sort((a, b) => (a.aiConfidence || 0) - (b.aiConfidence || 0));
        break;
      case 'date':
        result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case 'season':
        result.sort((a, b) => (a.aiPrediction?.season || '').localeCompare(b.aiPrediction?.season || ''));
        break;
    }

    return result;
  }, [photos, filter, sortBy]);

  // Stats
  const stats: BulkTrainingStats = useMemo(() => ({
    total: photos.length,
    pending: photos.filter(p => p.status === 'pending').length,
    analyzed: photos.filter(p => p.status === 'analyzed').length,
    confirmed: photos.filter(p => p.status === 'confirmed').length,
    correct: photos.filter(p => p.status === 'confirmed' && p.confirmedSubtype?.id === p.aiPrediction?.id).length,
    wrong: photos.filter(p => p.status === 'confirmed' && p.confirmedSubtype?.id !== p.aiPrediction?.id).length,
    newSubtype: photos.filter(p => p.isNewSubtype).length,
  }), [photos]);

  const handleImportCorrections = (result: ImportResult) => {
    // Trigger re-render with updated photos
    setPhotos([...photos]);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkUpload}
              className="hidden"
            />
            <Button asChild variant="default" className="cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photos
              </span>
            </Button>
          </label>
          
          {stats.pending > 0 && (
            <Button onClick={analyzeAll} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Analyze {stats.pending} Photos
                </>
              )}
            </Button>
          )}
          
          {stats.analyzed > 0 && (
            <Button onClick={batchConfirmHighConfidence} variant="outline" className="border-success/50 text-success hover:bg-success/10">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Auto-Confirm High Confidence
            </Button>
          )}
        </div>

        <Button 
          variant="outline" 
          onClick={() => setShowImportExport(!showImportExport)}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Import / Export
        </Button>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <ImportExportPanel 
            photos={photos} 
            subtypes={allSubtypes} 
            onImportCorrections={handleImportCorrections}
          />
        </motion.div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} variant="warning" />
        <StatCard label="Analyzed" value={stats.analyzed} variant="primary" />
        <StatCard label="Confirmed" value={stats.confirmed} variant="success" />
        <StatCard 
          label="Accuracy" 
          value={stats.confirmed > 0 ? `${Math.round(stats.correct / stats.confirmed * 100)}%` : '—'} 
          variant="accent" 
        />
        <StatCard label="New Types" value={stats.newSubtype} variant="warning" icon={<Sparkles className="w-4 h-4" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({stats.total})
          </FilterButton>
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
            Needs Review ({stats.pending + stats.analyzed})
          </FilterButton>
          <FilterButton active={filter === 'wrong'} onClick={() => setFilter('wrong')}>
            Corrections ({stats.wrong})
          </FilterButton>
          <FilterButton active={filter === 'new-subtype'} onClick={() => setFilter('new-subtype')}>
            <Sparkles className="w-3 h-3 mr-1" />
            New Subtypes ({stats.newSubtype})
          </FilterButton>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="confidence">Confidence (Low First)</SelectItem>
              <SelectItem value="date">Date (Newest)</SelectItem>
              <SelectItem value="season">Season</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      {filteredPhotos.length === 0 ? (
        <EmptyState onUpload={handleBulkUpload} hasPhotos={photos.length > 0} />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-24">Photo</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>AI Prediction</TableHead>
                <TableHead className="w-48">Confirmed Type</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPhotos.map(photo => (
                <BulkPhotoRow
                  key={photo.id}
                  photo={photo}
                  allSubtypes={allSubtypes}
                  onConfirmCorrect={() => confirmCorrect(photo.id)}
                  onChangeSubtype={(subtypeId) => changeSubtype(photo.id, subtypeId)}
                  onUpdateNotes={(notes) => updateNotes(photo.id, notes)}
                  onDelete={() => deletePhoto(photo.id)}
                  onReanalyze={() => reanalyzePhoto(photo.id)}
                  isEditing={editingId === photo.id}
                  onStartEdit={() => setEditingId(photo.id)}
                  onEndEdit={() => setEditingId(null)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  variant = 'default',
  icon
}: { 
  label: string; 
  value: string | number; 
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  icon?: React.ReactNode;
}) {
  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    accent: 'text-accent',
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border text-center">
      <div className={cn('text-2xl font-bold flex items-center justify-center gap-2', variantClasses[variant])}>
        {icon}
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function FilterButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center',
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80'
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ 
  onUpload, 
  hasPhotos 
}: { 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasPhotos: boolean;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <ImageIcon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-serif text-xl font-semibold mb-2">
        {hasPhotos ? 'No photos match this filter' : 'No photos yet'}
      </h3>
      <p className="text-muted-foreground mb-4">
        {hasPhotos 
          ? 'Try changing your filter to see more photos'
          : 'Upload photos to start training the AI'
        }
      </p>
      {!hasPhotos && (
        <label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onUpload}
            className="hidden"
          />
          <Button asChild className="cursor-pointer">
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photos
            </span>
          </Button>
        </label>
      )}
    </div>
  );
}
