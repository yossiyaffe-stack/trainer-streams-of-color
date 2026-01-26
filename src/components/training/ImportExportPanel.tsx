import { useState } from 'react';
import { BulkPhoto } from '@/types/training';
import { Subtype } from '@/data/subtypes';
import { Button } from '@/components/ui/button';
import { 
  exportToCSV, 
  exportToTSV, 
  exportSubtypeList, 
  parseCSVCorrections, 
  applyCorrections,
  ImportResult 
} from '@/lib/csv-utils';
import { Download, Upload, FileSpreadsheet, FileText, List, Loader2, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportExportPanelProps {
  photos: BulkPhoto[];
  subtypes: Subtype[];
  onImportCorrections: (result: ImportResult) => void;
}

export function ImportExportPanel({ photos, subtypes, onImportCorrections }: ImportExportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImporting(true);
    setImportResult(null);
    
    try {
      const text = await file.text();
      const corrections = parseCSVCorrections(text);
      const result = applyCorrections(photos, corrections, subtypes);
      
      setImportResult(result);
      onImportCorrections(result);
    } catch (error) {
      setImportResult({ 
        applied: 0, 
        notFound: [], 
        invalidSubtype: [], 
        error: error instanceof Error ? error.message : 'Import failed' 
      });
    }
    
    setImporting(false);
    e.target.value = '';
  };

  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <h3 className="font-serif text-lg font-semibold mb-4">Import / Export</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div>
          <h4 className="font-medium mb-3 text-foreground">Export for Review</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => exportToCSV(photos)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Full CSV
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => exportToTSV(photos)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export for Excel/Sheets
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => exportSubtypeList(subtypes)}
            >
              <List className="w-4 h-4 mr-2" />
              Export Subtype Reference
            </Button>
          </div>
        </div>
        
        {/* Import Section */}
        <div>
          <h4 className="font-medium mb-3 text-foreground">Import Corrections</h4>
          <label className={cn(
            'flex flex-col items-center justify-center',
            'w-full px-4 py-8 border-2 border-dashed rounded-xl',
            'cursor-pointer transition-colors',
            'hover:border-primary/50 hover:bg-primary/5',
            importing && 'pointer-events-none opacity-50'
          )}>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileImport}
              className="hidden"
            />
            {importing ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Drop CSV or click to upload</span>
              </>
            )}
          </label>
          
          {importResult && (
            <div className={cn(
              'mt-4 p-3 rounded-lg text-sm',
              importResult.error 
                ? 'bg-destructive/10 border border-destructive/30' 
                : 'bg-success/10 border border-success/30'
            )}>
              {importResult.error ? (
                <p className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {importResult.error}
                </p>
              ) : (
                <>
                  <p className="text-success flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Applied {importResult.applied} corrections
                  </p>
                  {importResult.notFound.length > 0 && (
                    <p className="text-warning mt-1">
                      ⚠ {importResult.notFound.length} photo IDs not found
                    </p>
                  )}
                  {importResult.invalidSubtype.length > 0 && (
                    <p className="text-warning mt-1">
                      ⚠ {importResult.invalidSubtype.length} invalid subtype names
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Google Sheets Instructions */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          Google Sheets Workflow
        </h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Click "Export for Excel/Sheets"</li>
          <li>Open the file in Google Sheets</li>
          <li>Review each row – add corrections in the "YOUR CORRECTION" column</li>
          <li>Download as CSV when done</li>
          <li>Import the CSV back here</li>
        </ol>
      </div>
    </div>
  );
}
