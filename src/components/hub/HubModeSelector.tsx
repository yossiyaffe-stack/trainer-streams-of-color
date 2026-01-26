import { useHub } from '@/contexts/HubContext';
import { User, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HubModeSelector() {
  const { mode, setMode, setActiveTab } = useHub();

  return (
    <div className="bg-card border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex">
          <button
            onClick={() => { setMode('photos'); setActiveTab('upload'); }}
            className={cn(
              'px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2',
              mode === 'photos'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="w-4 h-4" />
            Photo Training
          </button>
          <button
            onClick={() => { setMode('paintings'); setActiveTab('upload'); }}
            className={cn(
              'px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2',
              mode === 'paintings'
                ? 'border-accent text-accent-foreground bg-accent/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Palette className="w-4 h-4" />
            Painting Library
          </button>
        </div>
      </div>
    </div>
  );
}
