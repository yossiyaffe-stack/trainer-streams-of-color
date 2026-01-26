import { useMemo } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning';
}

function StatCard({ icon, label, value, variant = 'default' }: StatCardProps) {
  const colors = {
    default: 'text-foreground',
    success: 'text-success',
    warning: 'text-warning'
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <span className="text-xl">{icon}</span>
        <div className={`text-2xl font-bold ${colors[variant]}`}>{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

export function PhotoProgressTab() {
  const { photos, photoStats } = useHub();

  const bySeason = useMemo(() => {
    const r = { 
      spring: { total: 0, correct: 0 }, 
      summer: { total: 0, correct: 0 }, 
      autumn: { total: 0, correct: 0 }, 
      winter: { total: 0, correct: 0 } 
    };
    photos.filter(p => p.status === 'confirmed').forEach(p => {
      const season = p.confirmedSubtype?.season;
      if (season && r[season]) {
        r[season].total++;
        if (p.confirmedSubtype?.id === p.aiPrediction?.id) r[season].correct++;
      }
    });
    return r;
  }, [photos]);

  const seasonEmojis: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️'
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon="📷" label="Total" value={photoStats.total} />
        <StatCard icon="✓" label="Confirmed" value={photoStats.confirmed} variant="success" />
        <StatCard 
          icon="🎯" 
          label="Accuracy" 
          value={photoStats.accuracy ? `${photoStats.accuracy}%` : '-'} 
          variant={photoStats.accuracy && parseFloat(photoStats.accuracy) >= 70 ? 'success' : 'warning'} 
        />
        <StatCard 
          icon="✏️" 
          label="Corrections" 
          value={photoStats.confirmed - photoStats.correct} 
          variant="warning" 
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Accuracy by Season</h3>
          <div className="space-y-4">
            {Object.entries(bySeason).map(([season, data]) => {
              const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
              return (
                <div key={season} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">
                      {seasonEmojis[season]} {season}
                    </span>
                    <span className="text-muted-foreground">
                      {data.total > 0 ? `${accuracy.toFixed(0)}%` : '-'}
                    </span>
                  </div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
