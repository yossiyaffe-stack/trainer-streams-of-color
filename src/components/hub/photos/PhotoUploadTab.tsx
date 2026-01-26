import { useState, useCallback } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { StatusDot } from '../StatusDot';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PhotoUploadTab() {
  const { photos, addPhotos, analyzePhotos, photoAnalyzing, photoStats, confirmPhotoCorrect, settings } = useHub();
  const [dragOver, setDragOver] = useState(false);

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

  const highConfCount = photos.filter(p => p.status === 'analyzed' && (p.aiConfidence ?? 0) >= settings.autoConfidenceThreshold).length;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Upload Zone */}
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
