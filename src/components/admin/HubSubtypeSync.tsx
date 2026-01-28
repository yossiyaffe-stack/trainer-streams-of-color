import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getSeasons, checkHubConnection, type HubSubtype } from '@/lib/dataHubApi';
import { Loader2, RefreshCw, CheckCircle2, CloudOff, Cloud } from 'lucide-react';

export function HubSubtypeSync() {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [hubConnected, setHubConnected] = useState<boolean | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStats, setSyncStats] = useState<{ added: number; updated: number; total: number } | null>(null);

  // Check Hub connection on mount
  useEffect(() => {
    checkHubConnection().then(setHubConnected);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncStats(null);

    try {
      // Fetch all seasons with subtypes from The Hub
      const seasons = await getSeasons();
      
      if (!seasons || seasons.length === 0) {
        toast({
          title: 'Sync Failed',
          description: 'Could not fetch subtypes from The Hub. Please check the connection.',
          variant: 'destructive',
        });
        setSyncing(false);
        return;
      }

      // Flatten all subtypes from all seasons
      const hubSubtypes: HubSubtype[] = seasons.flatMap(season => season.subtypes || []);

      if (hubSubtypes.length === 0) {
        toast({
          title: 'No Subtypes Found',
          description: 'The Hub returned no subtypes to sync.',
          variant: 'destructive',
        });
        setSyncing(false);
        return;
      }

      let added = 0;
      let updated = 0;

      for (const subtype of hubSubtypes) {
        // Check if already exists by slug
        const { data: existing } = await supabase
          .from('subtypes')
          .select('id, name')
          .eq('slug', subtype.slug)
          .maybeSingle();

        if (existing) {
          // Update existing record if name changed
          if (existing.name !== subtype.name) {
            await supabase
              .from('subtypes')
              .update({
                name: subtype.name,
                season: subtype.season.toLowerCase(),
                palette_effect: subtype.palette_effect || null,
                description: subtype.description || null,
                key_colors: subtype.key_colors || [],
                avoid_colors: subtype.avoid_colors || [],
                fabrics_perfect: subtype.fabrics_perfect || [],
                fabrics_good: subtype.fabrics_good || [],
                fabrics_avoid: subtype.fabrics_avoid || [],
              })
              .eq('id', existing.id);
            updated++;
          }
        } else {
          // Insert new subtype
          const { error } = await supabase
            .from('subtypes')
            .insert({
              name: subtype.name,
              slug: subtype.slug,
              season: subtype.season.toLowerCase(),
              palette_effect: subtype.palette_effect || null,
              description: subtype.description || null,
              key_colors: subtype.key_colors || [],
              avoid_colors: subtype.avoid_colors || [],
              fabrics_perfect: subtype.fabrics_perfect || [],
              fabrics_good: subtype.fabrics_good || [],
              fabrics_avoid: subtype.fabrics_avoid || [],
              is_active: true,
            });

          if (!error) {
            added++;
          }
        }

        // Small delay to avoid overwhelming the database
        await new Promise(r => setTimeout(r, 50));
      }

      setSyncStats({ added, updated, total: hubSubtypes.length });
      setLastSync(new Date());

      toast({
        title: 'Sync Complete',
        description: `Synced ${hubSubtypes.length} subtypes from The Hub (${added} added, ${updated} updated)`,
      });
    } catch (err) {
      console.error('Hub sync error:', err);
      toast({
        title: 'Sync Error',
        description: 'An error occurred while syncing with The Hub',
        variant: 'destructive',
      });
    }

    setSyncing(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Sync from The Hub
        </CardTitle>
        <CardDescription>
          Automatically sync all seasonal subtypes from the central Data Oasis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          {hubConnected === null ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : hubConnected ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <CloudOff className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm">
            {hubConnected === null
              ? 'Checking Hub connection...'
              : hubConnected
              ? 'Connected to The Hub'
              : 'Unable to reach The Hub'}
          </span>
          {hubConnected && (
            <Badge variant="secondary" className="ml-auto">
              Live
            </Badge>
          )}
        </div>

        {/* Sync Button */}
        <Button
          onClick={handleSync}
          disabled={syncing || hubConnected === false}
          className="w-full gap-2"
        >
          {syncing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Syncing subtypes...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Sync Subtypes from Hub
            </>
          )}
        </Button>

        {/* Sync Results */}
        {syncStats && (
          <div className="text-sm text-center space-y-1">
            <p className="text-muted-foreground">
              ✓ {syncStats.total} subtypes synced
            </p>
            <div className="flex justify-center gap-4">
              <span className="text-green-600">{syncStats.added} added</span>
              <span className="text-blue-600">{syncStats.updated} updated</span>
            </div>
          </div>
        )}

        {lastSync && (
          <p className="text-xs text-muted-foreground text-center">
            Last synced: {lastSync.toLocaleTimeString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
