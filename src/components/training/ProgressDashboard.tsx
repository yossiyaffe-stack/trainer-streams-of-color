import { useState, useMemo } from 'react';
import { BulkPhoto } from '@/types/training';
import { Subtype } from '@/data/subtypes';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Check, Target, Pencil, BarChart3, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  photos: BulkPhoto[];
  subtypes: Subtype[];
}

export function ProgressDashboard({ photos, subtypes }: ProgressDashboardProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  // Calculate overall statistics
  const stats = useMemo(() => {
    const confirmed = photos.filter(p => p.status === 'confirmed');
    const correct = confirmed.filter(p => 
      p.confirmedSubtype?.id === p.aiPrediction?.id
    );
    const correctionsList = confirmed.filter(p => 
      p.confirmedSubtype?.id !== p.aiPrediction?.id
    );

    // By season
    const bySeason: Record<string, { total: number; correct: number }> = { 
      Spring: { total: 0, correct: 0 }, 
      Summer: { total: 0, correct: 0 }, 
      Autumn: { total: 0, correct: 0 }, 
      Winter: { total: 0, correct: 0 } 
    };
    confirmed.forEach(p => {
      const season = (p.confirmedSubtype?.season || p.aiPrediction?.season || '').charAt(0).toUpperCase() + 
                     (p.confirmedSubtype?.season || p.aiPrediction?.season || '').slice(1);
      if (bySeason[season]) {
        bySeason[season].total++;
        if (p.confirmedSubtype?.id === p.aiPrediction?.id) {
          bySeason[season].correct++;
        }
      }
    });

    // By confidence level
    const byConfidence = {
      high: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      low: { total: 0, correct: 0 }
    };
    confirmed.forEach(p => {
      const level = (p.aiConfidence || 0) >= 80 ? 'high' : (p.aiConfidence || 0) >= 50 ? 'medium' : 'low';
      byConfidence[level].total++;
      if (p.confirmedSubtype?.id === p.aiPrediction?.id) {
        byConfidence[level].correct++;
      }
    });

    // Common mistakes
    const mistakeMap = new Map<string, number>();
    correctionsList.forEach(p => {
      const key = `${p.aiPrediction?.name || 'Unknown'} → ${p.confirmedSubtype?.name || 'Unknown'}`;
      mistakeMap.set(key, (mistakeMap.get(key) || 0) + 1);
    });
    const commonMistakes = Array.from(mistakeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalPhotos: photos.length,
      confirmed: confirmed.length,
      correct: correct.length,
      corrections: correctionsList.length,
      accuracy: confirmed.length > 0 ? (correct.length / confirmed.length * 100).toFixed(1) : '0',
      bySeason,
      byConfidence,
      commonMistakes,
      avgConfidence: confirmed.length > 0 
        ? (confirmed.reduce((sum, p) => sum + (p.aiConfidence || 0), 0) / confirmed.length).toFixed(1)
        : '0'
    };
  }, [photos]);

  // Subtype performance
  const subtypePerformance = useMemo(() => {
    const performance = new Map<string, {
      id: string;
      name: string;
      season: string;
      total: number;
      correct: number;
      confidences: number[];
    }>();
    
    photos.filter(p => p.status === 'confirmed').forEach(p => {
      const subtypeId = p.confirmedSubtype?.id;
      if (!subtypeId) return;
      
      if (!performance.has(subtypeId)) {
        performance.set(subtypeId, {
          id: subtypeId,
          name: p.confirmedSubtype?.name || '',
          season: p.confirmedSubtype?.season || '',
          total: 0,
          correct: 0,
          confidences: []
        });
      }
      
      const perf = performance.get(subtypeId)!;
      perf.total++;
      if (p.confirmedSubtype?.id === p.aiPrediction?.id) {
        perf.correct++;
      }
      perf.confidences.push(p.aiConfidence || 0);
    });

    return Array.from(performance.values())
      .map(p => ({
        ...p,
        accuracy: p.total > 0 ? (p.correct / p.total * 100).toFixed(1) : '0',
        avgConfidence: p.confidences.length > 0 
          ? (p.confidences.reduce((a, b) => a + b, 0) / p.confidences.length).toFixed(1)
          : '0'
      }))
      .sort((a, b) => b.total - a.total);
  }, [photos]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard 
          label="Total Photos" 
          value={stats.totalPhotos}
          icon={<Camera className="w-4 h-4" />}
        />
        <StatCard 
          label="Confirmed" 
          value={stats.confirmed}
          icon={<Check className="w-4 h-4" />}
          variant="success"
        />
        <StatCard 
          label="Overall Accuracy" 
          value={`${stats.accuracy}%`}
          icon={<Target className="w-4 h-4" />}
          variant={parseFloat(stats.accuracy) >= 70 ? 'success' : parseFloat(stats.accuracy) >= 50 ? 'warning' : 'destructive'}
        />
        <StatCard 
          label="Corrections Made" 
          value={stats.corrections}
          icon={<Pencil className="w-4 h-4" />}
          variant="warning"
        />
        <StatCard 
          label="Avg Confidence" 
          value={`${stats.avgConfidence}%`}
          icon={<BarChart3 className="w-4 h-4" />}
          variant="primary"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Season Breakdown */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-serif text-lg font-semibold mb-4">Accuracy by Season</h3>
          <div className="space-y-4">
            {Object.entries(stats.bySeason).map(([season, data]) => (
              <SeasonBar 
                key={season}
                season={season}
                total={data.total}
                correct={data.correct}
              />
            ))}
          </div>
        </div>

        {/* Confidence Calibration */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-serif text-lg font-semibold mb-2">Confidence Calibration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            How accurate is the AI at different confidence levels?
          </p>
          <div className="space-y-4">
            {Object.entries(stats.byConfidence).map(([level, data]) => (
              <div key={level} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium capitalize">
                  {level}
                  <span className="text-muted-foreground text-xs block">
                    {level === 'high' ? '(80%+)' : level === 'medium' ? '(50-79%)' : '(<50%)'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    {data.total > 0 && (
                      <div 
                        className={cn(
                          'h-full transition-all',
                          data.correct / data.total >= 0.8 ? 'bg-success' :
                          data.correct / data.total >= 0.5 ? 'bg-warning' :
                          'bg-destructive'
                        )}
                        style={{ width: `${data.correct / data.total * 100}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-20 text-right text-sm">
                  {data.total > 0 
                    ? `${(data.correct / data.total * 100).toFixed(0)}%`
                    : '—'}
                  <span className="text-muted-foreground text-xs block">
                    ({data.correct}/{data.total})
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 text-warning shrink-0" />
            <span>
              <strong>Well-calibrated:</strong> High confidence predictions should be mostly correct, 
              low confidence should be less accurate.
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Common Mistakes */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-serif text-lg font-semibold mb-2">Most Common Mistakes</h3>
          <p className="text-sm text-muted-foreground mb-4">
            What does the AI confuse most often?
          </p>
          {stats.commonMistakes.length > 0 ? (
            <div className="space-y-2">
              {stats.commonMistakes.map(([mistake, count], i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded"
                >
                  <span className="text-sm">{mistake}</span>
                  <Badge variant="outline" className="border-warning text-warning">
                    {count}×
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No mistakes recorded yet
            </div>
          )}
        </div>

        {/* Training Progress */}
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-serif text-lg font-semibold mb-4">Training Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Photos analyzed</span>
              <span className="font-semibold">{photos.filter(p => p.extractedFeatures).length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Corrections applied</span>
              <span className="font-semibold text-warning">{stats.corrections}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <span className="text-sm">Current accuracy</span>
              <span className={cn(
                'font-semibold',
                parseFloat(stats.accuracy) >= 70 ? 'text-success' : 
                parseFloat(stats.accuracy) >= 50 ? 'text-warning' : 'text-destructive'
              )}>
                {stats.accuracy}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-success/10 border border-success/30 rounded-lg">
              <span className="text-sm font-medium">Verified correct</span>
              <span className="font-semibold text-success">{stats.correct}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtype Performance Table */}
      {subtypePerformance.length > 0 && (
        <div className="p-6 rounded-xl bg-card border border-border">
          <h3 className="font-serif text-lg font-semibold mb-4">Performance by Subtype</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium">Subtype</th>
                  <th className="px-4 py-3 text-left font-medium">Season</th>
                  <th className="px-4 py-3 text-center font-medium">Samples</th>
                  <th className="px-4 py-3 text-center font-medium">Accuracy</th>
                  <th className="px-4 py-3 text-center font-medium">Avg Confidence</th>
                  <th className="px-4 py-3 font-medium">Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subtypePerformance.slice(0, 15).map(perf => (
                  <tr key={perf.id}>
                    <td className="px-4 py-3 font-medium">{perf.name}</td>
                    <td className="px-4 py-3">
                      <SeasonBadge season={perf.season} />
                    </td>
                    <td className="px-4 py-3 text-center">{perf.total}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge 
                        variant="outline"
                        className={cn(
                          parseFloat(perf.accuracy) >= 80 ? 'border-success text-success' :
                          parseFloat(perf.accuracy) >= 50 ? 'border-warning text-warning' :
                          'border-destructive text-destructive'
                        )}
                      >
                        {perf.accuracy}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">{perf.avgConfidence}%</td>
                    <td className="px-4 py-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full',
                            parseFloat(perf.accuracy) >= 80 ? 'bg-success' :
                            parseFloat(perf.accuracy) >= 50 ? 'bg-warning' :
                            'bg-destructive'
                          )}
                          style={{ width: `${perf.accuracy}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon,
  variant = 'default'
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}) {
  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
  };

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-2 mb-1 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold', variantClasses[variant])}>
        {value}
      </div>
    </div>
  );
}

function SeasonBar({ season, total, correct }: { season: string; total: number; correct: number }) {
  const accuracy = total > 0 ? (correct / total * 100) : 0;
  
  const seasonColors: Record<string, { bg: string; bar: string; text: string }> = {
    Spring: { bg: 'bg-spring/20', bar: 'bg-spring', text: 'text-spring' },
    Summer: { bg: 'bg-summer/20', bar: 'bg-summer', text: 'text-summer' },
    Autumn: { bg: 'bg-autumn/20', bar: 'bg-autumn', text: 'text-autumn' },
    Winter: { bg: 'bg-winter/20', bar: 'bg-winter', text: 'text-winter' }
  };
  
  const colors = seasonColors[season] || seasonColors.Spring;

  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-20 text-sm font-medium', colors.text)}>
        {season}
      </div>
      <div className={cn('flex-1 h-6 rounded-full overflow-hidden', colors.bg)}>
        {total > 0 && (
          <div 
            className={cn('h-full flex items-center justify-end pr-2', colors.bar)}
            style={{ width: `${accuracy}%` }}
          >
            <span className="text-background text-xs font-medium">
              {accuracy.toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      <div className="w-16 text-right text-sm text-muted-foreground">
        {correct}/{total}
      </div>
    </div>
  );
}

function SeasonBadge({ season }: { season: string }) {
  const seasonColors: Record<string, string> = {
    spring: 'bg-spring/20 text-spring border-spring/30',
    summer: 'bg-summer/20 text-summer border-summer/30',
    autumn: 'bg-autumn/20 text-autumn border-autumn/30',
    winter: 'bg-winter/20 text-winter border-winter/30'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn('capitalize', seasonColors[season.toLowerCase()] || 'bg-muted')}
    >
      {season}
    </Badge>
  );
}
