import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type SyncType = 'all' | 'subtypes' | 'colors' | 'fabrics' | 'artists' | 'eras';

interface SyncResult {
  synced: number;
  errors: string[];
}

interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  results?: Record<string, SyncResult>;
}

export function useHubSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResponse | null>(null);

  const syncFromHub = async (syncType: SyncType = 'all'): Promise<SyncResponse> => {
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-from-hub', {
        body: { syncType },
      });

      if (error) {
        const errorResponse: SyncResponse = {
          success: false,
          error: error.message,
        };
        setLastSyncResult(errorResponse);
        toast({
          title: 'Sync Failed',
          description: error.message,
          variant: 'destructive',
        });
        return errorResponse;
      }

      const response = data as SyncResponse;
      setLastSyncResult(response);

      if (response.success && response.results) {
        const totalSynced = Object.values(response.results).reduce(
          (sum, r) => sum + r.synced, 
          0
        );
        const totalErrors = Object.values(response.results).reduce(
          (sum, r) => sum + r.errors.length, 
          0
        );

        toast({
          title: 'Sync Complete',
          description: `Synced ${totalSynced} items${totalErrors > 0 ? `, ${totalErrors} errors` : ''}`,
          variant: totalErrors > 0 ? 'default' : 'default',
        });
      }

      return response;
    } catch (err) {
      const errorResponse: SyncResponse = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
      setLastSyncResult(errorResponse);
      toast({
        title: 'Sync Failed',
        description: errorResponse.error,
        variant: 'destructive',
      });
      return errorResponse;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncFromHub,
    isSyncing,
    lastSyncResult,
  };
}
