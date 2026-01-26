import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Loader2, Check, AlertCircle, X, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaintingDetailModal } from './PaintingDetailModal';
import type { Painting, PaintingAnalysis } from '@/types/paintings';

interface PaintingUploadProps {
  onUploadComplete?: () => void;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  paintingData?: Painting;
}

export function PaintingUpload({ onUploadComplete }: PaintingUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [recentPaintings, setRecentPaintings] = useState<Painting[]>([]);

  // Load recent paintings from database on mount
  useEffect(() => {
    fetchRecentPaintings();
  }, []);

  const fetchRecentPaintings = async () => {
    // Fetch only user-uploaded paintings (exclude museum imports)
    const { data, error } = await supabase
      .from('paintings')
      .select('*')
      .not('notes', 'ilike', '%Imported from%')
      .order('created_at', { ascending: false })
      .limit(12);
    
    if (data && !error) {
      const paintings = data.map(p => ({
        ...p,
        ai_analysis: p.ai_analysis as PaintingAnalysis | null,
      })) as Painting[];
      setRecentPaintings(paintings);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/')
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadingFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const saveToGallery = async () => {
    setIsProcessing(true);
    
    for (const uploadFile of files.filter(f => f.status === 'pending')) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 20 } : f
        ));

        // Upload to storage
        const fileExt = uploadFile.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `paintings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('paintings')
          .upload(filePath, uploadFile.file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('paintings')
          .getPublicUrl(filePath);

        const imageUrl = urlData.publicUrl;

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, progress: 70 } : f
        ));

        // Save to database WITHOUT analysis
        const paintingRecord = {
          image_url: imageUrl,
          thumbnail_url: imageUrl,
          original_filename: uploadFile.file.name,
          title: uploadFile.file.name.replace(/\.[^/.]+$/, ''), // Use filename as title
          status: 'pending', // Not analyzed yet
        };

        const { data: savedPainting, error: dbError } = await supabase
          .from('paintings')
          .insert(paintingRecord)
          .select()
          .single();

        if (dbError) throw dbError;

        // Store the painting data for viewing
        const typedPainting = {
          ...savedPainting,
          ai_analysis: savedPainting.ai_analysis as PaintingAnalysis | null,
        } as Painting;

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'complete', progress: 100, paintingData: typedPainting } : f
        ));

        toast.success(`Saved: ${uploadFile.file.name}`);

      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' } 
            : f
        ));
        toast.error(`Failed to save ${uploadFile.file.name}`);
      }
    }

    setIsProcessing(false);
    
    // Refresh recent paintings list
    await fetchRecentPaintings();
    
    const successCount = files.filter(f => f.status === 'complete').length;
    if (successCount > 0) {
      toast.success(`Saved ${successCount} painting(s) to gallery! Click any painting to analyze it.`);
      setFiles([]);
      onUploadComplete?.();
    }
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'complete'));
  };

  const handlePaintingUpdate = async () => {
    await fetchRecentPaintings();
    setSelectedPainting(null);
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const completedCount = files.filter(f => f.status === 'complete').length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="painting-upload"
        />
        <label htmlFor="painting-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-lg">Drop paintings here or click to browse</p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP • Save first, then analyze from gallery
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Prominent Save Button */}
          {pendingCount > 0 && (
            <div className="bg-primary/10 border-2 border-primary rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-primary mb-2">
                📸 {pendingCount} painting{pendingCount > 1 ? 's' : ''} ready to save!
              </h3>
              <p className="text-muted-foreground mb-4">
                Save to gallery first, then analyze individual paintings with custom options
              </p>
              <Button 
                size="lg" 
                onClick={saveToGallery} 
                disabled={isProcessing}
                className="text-lg px-8 py-5 h-auto font-bold"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving to Gallery...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    💾 Save {pendingCount} to Gallery
                  </>
                )}
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {pendingCount} pending • {completedCount} complete
            </h3>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearCompleted}>
                  Clear completed
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative aspect-square rounded-lg overflow-hidden border border-border group ${
                  file.status === 'complete' ? 'cursor-pointer hover:border-primary' : ''
                }`}
                onClick={() => {
                  if (file.status === 'complete' && file.paintingData) {
                    setSelectedPainting(file.paintingData);
                  }
                }}
              >
                <img
                  src={file.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                
                {/* Remove button for pending files */}
                {file.status === 'pending' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles(prev => prev.filter(f => f.id !== file.id));
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
                
                {/* Status Overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-colors ${
                  file.status === 'complete' ? 'bg-green-500/80 group-hover:bg-primary/80' :
                  file.status === 'error' ? 'bg-red-500/80' :
                  file.status !== 'pending' ? 'bg-black/60' : ''
                }`}>
                  {file.status === 'uploading' && (
                    <div className="text-center text-white">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-xs">Saving...</p>
                    </div>
                  )}
                  {file.status === 'complete' && (
                    <div className="text-center text-white">
                      <div className="group-hover:hidden">
                        <Check className="w-8 h-8" />
                      </div>
                      <div className="hidden group-hover:block">
                        <Eye className="w-6 h-6 mx-auto mb-1" />
                        <p className="text-xs font-medium">View & Analyze</p>
                      </div>
                    </div>
                  )}
                  {file.status === 'error' && (
                    <div className="text-center text-white">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">{file.error || 'Error'}</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {file.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={file.progress} className="h-1 rounded-none" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Saved Paintings */}
      {recentPaintings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg">📚 Gallery ({recentPaintings.length} saved)</h3>
            <p className="text-sm text-muted-foreground">Click to view & analyze</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recentPaintings.map((painting) => (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border cursor-pointer group hover:border-primary hover:shadow-lg transition-all"
                onClick={() => setSelectedPainting(painting)}
              >
                <img
                  src={painting.thumbnail_url || painting.image_url}
                  alt={painting.title || 'Painting'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-medium truncate">{painting.title || 'Untitled'}</p>
                    {painting.status === 'pending' ? (
                      <span className="text-amber-300 text-[10px]">📋 Not analyzed yet</span>
                    ) : painting.suggested_season ? (
                      <span className="text-white/80 text-[10px]">{painting.suggested_season}</span>
                    ) : null}
                  </div>
                </div>
                {/* Status indicator */}
                <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                  painting.status === 'analyzed' ? 'bg-green-500' : 'bg-amber-500'
                }`} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPainting && (
          <PaintingDetailModal
            painting={selectedPainting}
            onClose={() => setSelectedPainting(null)}
            onDelete={handlePaintingUpdate}
            onUpdate={handlePaintingUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
