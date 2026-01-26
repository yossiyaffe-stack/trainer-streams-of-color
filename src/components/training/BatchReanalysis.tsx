import { useState, useMemo } from 'react';
import { BulkPhoto } from '@/types/training';
import { Subtype } from '@/data/subtypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Download, FlaskConical, TrendingUp, TrendingDown, Minus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReanalysisResult {
  photoId: string;
  filename: string;
  originalPrediction: Subtype | null;
  originalConfidence: number | null;
  confirmedSubtype: Subtype | null;
  newPrediction: Subtype | null;
  newConfidence: number;
  originalWasCorrect: boolean;
  newIsCorrect: boolean;
  improved: boolean;
  regressed: boolean;
  confidenceChange: number;
  error?: string;
}

interface ReanalysisSummary {
  total: number;
  originalAccuracy: string;
  newAccuracy: string;
  accuracyChange: string;
  improved: number;
  regressed: number;
  unchanged: number;
  avgConfidenceChange: string;
  errors: number;
}

interface BatchReanalysisProps {
  photos: BulkPhoto[];
  subtypes: Subtype[];
  modelVersion?: { version: string; trainedOn: number };
}

export function BatchReanalysis({ photos, subtypes, modelVersion }: BatchReanalysisProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ items: ReanalysisResult[]; summary: ReanalysisSummary } | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<'confirmed' | 'corrections' | 'all'>('confirmed');
  const [compareMode, setCompareMode] = useState(false);

  // Get photos eligible for re-analysis
  const eligiblePhotos = useMemo(() => {
    switch (selectedPhotos) {
      case 'confirmed':
        return photos.filter(p => p.status === 'confirmed');
      case 'corrections':
        return photos.filter(p => 
          p.status === 'confirmed' && 
          p.confirmedSubtype?.id !== p.aiPrediction?.id
        );
      case 'all':
        return photos.filter(p => p.extractedFeatures);
      default:
        return [];
    }
  }, [photos, selectedPhotos]);

  // Simulate re-analysis (in production this would call the AI)
  const mockReanalyze = async (photo: BulkPhoto): Promise<{ subtype: Subtype | null; confidence: number }> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate improved predictions - more likely to be correct after training
    const wasCorrect = photo.aiPrediction?.id === photo.confirmedSubtype?.id;
    const improvementChance = wasCorrect ? 0.1 : 0.6; // If wrong before, 60% chance to improve
    
    if (!wasCorrect && Math.random() < improvementChance) {
      // Improved - now predicts correctly
      return {
        subtype: photo.confirmedSubtype,
        confidence: Math.floor(Math.random() * 20) + 75
      };
    } else if (wasCorrect && Math.random() < 0.05) {
      // Small chance of regression
      const wrongSubtype = subtypes.find(s => s.id !== photo.confirmedSubtype?.id);
      return {
        subtype: wrongSubtype || photo.aiPrediction,
        confidence: Math.floor(Math.random() * 30) + 50
      };
    } else {
      // Same as before
      return {
        subtype: photo.aiPrediction,
        confidence: (photo.aiConfidence || 70) + Math.floor(Math.random() * 10) - 5
      };
    }
  };

  // Run batch re-analysis
  const runReanalysis = async () => {
    setIsRunning(true);
    setProgress({ current: 0, total: eligiblePhotos.length });
    
    const analysisResults: ReanalysisResult[] = [];
    
    for (let i = 0; i < eligiblePhotos.length; i++) {
      const photo = eligiblePhotos[i];
      setProgress({ current: i + 1, total: eligiblePhotos.length });
      
      try {
        const newPrediction = await mockReanalyze(photo);
        
        const originalWasCorrect = photo.aiPrediction?.id === photo.confirmedSubtype?.id;
        const newIsCorrect = newPrediction.subtype?.id === photo.confirmedSubtype?.id;
        
        analysisResults.push({
          photoId: photo.id,
          filename: photo.filename,
          originalPrediction: photo.aiPrediction,
          originalConfidence: photo.aiConfidence,
          confirmedSubtype: photo.confirmedSubtype,
          newPrediction: newPrediction.subtype,
          newConfidence: newPrediction.confidence,
          originalWasCorrect,
          newIsCorrect,
          improved: !originalWasCorrect && newIsCorrect,
          regressed: originalWasCorrect && !newIsCorrect,
          confidenceChange: newPrediction.confidence - (photo.aiConfidence || 0)
        });
      } catch (error) {
        analysisResults.push({
          photoId: photo.id,
          filename: photo.filename,
          originalPrediction: photo.aiPrediction,
          originalConfidence: photo.aiConfidence,
          confirmedSubtype: photo.confirmedSubtype,
          newPrediction: null,
          newConfidence: 0,
          originalWasCorrect: false,
          newIsCorrect: false,
          improved: false,
          regressed: false,
          confidenceChange: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const summary = calculateSummary(analysisResults);
    setResults({ items: analysisResults, summary });
    setIsRunning(false);
  };

  const calculateSummary = (items: ReanalysisResult[]): ReanalysisSummary => {
    const validItems = items.filter(i => !i.error);
    const total = validItems.length;
    
    if (total === 0) {
      return {
        total: 0,
        originalAccuracy: '0',
        newAccuracy: '0',
        accuracyChange: '0',
        improved: 0,
        regressed: 0,
        unchanged: 0,
        avgConfidenceChange: '0',
        errors: items.filter(i => i.error).length
      };
    }
    
    const originalCorrect = validItems.filter(i => i.originalWasCorrect).length;
    const newCorrect = validItems.filter(i => i.newIsCorrect).length;
    const improved = validItems.filter(i => i.improved).length;
    const regressed = validItems.filter(i => i.regressed).length;
    const unchanged = validItems.filter(i => 
      i.originalWasCorrect === i.newIsCorrect
    ).length;
    
    const avgConfidenceChange = validItems.reduce((sum, i) => 
      sum + (i.confidenceChange || 0), 0
    ) / total;
    
    return {
      total,
      originalAccuracy: (originalCorrect / total * 100).toFixed(1),
      newAccuracy: (newCorrect / total * 100).toFixed(1),
      accuracyChange: ((newCorrect - originalCorrect) / total * 100).toFixed(1),
      improved,
      regressed,
      unchanged,
      avgConfidenceChange: avgConfidenceChange.toFixed(1),
      errors: items.filter(i => i.error).length
    };
  };

  const exportResults = () => {
    if (!results) return;
    
    const csv = [
      ['Photo ID', 'Ground Truth', 'Original Prediction', 'Original Confidence', 
       'New Prediction', 'New Confidence', 'Status', 'Confidence Change'].join(','),
      ...results.items.map(item => [
        item.photoId,
        item.confirmedSubtype?.name || '',
        item.originalPrediction?.name || '',
        item.originalConfidence || '',
        item.newPrediction?.name || '',
        item.newConfidence || '',
        item.improved ? 'Improved' : item.regressed ? 'Regressed' : 
          item.newIsCorrect ? 'Correct' : 'Incorrect',
        item.confidenceChange?.toFixed(1) || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reanalysis-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercent = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h3 className="font-serif text-lg font-semibold mb-2">Batch Re-Analysis</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Test how well the AI has learned from your corrections
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Photo Selection */}
          <div>
            <Label className="mb-2 block">Photos to Re-analyze</Label>
            <Select 
              value={selectedPhotos} 
              onValueChange={(v) => setSelectedPhotos(v as typeof selectedPhotos)}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">
                  All Confirmed ({photos.filter(p => p.status === 'confirmed').length})
                </SelectItem>
                <SelectItem value="corrections">
                  Only Corrections ({photos.filter(p => 
                    p.status === 'confirmed' && 
                    p.confirmedSubtype?.id !== p.aiPrediction?.id
                  ).length})
                </SelectItem>
                <SelectItem value="all">
                  All Analyzed ({photos.filter(p => p.extractedFeatures).length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Info */}
          <div>
            <Label className="mb-2 block">Model Version</Label>
            <div className="p-3 rounded-lg border border-border bg-muted/30">
              <div className="font-medium">v{modelVersion?.version || '1.0'}</div>
              <div className="text-sm text-muted-foreground">
                {modelVersion?.trainedOn || 0} training examples
              </div>
            </div>
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <Button
              onClick={runReanalysis}
              disabled={isRunning || eligiblePhotos.length === 0}
              className="w-full"
              size="lg"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing... {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Re-analyze {eligiblePhotos.length} Photos
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="mt-4">
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCard
              label="Original Accuracy"
              value={`${results.summary.originalAccuracy}%`}
            />
            <SummaryCard
              label="New Accuracy"
              value={`${results.summary.newAccuracy}%`}
              variant={parseFloat(results.summary.newAccuracy) > parseFloat(results.summary.originalAccuracy) ? 'success' : 'destructive'}
            />
            <SummaryCard
              label="Change"
              value={`${parseFloat(results.summary.accuracyChange) > 0 ? '+' : ''}${results.summary.accuracyChange}%`}
              variant={parseFloat(results.summary.accuracyChange) > 0 ? 'success' : parseFloat(results.summary.accuracyChange) < 0 ? 'destructive' : 'default'}
            />
            <SummaryCard
              label="Improved"
              value={results.summary.improved}
              subtext="predictions"
              variant="success"
            />
            <SummaryCard
              label="Regressed"
              value={results.summary.regressed}
              subtext="predictions"
              variant="destructive"
            />
          </div>

          {/* Visual Comparison */}
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="font-medium mb-4">Accuracy Comparison</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Before</div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-muted-foreground flex items-center justify-end pr-3 text-muted text-sm font-medium"
                    style={{ width: `${results.summary.originalAccuracy}%` }}
                  >
                    {results.summary.originalAccuracy}%
                  </div>
                </div>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">After</div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full flex items-center justify-end pr-3 text-sm font-medium',
                      parseFloat(results.summary.newAccuracy) >= parseFloat(results.summary.originalAccuracy)
                        ? 'bg-success text-success-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    )}
                    style={{ width: `${results.summary.newAccuracy}%` }}
                  >
                    {results.summary.newAccuracy}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Details */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Detailed Results</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor="compare-mode" className="text-sm text-muted-foreground">
                Show comparison
              </Label>
              <Switch
                id="compare-mode"
                checked={compareMode}
                onCheckedChange={setCompareMode}
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Photo</TableHead>
                  <TableHead>Ground Truth</TableHead>
                  {compareMode && <TableHead>Original Prediction</TableHead>}
                  <TableHead>New Prediction</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Confidence Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.items.slice(0, 50).map((item, i) => (
                  <TableRow 
                    key={i}
                    className={cn(
                      item.error ? 'bg-destructive/5' :
                      item.improved ? 'bg-success/5' :
                      item.regressed ? 'bg-destructive/5' :
                      ''
                    )}
                  >
                    <TableCell className="font-mono text-xs">
                      {item.filename?.slice(0, 20) || item.photoId.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      {item.confirmedSubtype?.name || '—'}
                    </TableCell>
                    {compareMode && (
                      <TableCell>
                        <span className={item.originalWasCorrect ? 'text-success' : 'text-destructive'}>
                          {item.originalPrediction?.name || '—'}
                        </span>
                        <span className="text-muted-foreground ml-1">
                          ({item.originalConfidence}%)
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className={item.newIsCorrect ? 'text-success' : 'text-destructive'}>
                        {item.newPrediction?.name || '—'}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        ({item.newConfidence}%)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.error ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : item.improved ? (
                        <Badge className="bg-success text-success-foreground">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Improved
                        </Badge>
                      ) : item.regressed ? (
                        <Badge variant="destructive">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Regressed
                        </Badge>
                      ) : item.newIsCorrect ? (
                        <Badge variant="outline" className="border-success text-success">
                          <Check className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Minus className="w-3 h-3 mr-1" />
                          No change
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.confidenceChange !== undefined && (
                        <span className={cn(
                          item.confidenceChange > 0 ? 'text-success' :
                          item.confidenceChange < 0 ? 'text-destructive' :
                          'text-muted-foreground'
                        )}>
                          {item.confidenceChange > 0 ? '+' : ''}
                          {item.confidenceChange?.toFixed(0)}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {results.items.length > 50 && (
              <div className="p-4 text-center text-muted-foreground bg-muted/30">
                Showing 50 of {results.items.length} results
              </div>
            )}
          </div>

          {/* Export Results */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={exportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !isRunning && (
        <div className="p-12 text-center rounded-xl border-2 border-dashed border-border bg-muted/20">
          <FlaskConical className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Select photos and click Re-analyze to test model improvements
          </p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  subtext,
  variant = 'default' 
}: { 
  label: string; 
  value: string | number; 
  subtext?: string;
  variant?: 'default' | 'success' | 'destructive';
}) {
  const variantClasses = {
    default: 'text-foreground',
    success: 'text-success',
    destructive: 'text-destructive'
  };

  return (
    <div className="p-4 rounded-xl bg-muted/30 text-center">
      <div className={cn('text-2xl font-bold', variantClasses[variant])}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}
