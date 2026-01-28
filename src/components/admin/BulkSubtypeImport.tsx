import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Plus } from 'lucide-react';

const WINTER_SUBTYPES = [
  'Starlit Winter',
  'Moonlit Winter',
  'Crystal Winter',
  'Stained Glass Winter',
  'Mediterranean Winter',
  'Biblical Winter',
  'Queen Esther Winter',
  'Multicolored Winter',
  'Tapestry Winter',
  'Ornamental Winter',
  'Early Winter',
  'Dynamic Winter',
  'Silver Winter',
  'Sleeping Beauty Winter',
  'Snow White Winter',
  'Fairy Tale Winter',
  'Winter Rose',
  'Romantic Winter',
  'Chaggal Winter',
  'Van Gogh Winter',
  'Rose Gold Winter',
  'Byzantine Winter',
  'Spanish Princess Winter',
  'Baroque Winter',
  'Emerald Winter',
  'Sapphire Winter',
  'Jewel Tone Winter',
];

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
};

export function BulkSubtypeImport() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);

  const handleImport = async () => {
    setImporting(true);
    setImported([]);
    setSkipped([]);

    for (const name of WINTER_SUBTYPES) {
      const slug = generateSlug(name);
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('subtypes')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        setSkipped(prev => [...prev, name]);
        continue;
      }

      const { error } = await supabase
        .from('subtypes')
        .insert({
          name,
          slug,
          season: 'winter',
          is_active: true,
        });

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to add "${name}": ${error.message}`,
          variant: 'destructive',
        });
      } else {
        setImported(prev => [...prev, name]);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(r => setTimeout(r, 100));
    }

    setImporting(false);
    toast({
      title: 'Import Complete',
      description: `Added ${imported.length} subtypes, skipped ${skipped.length} duplicates`,
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          ❄️ Winter Subtypes Import
        </CardTitle>
        <CardDescription>
          Import {WINTER_SUBTYPES.length} Winter palette names into the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto p-2 bg-muted/50 rounded-lg">
          {WINTER_SUBTYPES.map(name => (
            <div 
              key={name} 
              className={`flex items-center gap-1.5 ${
                imported.includes(name) ? 'text-green-600' : 
                skipped.includes(name) ? 'text-muted-foreground line-through' : ''
              }`}
            >
              {imported.includes(name) && <CheckCircle2 className="w-3 h-3" />}
              {name}
            </div>
          ))}
        </div>

        <Button 
          onClick={handleImport} 
          disabled={importing}
          className="w-full gap-2"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing... ({imported.length}/{WINTER_SUBTYPES.length})
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Import All Winter Subtypes
            </>
          )}
        </Button>

        {(imported.length > 0 || skipped.length > 0) && (
          <p className="text-sm text-muted-foreground text-center">
            ✓ {imported.length} added • {skipped.length} already existed
          </p>
        )}
      </CardContent>
    </Card>
  );
}
