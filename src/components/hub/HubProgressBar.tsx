import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  label: string;
  variant?: 'primary' | 'accent';
}

export function HubProgressBar({ current, total, label, variant = 'primary' }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg p-4 z-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{current} / {total}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-300',
              variant === 'primary' ? 'bg-primary' : 'bg-accent'
            )} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
}
