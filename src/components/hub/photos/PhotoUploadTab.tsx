import { useState, useCallback, useEffect } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusDot } from '../StatusDot';
import { 
  Upload, 
  Loader2, 
  Download, 
  Database,
  FolderUp,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Dataset {
  key: string;
  id: string;
  name: string;
  description: string;
}

interface HFImage {
  id: string;
  sourceId: string;
  url: string;
  width?: number;
  height?: number;
  dataset: string;
  datasetName: string;
}

export function PhotoUploadTab() {
  const { photos, addPhotos, analyzePhotos, photoAnalyzing, photoStats, confirmPhotoCorrect, settings } = useHub();
  const [dragOver, setDragOver] = useState(false);
  const [activeSource, setActiveSource] = useState<'local' | 'dataset'>('local');

  // Dataset import states
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [datasetImages, setDatasetImages] = useState<HFImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [browsing, setBrowsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Load available datasets
  useEffect(() => {
    async function loadDatasets() {
      try {
        const { data, error } = await supabase.functions.invoke('import-huggingface', {
          body: { action: 'list-datasets' },
        });

        if (error) throw error;
        if (data.success) {
          setDatasets(data.datasets);
          if (data.datasets.length > 0) {
            setSelectedDataset(data.datasets[0].key);
          }
        }
      } catch (err) {
        console.error('Failed to load datasets:', err);
      }
    }
    loadDatasets();
  }, []);

  // Browse images when dataset or page changes
  useEffect(() => {
    if (!selectedDataset || activeSource !== 'dataset') return;

    async function browseImages() {
      setBrowsing(true);
      setSelectedImageIds(new Set());

      try {
        const { data, error } = await supabase.functions.invoke('import-huggingface', {
          body: { 
            action: 'browse', 
            dataset: selectedDataset,
            offset,
            limit,
          },
        });

        if (error) throw error;
        if (data.success) {
          setDatasetImages(data.images);
          setTotal(data.total);
        } else {
          const msg = data?.hint ? `${data.error}. ${data.hint}` : data.error;
          throw new Error(msg || 'Failed to load images');
        }
      } catch (err) {
        console.error('Failed to browse images:', err);
        toast.error(err instanceof Error ? err.message : 'Failed to load images from dataset');
        setDatasetImages([]);
      } finally {
        setBrowsing(false);
      }
    }

    browseImages();
  }, [selectedDataset, offset, activeSource]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) addPhotos(files);
  }, [addPhotos]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) addPhotos(files);
  }, [addPhotos]);

  const toggleImageSelect = (id: string) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllImages = () => {
    if (selectedImageIds.size === datasetImages.length) {
      setSelectedImageIds(new Set());
    } else {
      setSelectedImageIds(new Set(datasetImages.map(img => img.id)));
    }
  };

  const handleImport = async () => {
    if (selectedImageIds.size === 0) return;

    setImporting(true);
    try {
      const imagesToImport = datasetImages.filter(img => selectedImageIds.has(img.id));
      
      const { data, error } = await supabase.functions.invoke('import-huggingface', {
        body: { 
          action: 'import', 
          images: imagesToImport,
        },
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(`Imported ${data.imported} images`);
        setSelectedImageIds(new Set());
      } else {
        const msg = data?.hint ? `${data.error}. ${data.hint}` : data.error;
        throw new Error(msg || 'Import failed');
      }
    } catch (err) {
      console.error('Import failed:', err);
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const highConfCount = photos.filter(p => p.status === 'analyzed' && (p.aiConfidence ?? 0) >= settings.autoConfidenceThreshold).length;
  const currentDataset = datasets.find(d => d.key === selectedDataset);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Source Toggle */}
      <Tabs value={activeSource} onValueChange={(v) => setActiveSource(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="local" className="gap-2">
            <FolderUp className="w-4 h-4" />
            Local Files
          </TabsTrigger>
          <TabsTrigger value="dataset" className="gap-2">
            <Database className="w-4 h-4" />
            Face Datasets
          </TabsTrigger>
        </TabsList>

        {/* Local Upload Content */}
        <TabsContent value="local" className="mt-6">
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-12 text-center transition-colors bg-card',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-medium mb-2">Upload Client Photos</h3>
            <p className="text-muted-foreground mb-4">Drop photos here for color analysis</p>
            <label className="inline-block">
              <Button className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        </TabsContent>

        {/* Dataset Import Content */}
        <TabsContent value="dataset" className="mt-6 space-y-4">
          {/* Dataset Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={selectedDataset} onValueChange={(v) => {
                setSelectedDataset(v);
                setOffset(0);
              }}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map(ds => (
                    <SelectItem key={ds.key} value={ds.key}>
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        {ds.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentDataset && (
                <span className="text-sm text-muted-foreground">
                  {currentDataset.description}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={selectAllImages}
                disabled={browsing || datasetImages.length === 0}
              >
                {selectedImageIds.size === datasetImages.length && datasetImages.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>

              <Button 
                onClick={handleImport}
                disabled={importing || selectedImageIds.size === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import {selectedImageIds.size > 0 ? `(${selectedImageIds.size})` : ''}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats */}
          {total > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {offset + 1}-{Math.min(offset + limit, total)} of {total.toLocaleString()} images
              </span>
              <Badge variant="secondary">
                {selectedImageIds.size} selected
              </Badge>
            </div>
          )}

          {/* Image Grid */}
          {browsing ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {Array.from({ length: limit }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : datasetImages.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
              <Database className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Select a dataset to browse face images</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {datasetImages.map((image) => {
                const isSelected = selectedImageIds.has(image.id);
                return (
                  <div
                    key={image.id}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-transparent hover:border-border'
                    )}
                    onClick={() => toggleImageSelect(image.id)}
                  >
                    <img
                      src={image.url}
                      alt={`Face ${image.sourceId}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    <div className={cn(
                      'absolute inset-0 transition-colors',
                      isSelected ? 'bg-primary/20' : 'bg-transparent hover:bg-black/10'
                    )} />

                    <div className="absolute top-1 left-1">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/80'
                      )}>
                        {isSelected ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <Badge variant="secondary" className="absolute bottom-1 right-1 text-[9px] bg-background/80 px-1">
                      #{image.sourceId}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0 || browsing}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total || browsing}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      {(photoStats.pending > 0 || photoStats.analyzed > 0) && (
        <div className="mt-6 flex items-center justify-between bg-card rounded-lg shadow-elegant p-4">
          <div className="flex items-center gap-4 text-sm">
            {photoStats.pending > 0 && (
              <span><strong className="text-primary">{photoStats.pending}</strong> pending</span>
            )}
            {photoStats.analyzed > 0 && (
              <span><strong className="text-success">{photoStats.analyzed}</strong> ready for review</span>
            )}
          </div>
          <div className="flex gap-2">
            {photoStats.pending > 0 && (
              <Button onClick={() => analyzePhotos()} disabled={photoAnalyzing}>
                {photoAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>🔍 Analyze {photoStats.pending} Photos</>
                )}
              </Button>
            )}
            {highConfCount > 0 && (
              <Button 
                variant="secondary"
                onClick={() => {
                  photos.filter(p => p.status === 'analyzed' && (p.aiConfidence ?? 0) >= settings.autoConfidenceThreshold)
                    .forEach(p => confirmPhotoCorrect(p.id));
                }}
              >
                ✓ Auto-Confirm {highConfCount} High Confidence
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Recent Preview */}
      {photos.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">Recent Uploads</h3>
          <div className="grid grid-cols-10 gap-2">
            {photos.slice(-20).reverse().map(photo => (
              <div key={photo.id} className="relative aspect-square rounded overflow-hidden">
                <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                <StatusDot status={photo.status} confidence={photo.aiConfidence} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
