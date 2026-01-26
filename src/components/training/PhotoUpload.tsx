import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotoSelect: (file: File) => void;
  selectedPhoto: File | null;
  isAnalyzing?: boolean;
}

export function PhotoUpload({ onPhotoSelect, selectedPhoto, isAnalyzing }: PhotoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, [onPhotoSelect]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearPhoto = () => {
    setPreviewUrl(null);
    onPhotoSelect(null as any);
  };

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop a photo here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                For best results, use a well-lit photo with visible face, neck, and shoulders
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-muted"
        >
          <img 
            src={previewUrl} 
            alt="Selected photo" 
            className="w-full h-80 object-cover"
          />
          
          {/* Overlay with status */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Ready for analysis</span>
                  </>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={clearPhoto}
                disabled={isAnalyzing}
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Photo guidelines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
        {[
          { icon: '☀️', text: 'Natural daylight' },
          { icon: '🚫', text: 'No heavy makeup' },
          { icon: '📷', text: 'Clear face visible' },
          { icon: '🎨', text: 'No color filters' },
        ].map((tip) => (
          <div key={tip.text} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <span>{tip.icon}</span>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
