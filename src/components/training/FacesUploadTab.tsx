import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  Loader2, 
  FolderUp,
  Check,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocalUpload {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'analyzing' | 'done' | 'error';
}

export function FacesUploadTab() {
  const [dragOver, setDragOver] = useState(false);
  const [localUploads, setLocalUploads] = useState<LocalUpload[]>([]);
  const [uploading, setUploading] = useState(false);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      localUploads.forEach(u => URL.revokeObjectURL(u.preview));
    };
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addLocalFiles(files);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addLocalFiles(files);
    e.target.value = '';
  }, []);

  const addLocalFiles = (files: File[]) => {
    const newUploads: LocalUpload[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
    }));
    setLocalUploads(prev => [...prev, ...newUploads]);
  };

  const removeLocalFile = (id: string) => {
    setLocalUploads(prev => {
      const upload = prev.find(u => u.id === id);
      if (upload) URL.revokeObjectURL(upload.preview);
      return prev.filter(u => u.id !== id);
    });
  };

  const uploadAndAnalyze = async () => {
    const pendingUploads = localUploads.filter(u => u.status === 'pending');
    if (pendingUploads.length === 0) return;

    setUploading(true);

    for (const upload of pendingUploads) {
      setLocalUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'analyzing' as const } : u
      ));

      try {
        // Upload to storage
        const filename = `training/${Date.now()}_${upload.file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('face-images')
          .upload(filename, upload.file);

        if (uploadError) throw uploadError;

        // Create face_images record
        const { data: imageRecord, error: dbError } = await supabase
          .from('face_images')
          .insert({
            storage_path: filename,
            original_filename: upload.file.name,
            source: 'training_upload',
            file_size_bytes: upload.file.size,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Run analysis
        const { data: publicUrl } = supabase.storage
          .from('face-images')
          .getPublicUrl(filename);

        const { error: analyzeError } = await supabase.functions.invoke('analyze-face', {
          body: { 
            imageId: imageRecord.id,
            imageUrl: publicUrl.publicUrl,
          },
        });

        if (analyzeError) {
          console.warn('Analysis failed:', analyzeError);
        }

        setLocalUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'done' as const } : u
        ));
        
      } catch (err) {
        console.error('Upload failed:', err);
        setLocalUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'error' as const } : u
        ));
        toast.error(`Failed to upload ${upload.file.name}`);
      }
    }

    setUploading(false);
    toast.success(`Uploaded ${pendingUploads.length} photos`);
  };

  const pendingCount = localUploads.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
          <FolderUp className="w-6 h-6" />
          Upload Face Photos
        </h2>
        <p className="text-muted-foreground mt-1">
          Upload portrait photos from your computer for AI analysis
        </p>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-card',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-4xl mb-3">👤</div>
        <h3 className="text-lg font-medium mb-2">Drop Photos Here</h3>
        <p className="text-muted-foreground text-sm mb-4">or click to browse your files</p>
        <label className="inline-block">
          <Button variant="outline" className="cursor-pointer">
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

      {/* Uploads Grid */}
      {localUploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {localUploads.length} photo{localUploads.length !== 1 ? 's' : ''} selected
            </h4>
            {pendingCount > 0 && (
              <Button onClick={uploadAndAnalyze} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Upload & Analyze ({pendingCount})
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {localUploads.map(upload => (
              <div 
                key={upload.id} 
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img 
                  src={upload.preview} 
                  alt="" 
                  className="w-full h-full object-cover" 
                />
                
                {/* Status overlay */}
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  upload.status === 'analyzing' && 'bg-black/50',
                  upload.status === 'done' && 'bg-primary/30',
                  upload.status === 'error' && 'bg-destructive/30'
                )}>
                  {upload.status === 'analyzing' && (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  )}
                  {upload.status === 'done' && (
                    <Check className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Remove button - positioned at bottom */}
                {upload.status === 'pending' && (
                  <button
                    onClick={() => removeLocalFile(upload.id)}
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
