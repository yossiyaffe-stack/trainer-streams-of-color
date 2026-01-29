import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Authentication helper - validates JWT and returns user info
async function authenticateRequest(req: Request): Promise<{ user: { id: string; email?: string } } | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data?.user) {
      console.error("Auth error:", error?.message);
      return null;
    }
    return { user: data.user };
  } catch (err) {
    console.error("Auth exception:", err);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require authentication for methodology export
  const auth = await authenticateRequest(req);
  if (!auth) {
    return new Response(
      JSON.stringify({ error: "Authentication required" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch subtypes
    const { data: subtypes, error: subtypesError } = await supabase
      .from("subtypes")
      .select("*")
      .eq("is_active", true)
      .order("season", { ascending: true })
      .order("display_order", { ascending: true });

    if (subtypesError) throw subtypesError;

    // Fetch vocabulary by category
    const { data: vocabulary, error: vocabError } = await supabase
      .from("vocabulary_terms")
      .select("*")
      .order("category", { ascending: true });

    if (vocabError) throw vocabError;

    // Group vocabulary by category
    const colors = vocabulary?.filter(v => v.category === "color") || [];
    const fabrics = vocabulary?.filter(v => v.category === "fabric") || [];
    const artists = vocabulary?.filter(v => v.category === "artist") || [];
    const eras = vocabulary?.filter(v => v.category === "era") || [];

    // Fetch verified training samples with full details (expert_verified or nechama_verified)
    const { data: trainingSamples, error: samplesError } = await supabase
      .from("face_images")
      .select(`
        id,
        storage_path,
        thumbnail_path,
        source,
        color_labels (
          confirmed_season,
          confirmed_subtype,
          label_status,
          labeled_by,
          notes,
          skin_hex,
          skin_tone_name,
          undertone,
          eye_hex,
          eye_color_name,
          hair_hex,
          hair_color_name,
          contrast_level,
          depth,
          ai_confidence,
          is_good_for_training
        )
      `)
      .not("color_labels", "is", null);

    if (samplesError) throw samplesError;

    // Filter to only verified samples and format for export
    const formattedSamples = (trainingSamples || [])
      .filter(sample => {
        // color_labels is an array due to the join, get first element
        const labels = Array.isArray(sample.color_labels) 
          ? sample.color_labels[0] 
          : sample.color_labels;
        return labels && 
          ["expert_verified", "nechama_verified"].includes(labels.label_status) &&
          labels.is_good_for_training === true;
      })
      .map(sample => {
        const labels = Array.isArray(sample.color_labels) 
          ? sample.color_labels[0] 
          : sample.color_labels;
        return {
          photo_url: sample.storage_path,
          thumbnail_url: sample.thumbnail_path,
          notes: labels?.notes || null,
          labeled_by: labels?.labeled_by || null,
          skin_undertone: labels?.undertone || null,
          skin_hex: labels?.skin_hex || null,
          skin_tone_name: labels?.skin_tone_name || null,
          eye_color: labels?.eye_color_name || null,
          eye_hex: labels?.eye_hex || null,
          hair_color: labels?.hair_color_name || null,
          hair_hex: labels?.hair_hex || null,
          contrast_level: labels?.contrast_level || null,
          depth: labels?.depth || null,
          season_slug: labels?.confirmed_season || null,
          subtype_slug: labels?.confirmed_subtype || null,
          ai_confidence: labels?.ai_confidence || null,
          label_status: labels?.label_status || null,
          source: sample.source,
        };
      });

    // Build export payload
    const exportData = {
      subtypes: subtypes?.map(s => ({
        slug: s.slug,
        name: s.name,
        season: s.season,
        description: s.description,
        palette_effect: s.palette_effect,
        key_colors: s.key_colors,
        avoid_colors: s.avoid_colors,
        fabrics_perfect: s.fabrics_perfect,
        fabrics_good: s.fabrics_good,
        fabrics_avoid: s.fabrics_avoid,
        prints: s.prints,
        silhouettes: s.silhouettes,
        jewelry_metals: s.jewelry_metals,
        jewelry_stones: s.jewelry_stones,
        jewelry_styles: s.jewelry_styles,
        eras: s.eras,
        artists: s.artists,
        designers: s.designers,
        makeup_lip: s.makeup_lip,
        makeup_cheek: s.makeup_cheek,
        makeup_eye: s.makeup_eye,
        best_for: s.best_for,
      })) || [],
      colors: colors.map(c => ({
        slug: c.term,
        name: c.display_name || c.term,
        hex: c.hex_code,
        rgb: c.rgb_values,
        description: c.description,
      })),
      fabrics: fabrics.map(f => ({
        slug: f.term,
        name: f.display_name || f.term,
        description: f.description,
        parent: f.parent_term,
        related: f.related_terms,
      })),
      artists: artists.map(a => ({
        slug: a.term,
        name: a.display_name || a.term,
        description: a.description,
        related: a.related_terms,
      })),
      eras: eras.map(e => ({
        slug: e.term,
        name: e.display_name || e.term,
        description: e.description,
      })),
      training_samples: formattedSamples,
      stats: {
        total_subtypes: subtypes?.length || 0,
        total_colors: colors.length,
        total_fabrics: fabrics.length,
        total_artists: artists.length,
        total_verified_samples: formattedSamples.length,
      },
      exported_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Export error:", err);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
