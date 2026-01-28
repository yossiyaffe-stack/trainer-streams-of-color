import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// VOCABULARY DATA FROM ALGORITHM FILES
// =============================================================================

const VOCABULARY = {
  fabrics: [
    'Silk', 'Cotton', 'Fine Cotton', 'Linen', 'Wool', 'Cashmere', 'Mohair', 'Alpaca', 'Angora',
    'Velvet', 'Crushed Velvet', 'Cut Velvet', 'Suede', 'Leather', 'Soft Leather', 'Embossed Leather',
    'Corduroy', 'Fine Corduroy', 'Tweed', 'Fine Tweed', 'Bouclé', 'Chenille',
    'Chiffon', 'Georgette', 'Organza', 'Tulle', 'Lace', 'Fine Lace', 'Crocheted Lace', 'Eyelet',
    'Satin', 'Charmeuse', 'Taffeta', 'Silk Shantung', 'Moiré',
    'Jersey', 'Wool Jersey', 'Fine Knit', 'Irish Knit', 'Fisherman Knit',
    'Denim', 'Chambray', 'Canvas', 'Cotton-Linen', 'Gauze Cotton',
    'Brocade', 'Damask', 'Jacquard', 'Tapestry', 'Embroidered', 'Needlepoint', 'Sequined', 'Beaded',
    'Toile', 'Polished Cotton', 'Iridescent Fabric', 'Net', 'Fur', 'White Fur'
  ],
  silhouettes: [
    'Empire Waist', 'A-Line', 'Fitted/Sheath', 'Ball Gown', 'Column',
    'Princess Line', 'Princess Cut', 'Dropped Waist', 'Wrap', 'Draped', 'Flowing',
    'Structured', 'Layered', 'Tiered', 'Mermaid', 'Trumpet', 'S-Curve',
    'Grecian', 'Safari', 'Kimono', 'Peasant', 'Military', 'Riding Style'
  ],
  necklines: [
    'Portrait', 'Off-Shoulder', 'Square', 'Sweetheart', 'V-Neck', 'Deep V',
    'Scoop', 'Boat/Bateau', 'High Neck', 'Jewel', 'Cowl', 'One-Shoulder',
    'Halter', 'Mandarin', 'Oval', 'Cape Collar', 'Slit Neck', 'Asymmetrical'
  ],
  sleeves: [
    'Sleeveless', 'Cap', 'Short', 'Three-Quarter', 'Long', 'Bell',
    'Bishop', 'Juliet', 'Puff', 'Sharp Puff', 'Leg of Mutton', 'Poet', 'Fitted',
    'Butterfly', 'Kimono', 'Batwing', 'Mutton', 'Trumpet', 'Draped'
  ],
  paletteEffects: [
    'Girl with a Pearl Earring', 'Fawn in a Field of Wildflowers', 'Bouquet of Flowers in a Vase',
    'Milk Maiden', 'Gardenia Summer', 'Southern Belle', 'Gibson Girl', 'Cherry Blossoms',
    'Princess', 'Rose Garden', 'Ballerina', 'Peasant Girl', 'English Roses', 'Romantic French Design',
    'Fleur de Lis', "Trompe L'oeil", 'Summer Princess', 'Guinevere', 'Summer Woods',
    'Renaissance Princess', 'Grecian Effects', 'Japanese Garden', 'Chinoiserie Effect',
    'Cloisonné Effect', 'Porcelain Effect', 'Venice Watercolors', 'Watercolor Painting',
    'Summer Lake at Dawn', 'Opal and Moonstone Palette', 'Peacock-Pheasant Palette',
    'Tea Rose Palette', 'Summer Sunset', 'Edwardian Style', 'French Girl Fashion',
    'Renaissance Style', 'Romantic and Woodsy', "Knight's Costume", 'Autumn Foliage',
    'Grecian Princess', 'Mediterranean Palette', 'Spanish Desert', 'Fruit Harvest',
    'Mid Autumn', 'Woods and Pine Trees', 'Persian Carpet', 'Mediterranean Vineyard',
    'Rembrandt Palette', 'Coat of Many Colors', 'Queen Esther Palette',
    'Sunlight in Early Autumn', 'Boats and Sunset', 'Harvest', 'Spanish Sunset',
    'Late Autumn into Early Winter', 'Carpet of Leaves', 'Warrior Princess',
    'Persian Princess', 'Japanese Kimono', 'Oil Painting', 'Silk Road',
    'Peacock Blue and Emerald Green', 'Spanish Princess', 'Winter Sunset',
    'Chinese Vase', 'Enamel Jewelry', 'Castle on Mediterranean Sea',
    'Tapestry Palette', 'Golden Diadem', 'Italian Renaissance', 'Biblical Designs',
    'Mediterranean Sunset', 'Burgundy Roses and Emerald Leaves', 'Ice Crystal',
    'Winter Forest', 'Frozen Lake', 'Crystal Palace', 'Exotic Princess',
    'Persian Night', 'Moroccan Palace', 'Indian Empress', 'Byzantine', 'Fairy Tale'
  ],
  eras: [
    'Medieval', 'Renaissance', 'Baroque', 'Rococo', 'Neoclassical', 'Regency',
    'Romantic Era', 'Victorian', 'Belle Époque', 'Edwardian', 'Gibson Girl Era',
    'Art Nouveau', 'Art Deco', '1920s Flapper', '1930s Europe', '1940s Fashion',
    '1950s', '1960s', '1970s', 'Mid-Century', 'Contemporary',
    '1600s Dutch', '1700s French', '1800s English', '1800s French',
    'Ancient Greece', 'Ancient Egypt', 'Ancient Japan', 'Ancient Chinese',
    'Persian', 'Moroccan', 'Spanish Renaissance', 'Italian Renaissance',
    'Hungarian Folk', 'Pre-Raphaelite England', 'Japanese Kimono',
    'Indian Sari', 'Mediterranean', 'Flemish', 'Byzantine'
  ],
  moods: [
    'Elegant', 'Romantic', 'Dramatic', 'Soft', 'Bold', 'Mysterious',
    'Regal', 'Delicate', 'Opulent', 'Serene', 'Powerful', 'Ethereal',
    'Whimsical', 'Classic', 'Bohemian', 'Sophisticated', 'Warm', 'Cool'
  ],
  jewelryMetals: [
    'Yellow Gold', 'Rose Gold', 'White Gold', 'Antique Gold', 'Woven Gold',
    'Silver', 'Antique Silver', 'Burnished Silver', 'Platinum', 'Pewter',
    'Copper', 'Bronze', 'Mixed Metals'
  ],
  jewelryStones: [
    'Diamond', 'Ruby', 'Sapphire', 'Emerald',
    'Amethyst', 'Blue Topaz', 'Topaz', 'Aquamarine', 'Garnet', 'Peridot',
    'Turquoise', 'Jade', 'Opal', 'Green Opal', 'Labradorite', 'Moonstone',
    'Tourmaline', 'Carnelian', 'Onyx', 'Tiger Eye', 'Agate', 'Jasper', 'Aventurine',
    'Pearl', 'Pink Pearl', 'White Coral', 'Pink Coral', 'Amber', 'Ivory', 'Mother of Pearl',
    'Quartz', 'Rose Quartz', 'Pink Quartz', 'Glass', 'Green Glass', 'Blue Glass', 'Cameo'
  ],
  jewelryStyles: [
    'Filigree', 'Enamel', 'Cloisonné', 'Pave', 'Cameo', 'Chandelier',
    'Floral Motifs', 'Bird Motifs', 'Leaf Motifs', 'Feather Motifs',
    'Hearts', 'Lockets', 'Ribbons', 'Chains', 'Layered Chains', 'Rope',
    'Braided', 'Links', 'Cuffs', 'Bangles', 'Dangling', 'Teardrop',
    'Pear Cut', 'Oval Cut', 'Rectangular', 'Whimsical', 'Persian Motifs',
    'Celtic Knots', 'Fleur-de-lis'
  ],
  artists: [
    'Monet', 'Manet', 'Renoir', 'Degas', 'Cassatt',
    'Rossetti', 'Dante Gabriel Rossetti', 'John Singer Sargent',
    'Vermeer', 'Rembrandt', 'Leonardo Da Vinci', 'Botticelli',
    'Van Gogh', 'Klimt', 'Matisse', 'Picasso', 'Modigliani', 'Caravaggio',
    'El Greco', 'Corot', 'Gauguin', 'Ingres', 'Odilon Redon'
  ],
  designers: [
    'Chanel', 'Dior', 'Valentino', 'Oscar de la Renta',
    'BlueMarine', 'Chloe', 'Alberta Ferretti',
    'Etro', 'Dries Van Noten', 'Brunello Cucinelli',
    'Ralph Lauren', 'Ulla Johnson', 'Stella McCartney',
    'Cavalli', 'Roberto Cavalli', 'Missoni', 'Costume National',
    'Miu Miu', 'Marni', 'Louis Vuitton'
  ],
  prints: [
    'Roses', 'Peonies', 'Tulips', 'Lilies', 'Calla Lilies', 'Water Lilies',
    'Hydrangeas', 'Jasmine', 'Hibiscus', 'Cherry Blossoms', 'Magnolias',
    'Gardenias', 'Dogwood', 'Wisteria', 'Camellias', 'Lotus',
    'Butterflies', 'Birds', 'Peacock Feathers', 'Feathers', 'Leaves', 'Branches',
    'Deer', 'Seashells', 'Dragonflies', 'Tropical Flowers',
    'Stripes', 'Fine Stripes', 'Polka Dots', 'Diamonds', 'Chevron',
    'Windowpane', 'Plaid', 'Houndstooth', 'Paisley',
    'Toile', 'Fleur de Lis', 'Chinoiserie', 'Kimono Prints', 'Mosaic',
    'Tile Prints', 'Persian Designs', 'Moroccan Tile', 'Indian Motifs',
    "Trompe L'oeil", 'Leopard', 'Animal Print', 'Hearts', 'Ribbons'
  ],
  colorMoods: [
    'Formal/Dark', 'Romantic/Rich', 'Neutral/Earth', 'Enlivened/Bright',
    'Pastel/Soft', 'Jewel Tones', 'Metallics', 'Monochromatic', 'Muted/Dusty',
    'Iridescent', 'High Contrast', 'Low Contrast', 'Warm', 'Cool'
  ]
};

// Color Analysis terms
const COLOR_ANALYSIS = {
  hairColors: [
    'Blue-Black', 'Soft Black', 'Warm Black', 'Espresso', 'Dark Chocolate', 'Chestnut',
    'Milk Chocolate', 'Mousy Brown', 'Golden Brown', 'Light Brown', 'Ash Brown',
    'Deep Auburn', 'Classic Auburn', 'Light Auburn', 'Copper Red', 'Ginger', 'Strawberry', 'Titian Red',
    'Golden Blonde', 'Honey Blonde', 'Butter Blonde', 'Strawberry Blonde', 'Ash Blonde',
    'Champagne Blonde', 'Platinum Blonde', 'Sandy Blonde',
    'Silver Gray', 'Steel Gray', 'Salt & Pepper', 'Warm Gray', 'Pure White'
  ],
  eyeColors: [
    'Ice Blue', 'Sky Blue', 'Steel Blue', 'Soft Blue', 'Gray Blue', 'Turquoise Blue', 'Sapphire Blue', 'Periwinkle',
    'Emerald Green', 'Forest Green', 'Jade Green', 'Olive Green', 'Seafoam Green', 'Grass Green', 'Teal', 'Moss Green',
    'Golden Hazel', 'Green Hazel', 'Brown Hazel', 'Gray Hazel', 'Amber Hazel',
    'Light Brown', 'Golden Brown', 'Amber Brown', 'Chocolate Brown', 'Espresso Brown', 'Black Brown', 'Warm Brown', 'Cool Brown',
    'Clear Gray', 'Soft Gray', 'Charcoal Gray', 'Blue Gray', 'Green Gray'
  ],
  skinTones: [
    'Porcelain with Pink', 'Ivory with Rose', 'Fair with Pink', 'Beige with Rose', 'Medium with Rose', 'Olive Cool', 'Deep with Berry', 'Ebony with Blue',
    'Ivory with Peach', 'Cream with Golden', 'Fair with Peach', 'Beige with Golden', 'Medium with Apricot', 'Olive Warm', 'Caramel', 'Bronze', 'Espresso Warm',
    'Ivory Neutral', 'Fair Neutral', 'Beige Neutral', 'Medium Neutral', 'Tan Neutral', 'Deep Neutral'
  ],
  undertones: ['Warm', 'Cool', 'Neutral', 'Warm-Neutral', 'Cool-Neutral'],
  depths: ['Light', 'Medium', 'Medium-Deep', 'Deep', 'Very Deep'],
  contrasts: ['Very High', 'High', 'Medium-High', 'Medium', 'Medium-Low', 'Low', 'Very Low'],
  chromas: ['Very Bright/Clear', 'Bright', 'Medium-Bright', 'Medium', 'Medium-Soft', 'Soft/Muted', 'Very Soft/Muted']
};

// Colors from master color database (200+)
const COLORS = {
  skinTones: [
    { name: 'Ivory', hex: '#FFFFF0' }, { name: 'Winter White', hex: '#F8F8F8' }, { name: 'Cream', hex: '#FFFDD0' },
    { name: 'Ecru', hex: '#C2B280' }, { name: 'Linen', hex: '#FAF0E6' }, { name: 'Yellow Cream', hex: '#FFF8DC' },
    { name: 'Butter', hex: '#FFFF99' }, { name: 'Buttercream', hex: '#FFF5BA' }, { name: 'Vanilla', hex: '#F3E5AB' },
    { name: 'Champagne', hex: '#F7E7CE' }, { name: 'Pink Cream', hex: '#FFF0F5' }, { name: 'Shell Pink', hex: '#FFE4E1' },
    { name: 'Rose', hex: '#E8ADAA' }, { name: 'Dusty Rose', hex: '#DCAE96' }, { name: 'Blush', hex: '#DE5D83' },
    { name: 'Peach', hex: '#FFCBA4' }, { name: 'Apricot', hex: '#FBCEB1' }, { name: 'Coral', hex: '#FF7F50' },
    { name: 'Terra Cotta', hex: '#E2725B' }, { name: 'Rose Beige', hex: '#D4B5A0' }, { name: 'Cameo', hex: '#EFBBCC' }
  ],
  romantic: [
    { name: 'Red', hex: '#FF0000' }, { name: 'Soft Red', hex: '#D64545' }, { name: 'Deep Red', hex: '#850101' },
    { name: 'Wine', hex: '#722F37' }, { name: 'Burgundy', hex: '#800020' }, { name: 'Claret', hex: '#7F1734' },
    { name: 'Maroon', hex: '#800000' }, { name: 'Sangria', hex: '#92000A' }, { name: 'Plum', hex: '#8E4585' },
    { name: 'Raspberry', hex: '#E30B5C' }, { name: 'Rust', hex: '#B7410E' }, { name: 'Orange', hex: '#FF8C00' }
  ],
  formal: [
    { name: 'Black', hex: '#000000' }, { name: 'Blue-Black', hex: '#0D0D1A' }, { name: 'Navy', hex: '#000080' },
    { name: 'Midnight Blue', hex: '#191970' }, { name: 'Prussian Blue', hex: '#003153' },
    { name: 'Midnight Green', hex: '#004953' }, { name: 'Hunter Green', hex: '#355E3B' }, { name: 'Charcoal', hex: '#36454F' }
  ],
  browns: [
    { name: 'Chocolate', hex: '#7B3F00' }, { name: 'Dark Brown', hex: '#5C4033' }, { name: 'Coffee', hex: '#6F4E37' },
    { name: 'Walnut', hex: '#773F1A' }, { name: 'Golden Brown', hex: '#996515' }, { name: 'Chestnut', hex: '#954535' },
    { name: 'Amber', hex: '#FFBF00' }, { name: 'Topaz', hex: '#FFC87C' }, { name: 'Caramel', hex: '#FFD59A' },
    { name: 'Camel', hex: '#C19A6B' }, { name: 'Tan', hex: '#D2B48C' }, { name: 'Copper', hex: '#B87333' }
  ],
  greens: [
    { name: 'Emerald', hex: '#50C878' }, { name: 'Dark Emerald', hex: '#046307' }, { name: 'Teal', hex: '#008080' },
    { name: 'Jade', hex: '#00A86B' }, { name: 'Sea Green', hex: '#2E8B57' }, { name: 'Seafoam', hex: '#71EEB8' },
    { name: 'Olive', hex: '#808000' }, { name: 'Sage', hex: '#BCB88A' }, { name: 'Moss', hex: '#8A9A5B' },
    { name: 'Kelly Green', hex: '#4CBB17' }, { name: 'Bottle Green', hex: '#006A4E' }, { name: 'Mint', hex: '#98FF98' }
  ],
  blues: [
    { name: 'Sapphire', hex: '#0F52BA' }, { name: 'Cobalt', hex: '#0047AB' }, { name: 'Indigo', hex: '#4B0082' },
    { name: 'Electric Blue', hex: '#7DF9FF' }, { name: 'Aqua', hex: '#00FFFF' }, { name: 'Turquoise', hex: '#40E0D0' },
    { name: 'Sky Blue', hex: '#87CEEB' }, { name: 'Baby Blue', hex: '#89CFF0' }, { name: 'Powder Blue', hex: '#B0E0E6' },
    { name: 'Slate Blue', hex: '#6A5ACD' }, { name: 'Periwinkle', hex: '#CCCCFF' }, { name: 'Denim', hex: '#1560BD' }
  ],
  purples: [
    { name: 'Purple', hex: '#800080' }, { name: 'Dark Purple', hex: '#4B0082' }, { name: 'Soft Purple', hex: '#B19CD9' },
    { name: 'Violet', hex: '#EE82EE' }, { name: 'Lavender', hex: '#E6E6FA' }, { name: 'Lilac', hex: '#C8A2C8' },
    { name: 'Orchid', hex: '#DA70D6' }, { name: 'Mauve', hex: '#E0B0FF' }, { name: 'Amethyst', hex: '#9966CC' }
  ],
  metallics: [
    { name: 'Gold', hex: '#FFD700' }, { name: 'Rose Gold', hex: '#B76E79' }, { name: 'Antique Gold', hex: '#C9B037' },
    { name: 'Silver', hex: '#C0C0C0' }, { name: 'Platinum', hex: '#E5E4E2' }, { name: 'Pewter', hex: '#8E9291' },
    { name: 'Bronze', hex: '#CD7F32' }, { name: 'Copper', hex: '#B87333' }
  ]
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const syncType = body.syncType || 'all';

    const results: Record<string, { inserted: number; updated: number; errors: string[] }> = {};

    // Helper function to upsert terms
    const upsertTerms = async (
      category: string,
      terms: Array<{ term: string; displayName?: string; hex?: string; rgb?: number[]; description?: string; parent?: string; related?: string[] }>
    ) => {
      let inserted = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const item of terms) {
        const slug = item.term.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        
        const { data: existing } = await supabase
          .from("vocabulary_terms")
          .select("id")
          .eq("term", slug)
          .eq("category", category)
          .single();

        const record = {
          term: slug,
          display_name: item.displayName || item.term,
          category,
          hex_code: item.hex || null,
          rgb_values: item.rgb || null,
          description: item.description || null,
          parent_term: item.parent || null,
          related_terms: item.related || null,
        };

        if (existing) {
          const { error } = await supabase
            .from("vocabulary_terms")
            .update(record)
            .eq("id", existing.id);
          if (error) errors.push(`Update ${item.term}: ${error.message}`);
          else updated++;
        } else {
          const { error } = await supabase
            .from("vocabulary_terms")
            .insert(record);
          if (error) errors.push(`Insert ${item.term}: ${error.message}`);
          else inserted++;
        }
      }

      return { inserted, updated, errors };
    };

    // Sync fabrics
    if (syncType === 'all' || syncType === 'fabrics') {
      const fabricTerms = VOCABULARY.fabrics.map(f => ({ term: f, displayName: f }));
      results.fabrics = await upsertTerms('fabric', fabricTerms);
    }

    // Sync silhouettes
    if (syncType === 'all' || syncType === 'silhouettes') {
      const terms = VOCABULARY.silhouettes.map(t => ({ term: t, displayName: t }));
      results.silhouettes = await upsertTerms('silhouette', terms);
    }

    // Sync necklines
    if (syncType === 'all' || syncType === 'necklines') {
      const terms = VOCABULARY.necklines.map(t => ({ term: t, displayName: t }));
      results.necklines = await upsertTerms('neckline', terms);
    }

    // Sync sleeves
    if (syncType === 'all' || syncType === 'sleeves') {
      const terms = VOCABULARY.sleeves.map(t => ({ term: t, displayName: t }));
      results.sleeves = await upsertTerms('sleeve', terms);
    }

    // Sync palette effects
    if (syncType === 'all' || syncType === 'paletteEffects') {
      const terms = VOCABULARY.paletteEffects.map(t => ({ term: t, displayName: t }));
      results.paletteEffects = await upsertTerms('palette_effect', terms);
    }

    // Sync eras
    if (syncType === 'all' || syncType === 'eras') {
      const terms = VOCABULARY.eras.map(t => ({ term: t, displayName: t }));
      results.eras = await upsertTerms('era', terms);
    }

    // Sync moods
    if (syncType === 'all' || syncType === 'moods') {
      const terms = VOCABULARY.moods.map(t => ({ term: t, displayName: t }));
      results.moods = await upsertTerms('mood', terms);
    }

    // Sync jewelry metals
    if (syncType === 'all' || syncType === 'jewelryMetals') {
      const terms = VOCABULARY.jewelryMetals.map(t => ({ term: t, displayName: t }));
      results.jewelryMetals = await upsertTerms('jewelry_metal', terms);
    }

    // Sync jewelry stones
    if (syncType === 'all' || syncType === 'jewelryStones') {
      const terms = VOCABULARY.jewelryStones.map(t => ({ term: t, displayName: t }));
      results.jewelryStones = await upsertTerms('jewelry_stone', terms);
    }

    // Sync jewelry styles
    if (syncType === 'all' || syncType === 'jewelryStyles') {
      const terms = VOCABULARY.jewelryStyles.map(t => ({ term: t, displayName: t }));
      results.jewelryStyles = await upsertTerms('jewelry_style', terms);
    }

    // Sync artists
    if (syncType === 'all' || syncType === 'artists') {
      const terms = VOCABULARY.artists.map(t => ({ term: t, displayName: t }));
      results.artists = await upsertTerms('artist', terms);
    }

    // Sync designers
    if (syncType === 'all' || syncType === 'designers') {
      const terms = VOCABULARY.designers.map(t => ({ term: t, displayName: t }));
      results.designers = await upsertTerms('designer', terms);
    }

    // Sync prints
    if (syncType === 'all' || syncType === 'prints') {
      const terms = VOCABULARY.prints.map(t => ({ term: t, displayName: t }));
      results.prints = await upsertTerms('print', terms);
    }

    // Sync color moods
    if (syncType === 'all' || syncType === 'colorMoods') {
      const terms = VOCABULARY.colorMoods.map(t => ({ term: t, displayName: t }));
      results.colorMoods = await upsertTerms('color_mood', terms);
    }

    // Sync colors with hex values
    if (syncType === 'all' || syncType === 'colors') {
      const allColors: Array<{ term: string; displayName: string; hex: string }> = [];
      
      for (const [category, colors] of Object.entries(COLORS)) {
        for (const color of colors) {
          allColors.push({
            term: color.name,
            displayName: color.name,
            hex: color.hex
          });
        }
      }
      
      results.colors = await upsertTerms('color', allColors);
    }

    // Sync hair colors
    if (syncType === 'all' || syncType === 'hairColors') {
      const terms = COLOR_ANALYSIS.hairColors.map(t => ({ term: t, displayName: t }));
      results.hairColors = await upsertTerms('hair_color', terms);
    }

    // Sync eye colors
    if (syncType === 'all' || syncType === 'eyeColors') {
      const terms = COLOR_ANALYSIS.eyeColors.map(t => ({ term: t, displayName: t }));
      results.eyeColors = await upsertTerms('eye_color', terms);
    }

    // Sync skin tones
    if (syncType === 'all' || syncType === 'skinTones') {
      const terms = COLOR_ANALYSIS.skinTones.map(t => ({ term: t, displayName: t }));
      results.skinTones = await upsertTerms('skin_tone', terms);
    }

    // Sync undertones
    if (syncType === 'all' || syncType === 'undertones') {
      const terms = COLOR_ANALYSIS.undertones.map(t => ({ term: t, displayName: t }));
      results.undertones = await upsertTerms('undertone', terms);
    }

    // Sync contrast levels
    if (syncType === 'all' || syncType === 'contrasts') {
      const terms = COLOR_ANALYSIS.contrasts.map(t => ({ term: t, displayName: t }));
      results.contrasts = await upsertTerms('contrast_level', terms);
    }

    // Sync chroma levels
    if (syncType === 'all' || syncType === 'chromas') {
      const terms = COLOR_ANALYSIS.chromas.map(t => ({ term: t, displayName: t }));
      results.chromas = await upsertTerms('chroma_level', terms);
    }

    // Calculate totals
    const totalInserted = Object.values(results).reduce((sum, r) => sum + r.inserted, 0);
    const totalUpdated = Object.values(results).reduce((sum, r) => sum + r.updated, 0);
    const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`Vocabulary sync complete: ${totalInserted} inserted, ${totalUpdated} updated, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${totalInserted} new terms, updated ${totalUpdated} existing terms`,
        results,
        totals: { inserted: totalInserted, updated: totalUpdated, errors: totalErrors }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Vocabulary sync error:", err);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
