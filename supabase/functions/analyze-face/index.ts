import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FACE_ANALYSIS_PROMPT = `You are analyzing a face photo for seasonal color analysis based on the 12-season (or more detailed subtype) color system.

Analyze the person's natural coloring - their skin tone, eye color, hair color, and overall contrast level. Based on these features, determine their most likely seasonal color type.

Respond with JSON in this exact format:

{
  "skin": {
    "tone_name": "One of: porcelain, ivory, alabaster, fair, peaches_cream, cream, light_beige, rose_beige, warm_beige, golden_beige, nude, sand, honey, caramel, olive, tan, bronze, amber, cinnamon, toffee, mocha, espresso, mahogany, cocoa, ebony, onyx",
    "hex": "#hexvalue of dominant skin color",
    "undertone": "warm, cool, or neutral"
  },
  
  "eyes": {
    "color_name": "One of: dark_brown, chocolate_brown, golden_brown, amber, topaz, honey, emerald, jade, olive, sage, moss, teal, sapphire, sky_blue, steel_blue, periwinkle, navy, charcoal, silver, slate, pewter, hazel_green, hazel_brown, hazel_gold, black, violet, mixed",
    "hex": "#hexvalue of dominant eye color",
    "details": "Brief description of eye color patterns, flecks, etc."
  },
  
  "hair": {
    "color_name": "One of: blue_black, soft_black, black_brown, espresso, dark_chocolate, milk_chocolate, chestnut, walnut, caramel, toffee, golden_brown, mousy_brown, auburn, copper, ginger, strawberry, burgundy, mahogany, platinum, ash_blonde, golden_blonde, honey_blonde, champagne, dirty_blonde, dark_blonde, silver, pewter, salt_pepper, white, steel_gray",
    "hex": "#hexvalue of dominant hair color",
    "is_natural": true or false (best guess)
  },
  
  "contrast": {
    "level": "low, low-medium, medium, medium-high, or high",
    "value": 0-100 numeric value,
    "details": "Description of contrast between features"
  },
  
  "depth": {
    "level": "light, light-medium, medium, medium-deep, or deep",
    "value": 0-100 numeric value
  },
  
  "predicted_season": "spring, summer, autumn, or winter",
  
  "predicted_subtype": "A specific subtype name like 'Light Spring', 'Soft Summer', 'Deep Autumn', 'Clear Winter', etc.",
  
  "confidence": 0-100 how confident you are in this assessment,
  
  "alternatives": [
    {
      "subtype": "Second most likely subtype",
      "confidence": 0-100
    }
  ],
  
  "reasoning": "2-3 sentences explaining why you chose this season/subtype based on the visual evidence"
}

Be precise with hex color values. Consider undertone, depth, and contrast together. If the photo quality is poor or the person appears to be wearing heavy makeup, note that in your reasoning and lower your confidence accordingly.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, faceImageId } = await req.json();
    
    if (!imageUrl || !faceImageId) {
      return new Response(
        JSON.stringify({ error: "imageUrl and faceImageId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing face image: ${faceImageId}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: FACE_ANALYSIS_PROMPT },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI analysis", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the color_labels table with the analysis
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const colorLabelData = {
      face_image_id: faceImageId,
      skin_hex: analysis.skin?.hex,
      skin_tone_name: analysis.skin?.tone_name,
      undertone: analysis.skin?.undertone,
      eye_hex: analysis.eyes?.hex,
      eye_color_name: analysis.eyes?.color_name,
      eye_details: analysis.eyes?.details ? { description: analysis.eyes.details } : null,
      hair_hex: analysis.hair?.hex,
      hair_color_name: analysis.hair?.color_name,
      hair_details: analysis.hair?.is_natural !== undefined ? { is_natural: analysis.hair.is_natural } : null,
      contrast_level: analysis.contrast?.level,
      contrast_value: analysis.contrast?.value,
      contrast_details: analysis.contrast?.details ? { description: analysis.contrast.details } : null,
      depth: analysis.depth?.level,
      depth_value: analysis.depth?.value,
      ai_predicted_subtype: analysis.predicted_subtype,
      confirmed_season: analysis.predicted_season,
      ai_confidence: analysis.confidence,
      ai_alternatives: analysis.alternatives,
      ai_reasoning: analysis.reasoning,
      label_status: 'ai_predicted',
      labeled_at: new Date().toISOString(),
    };

    // Upsert the color label (update if exists, insert if not)
    const { error: upsertError } = await supabase
      .from('color_labels')
      .upsert(colorLabelData, { 
        onConflict: 'face_image_id',
        ignoreDuplicates: false 
      });

    if (upsertError) {
      console.error("Failed to save analysis:", upsertError);
      // Still return the analysis even if save failed
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        saved: !upsertError
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-face error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
