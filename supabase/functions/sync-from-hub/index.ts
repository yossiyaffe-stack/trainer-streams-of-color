import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The Hub API configuration
const DATA_HUB_URL = "https://ipcjabzvinmzyujsfige.supabase.co/functions/v1";
const HUB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY2phYnp2aW5tenl1anNmaWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzIyNjQsImV4cCI6MjA4NTAwODI2NH0.1BV0I67KqOhXZUE0BDxxHJnsUfnzidhdICPX3P2AeaU";

const hubHeaders = {
  "Content-Type": "application/json",
  "apikey": HUB_ANON_KEY,
  "Authorization": `Bearer ${HUB_ANON_KEY}`,
};

interface HubSubtype {
  id: string;
  name: string;
  slug: string;
  season: string;
  palette_effect?: string;
  description?: string;
  key_colors?: string[];
  avoid_colors?: string[];
  fabrics_perfect?: string[];
  fabrics_good?: string[];
  fabrics_avoid?: string[];
  prints?: string[];
  silhouettes?: string[];
  jewelry_metals?: string[];
  jewelry_stones?: string[];
  jewelry_styles?: string[];
  eras?: string[];
  artists?: string[];
  designers?: string[];
  makeup_lip?: string[];
  makeup_cheek?: string[];
  makeup_eye?: string[];
  best_for?: string[];
  time_period?: string;
}

interface HubColor {
  id: string;
  name: string;
  hex: string;
  category: string;
  season_affinity?: string[];
}

interface HubFabric {
  id: string;
  name: string;
  category: string;
  properties?: string[];
  season_suitability?: Record<string, string>;
}

interface HubMethodology {
  subtypes: HubSubtype[];
}

interface HubSeason {
  id: string;
  name: string;
  undertone?: string;
  description?: string;
  subtypes: HubSubtype[];
}

function extractSubtypes(payload: unknown): HubSubtype[] | null {
  if (!payload) return null;

  // HubSubtype[] or HubSeason[]
  if (Array.isArray(payload)) {
    // If it looks like subtypes
    if (payload.length === 0) return [];
    const first = payload[0] as any;
    if (typeof first?.slug === 'string' && typeof first?.season === 'string') {
      return payload as HubSubtype[];
    }
    // If it looks like seasons
    if (Array.isArray(first?.subtypes)) {
      return (payload as any[]).flatMap((s) =>
        (Array.isArray(s?.subtypes) ? s.subtypes : []).map((st: any) => ({
          ...st,
          // Some Hub responses omit subtype.season; infer from parent season.
          season: typeof st?.season === 'string' ? st.season : (s?.name ?? st?.season),
        }))
      );
    }
    return null;
  }

  // HubMethodology object
  const obj = payload as any;
  if (Array.isArray(obj.subtypes)) return obj.subtypes as HubSubtype[];
  if (Array.isArray(obj.seasons)) {
    return (obj.seasons as any[]).flatMap((s) =>
      (Array.isArray(s?.subtypes) ? s.subtypes : []).map((st: any) => ({
        ...st,
        season: typeof st?.season === 'string' ? st.season : (s?.name ?? st?.season),
      }))
    );
  }

  // Common wrappers
  if (Array.isArray(obj.data)) return extractSubtypes(obj.data);

  return null;
}

function normalizeSeason(season: unknown, subtypeName?: string): 'spring' | 'summer' | 'autumn' | 'winter' {
  const s = typeof season === 'string' ? season.trim().toLowerCase() : '';
  if (s.includes('spring')) return 'spring';
  if (s.includes('summer')) return 'summer';
  if (s.includes('autumn') || s.includes('fall')) return 'autumn';
  if (s.includes('winter')) return 'winter';
  
  // If season field doesn't contain a valid season, try to infer from subtype name
  if (subtypeName) {
    const name = subtypeName.toLowerCase();
    if (name.includes('spring')) return 'spring';
    if (name.includes('summer')) return 'summer';
    if (name.includes('autumn') || name.includes('fall')) return 'autumn';
    if (name.includes('winter')) return 'winter';
  }
  
  return 'winter'; // default fallback
}

function describePayload(payload: unknown): string {
  try {
    if (payload === null) return 'null';
    if (payload === undefined) return 'undefined';
    if (Array.isArray(payload)) {
      const first: any = payload[0];
      const firstKeys = first && typeof first === 'object' ? Object.keys(first).slice(0, 12) : [];
      return `array(len=${payload.length}, firstKeys=${JSON.stringify(firstKeys)})`;
    }
    if (typeof payload === 'object') {
      const obj: any = payload;
      const keys = Object.keys(obj).slice(0, 20);
      const nestedKeys: Record<string, string[]> = {};
      for (const k of ['data', 'result', 'methodology', 'payload']) {
        if (obj?.[k] && typeof obj[k] === 'object') {
          nestedKeys[k] = Object.keys(obj[k]).slice(0, 12);
        }
      }
      return `object(keys=${JSON.stringify(keys)}, nestedKeys=${JSON.stringify(nestedKeys)})`;
    }
    return typeof payload;
  } catch {
    return 'uninspectable';
  }
}

async function fetchFromHub<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${DATA_HUB_URL}${endpoint}`, {
      method: 'GET',
      headers: hubHeaders,
    });
    if (!res.ok) {
      console.error(`Hub API error [${endpoint}]:`, res.status, await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Hub API error [${endpoint}]:`, err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { syncType = 'all' } = await req.json().catch(() => ({}));
    
    const results: Record<string, { synced: number; errors: string[] }> = {};

    // Sync Subtypes
    if (syncType === 'all' || syncType === 'subtypes') {
      console.log('Fetching subtypes from Hub...');
      // Prefer /seasons so we can reliably infer each subtype's season (some Hub payloads omit subtype.season)
      const seasonsPayload = await fetchFromHub<HubSeason[] | unknown>('/seasons');
      let hubSubtypes = extractSubtypes(seasonsPayload);

      // Fallback to full methodology payload
      if (!hubSubtypes) {
        console.log(`Hub /seasons payload did not include subtypes: ${describePayload(seasonsPayload)}; trying /methodology`);
        const methodologyPayload = await fetchFromHub<HubMethodology | HubSeason[] | unknown>('/methodology');
        hubSubtypes = extractSubtypes(methodologyPayload);

        if (!hubSubtypes) {
          console.log(`Hub /methodology payload also did not include subtypes: ${describePayload(methodologyPayload)}`);
        }
      }
      
      if (hubSubtypes && Array.isArray(hubSubtypes)) {
        console.log(`Received ${hubSubtypes.length} subtypes from Hub`);
        const errors: string[] = [];
        let synced = 0;

        for (const hubSubtype of hubSubtypes) {
          try {
            // Map Hub subtype to local schema
            const localSubtype: Record<string, unknown> = {
              name: hubSubtype.name,
              slug: hubSubtype.slug,
              season: normalizeSeason(hubSubtype.season, hubSubtype.name),
              palette_effect: hubSubtype.palette_effect ?? undefined,
              time_period: hubSubtype.time_period ?? undefined,
              is_active: true,
            };

            // Only overwrite description when Hub provides a non-empty value
            if (typeof hubSubtype.description === 'string' && hubSubtype.description.trim()) {
              localSubtype.description = hubSubtype.description.trim();
            }

            // Only overwrite arrays when Hub provides them (avoid wiping local data)
            const maybeArrays: Array<[keyof HubSubtype, string]> = [
              ['key_colors', 'key_colors'],
              ['avoid_colors', 'avoid_colors'],
              ['fabrics_perfect', 'fabrics_perfect'],
              ['fabrics_good', 'fabrics_good'],
              ['fabrics_avoid', 'fabrics_avoid'],
              ['prints', 'prints'],
              ['silhouettes', 'silhouettes'],
              ['jewelry_metals', 'jewelry_metals'],
              ['jewelry_stones', 'jewelry_stones'],
              ['jewelry_styles', 'jewelry_styles'],
              ['eras', 'eras'],
              ['artists', 'artists'],
              ['designers', 'designers'],
              ['makeup_lip', 'makeup_lip'],
              ['makeup_cheek', 'makeup_cheek'],
              ['makeup_eye', 'makeup_eye'],
              ['best_for', 'best_for'],
            ];

            for (const [hubKey, localKey] of maybeArrays) {
              const v = (hubSubtype as any)[hubKey];
              if (Array.isArray(v)) localSubtype[localKey] = v;
            }

            // Upsert by slug (unique identifier)
            const { error } = await supabase
              .from('subtypes')
              .upsert(localSubtype, { 
                onConflict: 'slug',
                ignoreDuplicates: false 
              });

            if (error) {
              console.error(`Error upserting subtype ${hubSubtype.slug}:`, error);
              errors.push(`${hubSubtype.slug}: ${error.message}`);
            } else {
              synced++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${hubSubtype.slug}: ${errMsg}`);
          }
        }

        results.subtypes = { synced, errors };
        console.log(`Synced ${synced} subtypes, ${errors.length} errors`);
      } else {
        results.subtypes = {
          synced: 0,
          errors: [
            'Failed to fetch subtypes from Hub (see function logs for payload diagnostics)',
          ],
        };
      }
    }

    // Sync Colors to vocabulary_terms
    if (syncType === 'all' || syncType === 'colors') {
      console.log('Fetching colors from Hub...');
      const hubColors = await fetchFromHub<HubColor[]>('/colors');
      
      if (hubColors && Array.isArray(hubColors)) {
        console.log(`Received ${hubColors.length} colors from Hub`);
        const errors: string[] = [];
        let synced = 0;

        for (const color of hubColors) {
          try {
            const vocabTerm = {
              term: color.name.toLowerCase().replace(/\s+/g, '_'),
              display_name: color.name,
              category: 'color',
              hex_code: color.hex,
              description: color.category,
              related_terms: color.season_affinity || [],
            };

            const { error } = await supabase
              .from('vocabulary_terms')
              .upsert(vocabTerm, {
                onConflict: 'term,category',
                ignoreDuplicates: false
              });

            if (error) {
              errors.push(`${color.name}: ${error.message}`);
            } else {
              synced++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${color.name}: ${errMsg}`);
          }
        }

        results.colors = { synced, errors };
      } else {
        results.colors = { synced: 0, errors: ['Failed to fetch colors from Hub'] };
      }
    }

    // Sync Fabrics to vocabulary_terms
    if (syncType === 'all' || syncType === 'fabrics') {
      console.log('Fetching fabrics from Hub...');
      const hubFabrics = await fetchFromHub<HubFabric[]>('/fabrics');
      
      if (hubFabrics && Array.isArray(hubFabrics)) {
        console.log(`Received ${hubFabrics.length} fabrics from Hub`);
        const errors: string[] = [];
        let synced = 0;

        for (const fabric of hubFabrics) {
          try {
            const vocabTerm = {
              term: fabric.name.toLowerCase().replace(/\s+/g, '_'),
              display_name: fabric.name,
              category: 'fabric',
              description: fabric.category,
              related_terms: fabric.properties || [],
            };

            const { error } = await supabase
              .from('vocabulary_terms')
              .upsert(vocabTerm, {
                onConflict: 'term,category',
                ignoreDuplicates: false
              });

            if (error) {
              errors.push(`${fabric.name}: ${error.message}`);
            } else {
              synced++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${fabric.name}: ${errMsg}`);
          }
        }

        results.fabrics = { synced, errors };
      } else {
        results.fabrics = { synced: 0, errors: ['Failed to fetch fabrics from Hub'] };
      }
    }

    // Sync Artists to vocabulary_terms
    if (syncType === 'all' || syncType === 'artists') {
      console.log('Fetching artists from Hub...');
      const hubArtists = await fetchFromHub<{ id: string; name: string; slug: string; era?: string; style?: string }[]>('/artists');
      
      if (hubArtists && Array.isArray(hubArtists)) {
        console.log(`Received ${hubArtists.length} artists from Hub`);
        const errors: string[] = [];
        let synced = 0;

        for (const artist of hubArtists) {
          try {
            const vocabTerm = {
              term: artist.slug || artist.name.toLowerCase().replace(/\s+/g, '_'),
              display_name: artist.name,
              category: 'artist',
              description: [artist.era, artist.style].filter(Boolean).join(' - ') || null,
            };

            const { error } = await supabase
              .from('vocabulary_terms')
              .upsert(vocabTerm, {
                onConflict: 'term,category',
                ignoreDuplicates: false
              });

            if (error) {
              errors.push(`${artist.name}: ${error.message}`);
            } else {
              synced++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${artist.name}: ${errMsg}`);
          }
        }

        results.artists = { synced, errors };
      } else {
        results.artists = { synced: 0, errors: ['Failed to fetch artists from Hub'] };
      }
    }

    // Sync Eras to vocabulary_terms
    if (syncType === 'all' || syncType === 'eras') {
      console.log('Fetching eras from Hub...');
      const hubEras = await fetchFromHub<{ id: string; name: string; slug: string; period?: string }[]>('/eras');
      
      if (hubEras && Array.isArray(hubEras)) {
        console.log(`Received ${hubEras.length} eras from Hub`);
        const errors: string[] = [];
        let synced = 0;

        for (const era of hubEras) {
          try {
            const vocabTerm = {
              term: era.slug || era.name.toLowerCase().replace(/\s+/g, '_'),
              display_name: era.name,
              category: 'era',
              description: era.period || null,
            };

            const { error } = await supabase
              .from('vocabulary_terms')
              .upsert(vocabTerm, {
                onConflict: 'term,category',
                ignoreDuplicates: false
              });

            if (error) {
              errors.push(`${era.name}: ${error.message}`);
            } else {
              synced++;
            }
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            errors.push(`${era.name}: ${errMsg}`);
          }
        }

        results.eras = { synced, errors };
      } else {
        results.eras = { synced: 0, errors: ['Failed to fetch eras from Hub'] };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Sync completed',
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sync error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({
      success: false,
      error: errMsg,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
