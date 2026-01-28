// Data Hub API - Connection to the central methodology hub
// This allows syncing training conclusions with The Hub

const DATA_HUB_URL = "https://ipcjabzvinmzyujsfige.supabase.co/functions/v1";

const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwY2phYnp2aW5tenl1anNmaWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MzIyNjQsImV4cCI6MjA4NTAwODI2NH0.1BV0I67KqOhXZUE0BDxxHJnsUfnzidhdICPX3P2AeaU";

const headers = {
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
};

// ============ HELPER ============

async function hubFetch<T>(endpoint: string, params?: Record<string, string>): Promise<T | null> {
  try {
    const url = new URL(`${DATA_HUB_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }
    const res = await fetch(url.toString(), { method: 'GET', headers });
    if (!res.ok) {
      console.error(`Hub API error [${endpoint}]:`, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Hub API error [${endpoint}]:`, err);
    return null;
  }
}

// ============ TYPES ============

export interface HubSeason {
  id: string;
  name: string;
  undertone: string;
  description: string;
  subtypes: HubSubtype[];
}

export interface HubSubtype {
  id: string;
  name: string;
  slug: string;
  season: string;
  palette_effect: string;
  description?: string;
  key_colors?: string[];
  avoid_colors?: string[];
  fabrics_perfect?: string[];
  fabrics_good?: string[];
  fabrics_avoid?: string[];
}

export interface HubColor {
  id: string;
  name: string;
  hex: string;
  category: string;
  season_affinity?: string[];
}

export interface HubArtist {
  id: string;
  name: string;
  slug: string;
  era?: string;
  style?: string;
  seasons?: string[];
}

export interface HubDesigner {
  id: string;
  name: string;
  slug: string;
  price_tier?: string;
  aesthetic?: string;
  seasons?: string[];
}

export interface HubFabric {
  id: string;
  name: string;
  category: string;
  properties?: string[];
  season_suitability?: Record<string, string>;
}

export interface HubGemstone {
  id: string;
  name: string;
  color_hex?: string;
  seasons?: string[];
  properties?: string[];
}

export interface HubMetal {
  id: string;
  name: string;
  warmth: string;
  hex?: string;
  seasons?: string[];
}

export interface HubEra {
  id: string;
  name: string;
  slug: string;
  period?: string;
  characteristics?: string[];
}

export interface HubPrint {
  id: string;
  name: string;
  category: string;
  scale?: string;
  seasons?: string[];
}

export interface HubMakeup {
  subtype_slug: string;
  lip_colors?: string[];
  cheek_colors?: string[];
  eye_colors?: string[];
  recommendations?: string[];
}

export interface HubBodyType {
  id: string;
  name: string;
  system: string;
  description?: string;
  recommendations?: string[];
}

export interface HubPainting {
  id: string;
  title: string;
  artist?: string;
  era?: string;
  season?: string;
  image_url?: string;
  palette_effect?: string;
}

export interface HubSephirot {
  name: string;
  hebrew_name?: string;
  colors?: string[];
  attributes?: string[];
}

export interface HubMethodology {
  seasons: HubSeason[];
  subtypes: HubSubtype[];
  colors: HubColor[];
  fabrics: HubFabric[];
  artists: string[];
  eras: string[];
}

// ============ READ OPERATIONS ============

// Complete methodology data
export async function getMethodology(): Promise<HubMethodology | null> {
  return hubFetch<HubMethodology>('/methodology');
}

// Seasons with subtypes, optionally filtered by undertone
export async function getSeasons(undertone?: 'warm' | 'cool' | 'neutral'): Promise<HubSeason[] | null> {
  return hubFetch<HubSeason[]>('/seasons', undertone ? { undertone } : undefined);
}

// Single subtype by slug
export async function getSubtype(slug: string): Promise<HubSubtype | null> {
  return hubFetch<HubSubtype>('/subtype', { slug });
}

// Colors, optionally filtered by category
export async function getColors(category?: string): Promise<HubColor[] | null> {
  return hubFetch<HubColor[]>('/colors', category ? { category } : undefined);
}

// Artists, optionally filtered by slug
export async function getArtists(slug?: string): Promise<HubArtist[] | null> {
  return hubFetch<HubArtist[]>('/artists', slug ? { slug } : undefined);
}

// Designers, optionally filtered by price tier
export async function getDesigners(priceTier?: string): Promise<HubDesigner[] | null> {
  return hubFetch<HubDesigner[]>('/designers', priceTier ? { price_tier: priceTier } : undefined);
}

// Fabrics, optionally filtered by category
export async function getFabrics(category?: string): Promise<HubFabric[] | null> {
  return hubFetch<HubFabric[]>('/fabrics', category ? { category } : undefined);
}

// Gemstones, optionally filtered by season
export async function getGemstones(season?: string): Promise<HubGemstone[] | null> {
  return hubFetch<HubGemstone[]>('/gemstones', season ? { season } : undefined);
}

// Metals, optionally filtered by warmth
export async function getMetals(warmth?: 'warm' | 'cool' | 'neutral'): Promise<HubMetal[] | null> {
  return hubFetch<HubMetal[]>('/metals', warmth ? { warmth } : undefined);
}

// Historical eras, optionally filtered by slug
export async function getEras(slug?: string): Promise<HubEra[] | null> {
  return hubFetch<HubEra[]>('/eras', slug ? { slug } : undefined);
}

// Prints, optionally filtered by category
export async function getPrints(category?: string): Promise<HubPrint[] | null> {
  return hubFetch<HubPrint[]>('/prints', category ? { category } : undefined);
}

// Makeup recommendations by subtype
export async function getMakeup(subtypeSlug: string): Promise<HubMakeup | null> {
  return hubFetch<HubMakeup>('/makeup', { subtype_slug: subtypeSlug });
}

// Body types, optionally filtered by system
export async function getBodyTypes(system?: string): Promise<HubBodyType[] | null> {
  return hubFetch<HubBodyType[]>('/body-types', system ? { system } : undefined);
}

// Masterpiece paintings, optionally filtered by season
export async function getPaintings(season?: string): Promise<HubPainting[] | null> {
  return hubFetch<HubPainting[]>('/paintings', season ? { season } : undefined);
}

// Sephirot colors and attributes
export async function getSephirot(): Promise<HubSephirot[] | null> {
  return hubFetch<HubSephirot[]>('/sephirot');
}

// ============ WRITE OPERATIONS ============

export interface FaceConclusion {
  source: 'training_website';
  purpose: 'methodology_training';
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
  had_ai_disagreement?: boolean;
  disagreement_reason?: string;
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

// ============ CONNECTION CHECK ============

export async function checkHubConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${DATA_HUB_URL}/health`, { method: 'GET', headers });
    return res.ok;
  } catch {
    return false;
  }
}
