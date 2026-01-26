import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  museum: string;
  department?: string;
  medium?: string;
  isPublicDomain: boolean;
}

// Art Institute of Chicago
async function searchArtInstitute(query: string, limit: number = 20): Promise<MuseumArtwork[]> {
  const searchUrl = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&query[term][is_public_domain]=true&fields=id,title,artist_display,date_display,image_id,department_title,medium_display&limit=${limit}`;
  
  const response = await fetch(searchUrl, {
    headers: { 'AIC-User-Agent': 'StreamsOfColor/1.0 (color-analysis-training)' }
  });
  
  if (!response.ok) throw new Error(`AIC API error: ${response.status}`);
  
  const data = await response.json();
  
  return data.data
    .filter((item: any) => item.image_id)
    .map((item: any) => ({
      id: `aic-${item.id}`,
      title: item.title || 'Untitled',
      artist: item.artist_display || 'Unknown',
      date: item.date_display || '',
      imageUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/843,/0/default.jpg`,
      thumbnailUrl: `https://www.artic.edu/iiif/2/${item.image_id}/full/200,/0/default.jpg`,
      museum: 'Art Institute of Chicago',
      department: item.department_title,
      medium: item.medium_display,
      isPublicDomain: true
    }));
}

// Metropolitan Museum of Art
async function searchMetMuseum(query: string, limit: number = 20): Promise<MuseumArtwork[]> {
  // First get object IDs
  const searchUrl = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`;
  
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) throw new Error(`Met API search error: ${searchResponse.status}`);
  
  const searchData = await searchResponse.json();
  const objectIds = (searchData.objectIDs || []).slice(0, limit);
  
  if (objectIds.length === 0) return [];
  
  // Fetch details for each object (with rate limiting)
  const artworks: MuseumArtwork[] = [];
  
  for (const id of objectIds) {
    try {
      const detailUrl = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;
      const detailResponse = await fetch(detailUrl);
      
      if (detailResponse.ok) {
        const item = await detailResponse.json();
        
        if (item.primaryImage && item.isPublicDomain) {
          artworks.push({
            id: `met-${item.objectID}`,
            title: item.title || 'Untitled',
            artist: item.artistDisplayName || item.culture || 'Unknown',
            date: item.objectDate || '',
            imageUrl: item.primaryImage,
            thumbnailUrl: item.primaryImageSmall || item.primaryImage,
            museum: 'Metropolitan Museum of Art',
            department: item.department,
            medium: item.medium,
            isPublicDomain: true
          });
        }
      }
      
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 50));
    } catch (e) {
      console.error(`Failed to fetch Met object ${id}:`, e);
    }
  }
  
  return artworks;
}

// Cleveland Museum of Art (No API key needed!)
async function searchCleveland(query: string, limit: number = 20): Promise<MuseumArtwork[]> {
  const searchUrl = `https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(query)}&has_image=1&limit=${limit}`;
  
  const response = await fetch(searchUrl);
  if (!response.ok) throw new Error(`Cleveland API error: ${response.status}`);
  
  const data = await response.json();
  
  return (data.data || [])
    .filter((item: any) => item.images?.web?.url)
    .map((item: any) => ({
      id: `cma-${item.id}`,
      title: item.title || 'Untitled',
      artist: item.creators?.[0]?.description || item.culture?.[0] || 'Unknown',
      date: item.creation_date || '',
      imageUrl: item.images.web.url,
      thumbnailUrl: item.images.web.url.replace('/full/', '/!400,400/'),
      museum: 'Cleveland Museum of Art',
      department: item.department,
      medium: item.technique,
      isPublicDomain: true
    }));
}

// Featured collections for quick browsing
const FEATURED_SEARCHES = {
  portraits: ['portrait woman', 'portrait lady', 'portrait duchess'],
  gowns: ['evening gown', 'ball gown', 'dress formal'],
  renaissance: ['renaissance portrait', 'italian renaissance', 'flemish portrait'],
  romantic: ['romantic era portrait', 'pre-raphaelite', 'victorian portrait'],
  impressionist: ['impressionist portrait', 'monet woman', 'renoir portrait'],
  jewelry: ['woman pearls', 'woman jewels', 'noblewoman portrait'],
  fabrics: ['velvet dress', 'silk gown', 'satin portrait'],
  seasons: {
    spring: ['spring flowers woman', 'pastel portrait', 'garden woman'],
    summer: ['summer portrait', 'bright colors woman', 'outdoor portrait woman'],
    autumn: ['autumn colors portrait', 'warm tones woman', 'harvest portrait'],
    winter: ['winter portrait', 'deep colors woman', 'rich velvet portrait']
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, query, museum, limit = 20, category } = await req.json();

    let results: MuseumArtwork[] = [];

    if (action === 'search') {
      const searchQuery = query || 'portrait woman';
      
      if (museum === 'aic' || museum === 'all') {
        const aicResults = await searchArtInstitute(searchQuery, limit);
        results = [...results, ...aicResults];
      }
      
      if (museum === 'met' || museum === 'all') {
        const metResults = await searchMetMuseum(searchQuery, limit);
        results = [...results, ...metResults];
      }
      
      if (museum === 'cma' || museum === 'all') {
        const cmaResults = await searchCleveland(searchQuery, limit);
        results = [...results, ...cmaResults];
      }
    } 
    else if (action === 'featured') {
      // Return featured search suggestions
      return new Response(
        JSON.stringify({ featured: FEATURED_SEARCHES }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (action === 'category') {
      // Search by category
      const searches = (FEATURED_SEARCHES as any)[category] || [];
      const queries = Array.isArray(searches) ? searches : [];
      
      for (const q of queries.slice(0, 2)) {
        const aicResults = await searchArtInstitute(q, Math.floor(limit / 2));
        results = [...results, ...aicResults];
      }
    }

    return new Response(
      JSON.stringify({ 
        results, 
        count: results.length,
        query: query || category 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("fetch-museum-art error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
