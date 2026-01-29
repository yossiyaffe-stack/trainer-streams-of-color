import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Authentication helper - validates JWT and returns user
async function authenticateRequest(req: Request): Promise<{ user: { id: string; email?: string } } | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !data?.user) {
    return null;
  }

  return { user: { id: data.user.id, email: data.user.email } };
}

type AnalysisOption = 
  | 'color_palette' 
  | 'costume' 
  | 'facial_features' 
  | 'color_scheme' 
  | 'seasons' 
  | 'jewelry' 
  | 'clothing_cut';

const buildPrompt = (options: AnalysisOption[]): string => {
  const sections: string[] = [];
  
  // Base intro
  sections.push(`You are analyzing a painting for a personal color analysis system based on Nechama Yaffe's methodology.
Analyze this painting and extract the requested elements. Use Nechama's rich, evocative vocabulary.

Respond with JSON containing ONLY the sections requested below:`);

  // Always include basic info
  sections.push(`
"title_suggestion": "A poetic title for this painting in Nechama's style",
"artist_detected": "Artist name if recognizable, or 'Unknown' / art movement style",
"era_detected": "Time period of the painting or fashion depicted",`);

  if (options.includes('color_palette')) {
    sections.push(`
"colors": {
  "dominant": ["List 2-3 dominant colors with Nechama-style names (e.g., 'Burgundy Wine', 'Dusty Rose')"],
  "accent": ["Accent colors"],
  "hex_values": ["Approximate hex codes for main colors"],
  "warmth": "warm or cool or neutral"
},`);
  }

  if (options.includes('costume')) {
    sections.push(`
"fabrics": {
  "primary": ["Main fabric(s) - Velvet, Silk, Satin, Brocade, Lace, Chiffon, etc."],
  "secondary": ["Other fabrics present"],
  "texture_notes": "Description of fabric textures and how light plays on them"
},`);
  }

  if (options.includes('facial_features')) {
    sections.push(`
"facial_analysis": {
  "skin_tone": "Skin tone description (e.g., 'Porcelain', 'Warm Ivory', 'Golden Beige')",
  "skin_undertone": "warm or cool or neutral",
  "eye_color": "Eye color description with depth",
  "hair_color": "Hair color with undertones",
  "contrast_level": "low, medium, or high contrast between features",
  "face_shape": "Oval, Heart, Square, Round, etc. if visible",
  "coloring_notes": "Overall impression of the person's natural coloring"
},`);
  }

  if (options.includes('color_scheme')) {
    sections.push(`
"color_scheme": {
  "harmony_type": "Complementary, Analogous, Triadic, Monochromatic, etc.",
  "mood": "The emotional quality of the color scheme",
  "palette_effect": "A Nechama-style name that captures the essence (e.g., 'Renaissance Queen', 'French Court')",
  "best_for_season": "Which seasonal type would wear these colors best"
},`);
  }

  if (options.includes('seasons')) {
    sections.push(`
"seasonal_analysis": {
  "primary_season": "Spring or Summer or Autumn or Winter",
  "secondary_season": "If mixed, what's the secondary influence",
  "subtype_suggestion": "Specific subtype name (e.g., 'French Spring', 'Tapestry Autumn')",
  "reasoning": "Why this painting fits this season's aesthetic",
  "seasonal_elements": ["List specific elements that indicate the season"]
},`);
  }

  if (options.includes('jewelry')) {
    sections.push(`
"jewelry_accessories": {
  "items": ["Jewelry pieces visible - Pearls, Cameo, Pendant, Tiara, etc."],
  "metals": ["Gold, Silver, Rose Gold, Antique Gold, Copper, etc."],
  "stones": ["Gemstones if visible - Ruby, Emerald, Pearl, Diamond, etc."],
  "style": "Overall jewelry style (Opulent, Delicate, Statement, Vintage, Minimal)",
  "best_metal_recommendation": "Which metal tone suits the subject/palette"
},`);
  }

  if (options.includes('clothing_cut')) {
    sections.push(`
"clothing_cut": {
  "silhouette": {
    "primary": "Main silhouette (Empire Waist, A-Line, Fitted, Ball Gown, Column, etc.)",
    "structure": "Structured, Flowing, Draped, Tailored",
    "volume": "Minimal, Moderate, Voluminous"
  },
  "neckline": "Primary neckline style (Portrait, Off-Shoulder, Square, V-Neck, Boat, etc.)",
  "sleeves": "Sleeve style (Bishop, Bell, Puff, Fitted, Cap, Sleeveless, etc.)",
  "waistline": "Natural, Empire, Dropped, Undefined",
  "length": "Full length, Tea length, Knee, etc.",
  "construction_notes": "Special details about the garment construction"
},`);
  }

  // Always include talking points
  sections.push(`
"best_for": ["What this painting best demonstrates"],
"client_talking_points": ["2-3 bullet points a color consultant could use when showing this to a client"]`);

  return sections.join('\n') + '\n\nWrap your response in a valid JSON object with curly braces.';
};

const FULL_ANALYSIS_PROMPT = `You are analyzing a painting for a personal color analysis system based on Nechama Yaffe's methodology. 

Analyze this painting and extract fashion/style elements that can be used as references for clients. Focus on the clothing, fabrics, colors, and overall aesthetic.

Respond with JSON in this exact format:

{
  "title_suggestion": "A poetic title for this painting in Nechama's style (e.g., 'Venetian Duchess', 'Garden of Roses', 'Midnight Velvet')",
  
  "artist_detected": "Artist name if recognizable, or 'Unknown' / art movement style",
  "era_detected": "Time period of the painting or fashion depicted",
  
  "fabrics": {
    "primary": ["Main fabric(s) visible - use terms like: Velvet, Silk, Satin, Brocade, Lace, Chiffon, etc."],
    "secondary": ["Other fabrics present"],
    "texture_notes": "Description of fabric textures and how light plays on them"
  },
  
  "silhouette": {
    "primary": "Main silhouette (Empire Waist, A-Line, Fitted, Ball Gown, Column, etc.)",
    "details": ["Specific cut details - Draped, Layered, Structured, etc."],
    "notes": "How the silhouette creates the overall shape"
  },
  
  "neckline": "Primary neckline style (Portrait, Off-Shoulder, Square, V-Neck, etc.)",
  "sleeves": "Sleeve style (Bishop, Bell, Puff, Fitted, Sleeveless, etc.)",
  
  "colors": {
    "dominant": ["List 2-3 dominant colors with Nechama-style names (e.g., 'Burgundy Wine', 'Dusty Rose', 'Midnight Blue')"],
    "accent": ["Accent colors"],
    "color_mood": "Overall color feeling (Formal/Dark, Romantic/Rich, Jewel Tones, Pastel/Soft, etc.)",
    "palette_warmth": "warm or cool or neutral"
  },
  
  "palette_effect": "A Nechama-style palette effect name that captures the painting's essence (e.g., 'Renaissance Queen', 'French Court', 'Pre-Raphaelite Dream')",
  
  "prints_patterns": ["Any visible prints or patterns - Floral, Damask, Brocade Pattern, etc."],
  
  "jewelry_accessories": {
    "items": ["Jewelry pieces visible - Pearls, Cameo, Pendant, etc."],
    "metals": ["Gold, Silver, Antique Gold, etc."],
    "style": "Overall jewelry style (Opulent, Delicate, Statement, Minimal)"
  },
  
  "mood": {
    "primary": "Primary mood (Elegant, Romantic, Dramatic, Regal, etc.)",
    "secondary": ["Additional mood qualities"],
    "feeling": "How this painting makes someone feel - describe in 1-2 sentences"
  },
  
  "suggested_seasons": {
    "primary": "Spring or Summer or Autumn or Winter",
    "reasoning": "Why this painting fits this season's aesthetic"
  },
  
  "best_for": ["What this painting best demonstrates - e.g., 'Fabric draping', 'Color combination', 'Neckline reference', 'Era styling'"],
  
  "client_talking_points": ["2-3 bullet points a color consultant could use when showing this painting to a client"]
}

Use Nechama's rich, evocative vocabulary. Be specific about fabrics and colors. Think like a personal stylist helping clients visualize their ideal look.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request - this function uses paid AI services
    const auth = await authenticateRequest(req);
    if (!auth) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`Authenticated user: ${auth.user.email || auth.user.id}`);

    const { imageBase64, imageUrl, analysisOptions } = await req.json();
    
    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Either imageBase64 or imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use focused prompt if specific options provided, otherwise full analysis
    const prompt = analysisOptions && analysisOptions.length > 0 
      ? buildPrompt(analysisOptions)
      : FULL_ANALYSIS_PROMPT;

    // Build the image content for the API
    const imageContent = imageBase64 
      ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: "image_url", image_url: { url: imageUrl } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              imageContent
            ]
          }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      // Try to extract JSON from the response (may be wrapped in markdown)
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

    return new Response(
      JSON.stringify({ analysis, analyzedOptions: analysisOptions || 'full' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-painting error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});