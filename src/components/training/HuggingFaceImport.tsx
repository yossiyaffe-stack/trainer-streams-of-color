import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Download, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Check,
  Database,
  ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function HuggingFaceImport() {
  const { toast } = useToast();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [images, setImages] = useState<HFImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
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
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load available datasets',
          variant: 'destructive',
        });
      }
    }
    loadDatasets();
  }, []);

  // Browse images when dataset or page changes
  useEffect(() => {
    if (!selectedDataset) return;

    async function browseImages() {
      setLoading(true);
      setSelectedImages(new Set());

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
          setImages(data.images);
          setTotal(data.total);
        } else {
          const msg = data?.hint ? `${data.error}. ${data.hint}` : data.error;
          throw new Error(msg || 'Failed to load images');
        }
      } catch (err) {
        console.error('Failed to browse images:', err);
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Failed to load images from dataset',
          variant: 'destructive',
        });
        setImages([]);
      } finally {
        setLoading(false);
      }
    }

    browseImages();
  }, [selectedDataset, offset]);

  const toggleImage = (id: string) => {
    setSelectedImages(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(images.map(img => img.id)));
    }
  };

  const handleImport = async () => {
    if (selectedImages.size === 0) return;

    setImporting(true);
    try {
      const imagesToImport = images.filter(img => selectedImages.has(img.id));
      
      const { data, error } = await supabase.functions.invoke('import-huggingface', {
        body: { 
          action: 'import', 
          images: imagesToImport,
        },
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: 'Import Complete',
          description: `Successfully imported ${data.imported} images`,
        });
        setSelectedImages(new Set());
      } else {
        const msg = data?.hint ? `${data.error}. ${data.hint}` : data.error;
        throw new Error(msg || 'Import failed');
      }
    } catch (err) {
      console.error('Import failed:', err);
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const currentDataset = datasets.find(d => d.key === selectedDataset);

  return (
    <div className="space-y-6">
      {/* Header */}
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
            onClick={selectAll}
            disabled={loading || images.length === 0}
          >
            {selectedImages.size === images.length && images.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>

          <Button 
            onClick={handleImport}
            disabled={importing || selectedImages.size === 0}
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import {selectedImages.size > 0 ? `(${selectedImages.size})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {offset + 1}-{Math.min(offset + limit, total)} of {total.toLocaleString()} images
        </span>
        <Badge variant="secondary">
          {selectedImages.size} selected
        </Badge>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">No Images Found</h3>
          <p className="text-muted-foreground">
            Select a dataset to browse available face images
          </p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {images.map((image) => {
            const isSelected = selectedImages.has(image.id);
            return (
              <motion.div
                key={image.id}
                className={cn(
                  'relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-border'
                )}
                onClick={() => toggleImage(image.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={image.url}
                  alt={`Face ${image.sourceId}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Selection overlay */}
                <div className={cn(
                  'absolute inset-0 transition-colors',
                  isSelected ? 'bg-primary/20' : 'bg-transparent hover:bg-black/10'
                )} />

                {/* Checkbox */}
                <div className="absolute top-2 left-2">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-background/80'
                  )}>
                    {isSelected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Source badge */}
                <div className="absolute bottom-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-background/80">
                    #{image.sourceId}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0 || loading}
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
          disabled={offset + limit >= total || loading}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
