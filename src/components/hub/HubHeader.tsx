import { useHub } from '@/contexts/HubContext';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatItem({ label, value, highlight }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={cn('text-2xl font-bold', highlight && 'text-success')}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function HubHeader() {
  const { mode, photoStats, paintingStats, subtypes } = useHub();

  return (
    <header className={cn(
      'text-primary-foreground shadow-lg',
      mode === 'photos' 
        ? 'bg-gradient-to-r from-primary via-[hsl(340,45%,40%)] to-primary'
        : 'bg-gradient-to-r from-accent via-[hsl(35,70%,50%)] to-[hsl(25,60%,45%)]'
    )}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              🎨
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold">Streams of Color</h1>
              <p className={cn(
                'text-sm',
                mode === 'photos' ? 'text-primary-foreground/70' : 'text-white/70'
              )}>
                {mode === 'photos' ? 'AI Training Hub' : 'Painting Library'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {mode === 'photos' ? (
              <>
                <StatItem label="Photos" value={photoStats.total} />
                <StatItem label="Confirmed" value={photoStats.confirmed} />
                <StatItem 
                  label="Accuracy" 
                  value={photoStats.accuracy ? `${photoStats.accuracy}%` : '-'} 
                  highlight={photoStats.accuracy !== null && parseFloat(photoStats.accuracy) >= 70} 
                />
              </>
            ) : (
              <>
                <StatItem label="Paintings" value={paintingStats.total} />
                <StatItem label="Analyzed" value={paintingStats.analyzed} />
                <StatItem label="Linked" value={paintingStats.linked} />
              </>
            )}
            <div className={cn(
              'border-l pl-6',
              mode === 'photos' ? 'border-primary-foreground/30' : 'border-white/30'
            )}>
              <div className="text-xs opacity-70">Subtypes</div>
              <div className="text-lg font-bold">{subtypes.length}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
