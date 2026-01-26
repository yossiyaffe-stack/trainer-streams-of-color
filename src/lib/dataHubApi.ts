// Data Hub API - Connection to the central methodology hub
// This allows syncing training conclusions with The Hub

const DATA_HUB_URL = "https://ipcjabzvinmzyujsfige.supabase.co/functions/v1";

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY2phYnp2aW5tenl1anNmaWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzIyNjQsImV4cCI6MjA4NTAwODI2NH0.1BV0I67KqOhXZUE0BDxxHJnsUfnzidhdICPX3P2AeaU";

const headers = {
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
};

// ============ TYPES ============

export interface HubMethodology {
  seasons: HubSeason[];
  subtypes: HubSubtype[];
  colors: HubColor[];
  fabrics: HubFabric[];
  artists: string[];
  eras: string[];
}

export interface HubSeason {
  id: string;
  name: string;
  description: string;
}

export interface HubSubtype {
  id: string;
  name: string;
  slug: string;
  season: string;
  palette_effect: string;
  key_colors: string[];
  avoid_colors: string[];
  fabrics_perfect: string[];
  fabrics_good: string[];
  fabrics_avoid: string[];
}

export interface HubColor {
  id: string;
  name: string;
  hex: string;
  category: string;
  season_affinity: string[];
}

export interface HubFabric {
  id: string;
  name: string;
  properties: string[];
  season_suitability: Record<string, string>;
}

export interface FaceConclusion {
  source: 'training_website';
  face_image_id: string;
  storage_path: string;
  confirmed_season: string;
  confirmed_subtype: string;
  skin_hex: string | null;
  skin_tone_name: string | null;
  undertone: string | null;
  eye_hex: string | null;
  eye_color_name: string | null;
  hair_hex: string | null;
  hair_color_name: string | null;
  contrast_level: string | null;
  depth: string | null;
  verified_by: string;
  verified_at: string;
  notes?: string;
}

export interface PaintingConclusion {
  source: 'training_website';
  painting_id: string;
  image_url: string;
  title: string | null;
  artist: string | null;
  era: string | null;
  fabrics: string[];
  silhouette: string | null;
  color_mood: string | null;
  palette_effect: string | null;
  suggested_season: string | null;
  linked_subtypes: string[];
  reviewed_by: string;
  reviewed_at: string;
  notes?: string;
}

// ============ READ OPERATIONS ============

// Get all methodology data (seasons, subtypes, colors, fabrics, artists, eras)
export async function getMethodology(): Promise<HubMethodology | null> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/get-methodology`, { 
      method: 'GET',
      headers 
    });
    if (!res.ok) {
      console.error('Failed to fetch methodology:', res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Error fetching methodology:', err);
    return null;
  }
}

// Get specific subtype details
export async function getSubtype(slug: string): Promise<HubSubtype | null> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/get-subtype?slug=${encodeURIComponent(slug)}`, { 
      method: 'GET',
      headers 
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Error fetching subtype:', err);
    return null;
  }
}

// ============ WRITE OPERATIONS ============

// Push a verified face conclusion to The Hub
export async function pushFaceConclusion(conclusion: FaceConclusion): Promise<boolean> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/receive-face-conclusion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(conclusion),
    });
    if (!res.ok) {
      console.error('Failed to push face conclusion:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error pushing face conclusion:', err);
    return false;
  }
}

// Push a verified painting conclusion to The Hub
export async function pushPaintingConclusion(conclusion: PaintingConclusion): Promise<boolean> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/receive-painting-conclusion`, {
      method: 'POST',
      headers,
      body: JSON.stringify(conclusion),
    });
    if (!res.ok) {
      console.error('Failed to push painting conclusion:', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error pushing painting conclusion:', err);
    return false;
  }
}

// Batch push multiple conclusions
export async function pushBatchConclusions(
  faces: FaceConclusion[],
  paintings: PaintingConclusion[]
): Promise<{ facesSuccess: number; paintingsSuccess: number }> {
  let facesSuccess = 0;
  let paintingsSuccess = 0;

  for (const face of faces) {
    if (await pushFaceConclusion(face)) facesSuccess++;
  }

  for (const painting of paintings) {
    if (await pushPaintingConclusion(painting)) paintingsSuccess++;
  }

  return { facesSuccess, paintingsSuccess };
}

// ============ SYNC STATUS ============

// Check connection to The Hub
export async function checkHubConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/health`, { 
      method: 'GET',
      headers 
    });
    return res.ok;
  } catch {
    return false;
  }
}
