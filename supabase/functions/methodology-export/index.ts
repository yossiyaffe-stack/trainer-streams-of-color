import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Fetch verified training samples (expert_verified or nechama_verified)
    const { data: trainingSamples, error: samplesError } = await supabase
      .from("v_training_data")
      .select("*")
      .in("label_status", ["expert_verified", "nechama_verified"])
      .eq("is_good_for_training", true);

    if (samplesError) throw samplesError;

    // Format training samples for export
    const formattedSamples = (trainingSamples || []).map(sample => ({
      photo_url: sample.storage_path,
      thumbnail_url: sample.thumbnail_path,
      skin_hex: sample.skin_hex,
      skin_tone_name: sample.skin_tone_name,
      eye_hex: sample.eye_hex,
      eye_color_name: sample.eye_color_name,
      hair_hex: sample.hair_hex,
      hair_color_name: sample.hair_color_name,
      undertone: sample.undertone,
      contrast_level: sample.contrast_level,
      depth: sample.depth,
      season_slug: sample.confirmed_season,
      subtype_slug: sample.confirmed_subtype,
      ai_confidence: sample.ai_confidence,
      label_status: sample.label_status,
      source: sample.source,
    }));

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
