import { cn } from '@/lib/utils';
import type { PhotoStatus, PaintingStatus } from '@/types/hub';

interface StatusDotProps {
  status: PhotoStatus | PaintingStatus;
  confidence?: number | null;
  className?: string;
}

export function StatusDot({ status, confidence, className }: StatusDotProps) {
  const getColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-muted-foreground';
      case 'analyzing':
        return 'bg-warning animate-pulse';
      case 'analyzed':
        if (confidence !== undefined && confidence !== null) {
          if (confidence >= 80) return 'bg-success';
          if (confidence >= 50) return 'bg-warning';
          return 'bg-destructive';
        }
        return 'bg-success';
      case 'confirmed':
      case 'reviewed':
        return 'bg-success';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-muted-foreground';
    }
  };

  return (
    <div className={cn(
      'absolute top-1 right-1 w-3 h-3 rounded-full shadow-sm',
      getColor(),
      className
    )} />
  );
}
