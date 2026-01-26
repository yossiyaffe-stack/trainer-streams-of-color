/**
 * ENHANCED COLOR ANALYSIS SYSTEM
 * Detailed hair, eye, and skin color analysis with season hints
 * Based on Suzanne Caygill's method with Nechama's refinements
 */

// ============ HAIR COLOR SYSTEM ============

export interface HairColorDetail {
  name: string;
  neutral: string;
  depth: "light" | "medium" | "dark";
  warmth: "cool" | "neutral" | "warm";
  clarity: "clear" | "muted" | "ash";
  seasonHints: string[];
}

export const HAIR_COLORS: Record<string, Record<string, HairColorDetail>> = {
  black: {
    blue_black: { name: "Blue-Black", neutral: "Jet Black", depth: "dark", warmth: "cool", clarity: "clear", seasonHints: ["winter"] },
    soft_black: { name: "Soft Black", neutral: "Off Black", depth: "dark", warmth: "neutral", clarity: "muted", seasonHints: ["winter", "autumn"] },
    warm_black: { name: "Warm Black", neutral: "Brown-Black", depth: "dark", warmth: "warm", clarity: "clear", seasonHints: ["autumn", "winter"] },
  },
  brown: {
    espresso: { name: "Espresso", neutral: "Dark Espresso", depth: "dark", warmth: "neutral", clarity: "clear", seasonHints: ["winter", "autumn"] },
    dark_chocolate: { name: "Dark Chocolate", neutral: "Raw Umber", depth: "dark", warmth: "warm", clarity: "clear", seasonHints: ["autumn"] },
    chestnut: { name: "Chestnut", neutral: "Burnt Sienna", depth: "medium", warmth: "warm", clarity: "clear", seasonHints: ["autumn", "spring"] },
    milk_chocolate: { name: "Milk Chocolate", neutral: "Medium Brown", depth: "medium", warmth: "neutral", clarity: "muted", seasonHints: ["summer", "autumn"] },
    mousy_brown: { name: "Mousy Brown", neutral: "Taupe Brown", depth: "medium", warmth: "cool", clarity: "ash", seasonHints: ["summer"] },
    golden_brown: { name: "Golden Brown", neutral: "Raw Sienna", depth: "medium", warmth: "warm", clarity: "clear", seasonHints: ["spring", "autumn"] },
    light_brown: { name: "Light Brown", neutral: "Light Umber", depth: "light", warmth: "neutral", clarity: "muted", seasonHints: ["summer", "spring"] },
    ash_brown: { name: "Ash Brown", neutral: "Cool Taupe", depth: "medium", warmth: "cool", clarity: "ash", seasonHints: ["summer"] },
  },
  auburn: {
    deep_auburn: { name: "Deep Auburn", neutral: "Copper Brown", depth: "dark", warmth: "warm", clarity: "clear", seasonHints: ["autumn"] },
    classic_auburn: { name: "Classic Auburn", neutral: "Burnt Orange", depth: "medium", warmth: "warm", clarity: "clear", seasonHints: ["autumn"] },
    light_auburn: { name: "Light Auburn", neutral: "Copper", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["autumn", "spring"] },
  },
  red: {
    copper_red: { name: "Copper Red", neutral: "True Copper", depth: "medium", warmth: "warm", clarity: "clear", seasonHints: ["autumn"] },
    ginger: { name: "Ginger", neutral: "Orange Copper", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["autumn", "spring"] },
    strawberry: { name: "Strawberry", neutral: "Pink Copper", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["spring"] },
    titian: { name: "Titian Red", neutral: "Rich Copper", depth: "medium", warmth: "warm", clarity: "clear", seasonHints: ["autumn"] },
  },
  blonde: {
    golden_blonde: { name: "Golden Blonde", neutral: "Wheat Gold", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["spring"] },
    honey_blonde: { name: "Honey Blonde", neutral: "Honey", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["spring", "autumn"] },
    butter_blonde: { name: "Butter Blonde", neutral: "Pale Gold", depth: "light", warmth: "warm", clarity: "muted", seasonHints: ["spring"] },
    strawberry_blonde: { name: "Strawberry Blonde", neutral: "Golden Apricot", depth: "light", warmth: "warm", clarity: "clear", seasonHints: ["spring"] },
    ash_blonde: { name: "Ash Blonde", neutral: "Cool Taupe", depth: "light", warmth: "cool", clarity: "ash", seasonHints: ["summer"] },
    champagne_blonde: { name: "Champagne Blonde", neutral: "Pale Champagne", depth: "light", warmth: "neutral", clarity: "muted", seasonHints: ["summer"] },
    platinum_blonde: { name: "Platinum Blonde", neutral: "Silver White", depth: "light", warmth: "cool", clarity: "clear", seasonHints: ["winter", "summer"] },
    sandy_blonde: { name: "Sandy Blonde", neutral: "Sand", depth: "light", warmth: "neutral", clarity: "muted", seasonHints: ["summer", "spring"] },
  },
  gray: {
    silver_gray: { name: "Silver Gray", neutral: "Pewter", depth: "light", warmth: "cool", clarity: "clear", seasonHints: ["winter", "summer"] },
    steel_gray: { name: "Steel Gray", neutral: "Gunmetal", depth: "medium", warmth: "cool", clarity: "clear", seasonHints: ["winter"] },
    salt_pepper: { name: "Salt & Pepper", neutral: "Mixed Gray", depth: "medium", warmth: "neutral", clarity: "muted", seasonHints: ["summer", "winter"] },
    warm_gray: { name: "Warm Gray", neutral: "Taupe Gray", depth: "medium", warmth: "warm", clarity: "muted", seasonHints: ["autumn"] },
    pure_white: { name: "Pure White", neutral: "Snow White", depth: "light", warmth: "cool", clarity: "clear", seasonHints: ["winter"] },
  },
};

// ============ EYE COLOR SYSTEM ============

export interface EyeColorDetail {
  name: string;
  temperature: "cool" | "neutral" | "warm";
  clarity: "clear" | "soft" | "muted";
  depth: "light" | "medium" | "deep";
  patterns: string[];
  seasonHints: string[];
}

export const EYE_COLORS: Record<string, Record<string, EyeColorDetail>> = {
  blue: {
    ice_blue: { name: "Ice Blue", temperature: "cool", clarity: "clear", depth: "light", patterns: ["solid"], seasonHints: ["winter", "summer"] },
    sky_blue: { name: "Sky Blue", temperature: "cool", clarity: "clear", depth: "light", patterns: ["solid", "starburst"], seasonHints: ["summer", "spring"] },
    steel_blue: { name: "Steel Blue", temperature: "cool", clarity: "clear", depth: "medium", patterns: ["solid"], seasonHints: ["winter", "summer"] },
    soft_blue: { name: "Soft Blue", temperature: "cool", clarity: "soft", depth: "light", patterns: ["hazy"], seasonHints: ["summer"] },
    gray_blue: { name: "Gray Blue", temperature: "cool", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["summer"] },
    turquoise_blue: { name: "Turquoise Blue", temperature: "neutral", clarity: "clear", depth: "medium", patterns: ["flecks"], seasonHints: ["spring", "winter"] },
    sapphire_blue: { name: "Sapphire Blue", temperature: "cool", clarity: "clear", depth: "deep", patterns: ["solid"], seasonHints: ["winter"] },
    periwinkle: { name: "Periwinkle", temperature: "cool", clarity: "soft", depth: "light", patterns: ["mixed"], seasonHints: ["summer"] },
  },
  green: {
    emerald_green: { name: "Emerald Green", temperature: "neutral", clarity: "clear", depth: "medium", patterns: ["solid"], seasonHints: ["winter", "autumn"] },
    forest_green: { name: "Forest Green", temperature: "warm", clarity: "clear", depth: "deep", patterns: ["solid"], seasonHints: ["autumn"] },
    jade_green: { name: "Jade Green", temperature: "neutral", clarity: "clear", depth: "medium", patterns: ["solid"], seasonHints: ["spring", "autumn"] },
    olive_green: { name: "Olive Green", temperature: "warm", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["autumn"] },
    seafoam_green: { name: "Seafoam Green", temperature: "cool", clarity: "soft", depth: "light", patterns: ["hazy"], seasonHints: ["summer", "spring"] },
    grass_green: { name: "Grass Green", temperature: "warm", clarity: "clear", depth: "medium", patterns: ["flecks"], seasonHints: ["spring"] },
    teal: { name: "Teal", temperature: "cool", clarity: "clear", depth: "medium", patterns: ["solid"], seasonHints: ["winter", "summer"] },
    moss_green: { name: "Moss Green", temperature: "warm", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["autumn"] },
  },
  hazel: {
    golden_hazel: { name: "Golden Hazel", temperature: "warm", clarity: "clear", depth: "medium", patterns: ["starburst", "flecks"], seasonHints: ["autumn", "spring"] },
    green_hazel: { name: "Green Hazel", temperature: "warm", clarity: "clear", depth: "medium", patterns: ["starburst"], seasonHints: ["autumn", "spring"] },
    brown_hazel: { name: "Brown Hazel", temperature: "neutral", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["autumn"] },
    gray_hazel: { name: "Gray Hazel", temperature: "cool", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["summer"] },
    amber_hazel: { name: "Amber Hazel", temperature: "warm", clarity: "clear", depth: "light", patterns: ["starburst"], seasonHints: ["spring", "autumn"] },
  },
  brown: {
    light_brown: { name: "Light Brown", temperature: "neutral", clarity: "soft", depth: "light", patterns: ["solid"], seasonHints: ["spring", "autumn"] },
    golden_brown: { name: "Golden Brown", temperature: "warm", clarity: "clear", depth: "medium", patterns: ["flecks"], seasonHints: ["spring", "autumn"] },
    amber_brown: { name: "Amber Brown", temperature: "warm", clarity: "clear", depth: "medium", patterns: ["starburst"], seasonHints: ["autumn"] },
    chocolate_brown: { name: "Chocolate Brown", temperature: "warm", clarity: "muted", depth: "deep", patterns: ["solid"], seasonHints: ["autumn"] },
    espresso_brown: { name: "Espresso Brown", temperature: "neutral", clarity: "clear", depth: "deep", patterns: ["solid"], seasonHints: ["winter", "autumn"] },
    black_brown: { name: "Black Brown", temperature: "cool", clarity: "clear", depth: "deep", patterns: ["solid"], seasonHints: ["winter"] },
    warm_brown: { name: "Warm Brown", temperature: "warm", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["autumn", "spring"] },
    cool_brown: { name: "Cool Brown", temperature: "cool", clarity: "muted", depth: "medium", patterns: ["solid"], seasonHints: ["summer", "winter"] },
  },
  gray: {
    clear_gray: { name: "Clear Gray", temperature: "cool", clarity: "clear", depth: "light", patterns: ["solid"], seasonHints: ["winter", "summer"] },
    soft_gray: { name: "Soft Gray", temperature: "cool", clarity: "soft", depth: "light", patterns: ["hazy"], seasonHints: ["summer"] },
    charcoal_gray: { name: "Charcoal Gray", temperature: "cool", clarity: "clear", depth: "deep", patterns: ["solid"], seasonHints: ["winter"] },
    blue_gray: { name: "Blue Gray", temperature: "cool", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["summer"] },
    green_gray: { name: "Green Gray", temperature: "neutral", clarity: "muted", depth: "medium", patterns: ["mixed"], seasonHints: ["summer", "autumn"] },
  },
};

// ============ SKIN SYSTEM ============

export interface SkinDetail {
  name: string;
  undertone: "cool" | "neutral" | "warm";
  depth: "very_light" | "light" | "light_medium" | "medium" | "medium_deep" | "deep" | "very_deep";
  clarity: "clear" | "muted" | "sallow";
  cast: string;
  reactivity: "flushes_pink" | "flushes_red" | "tans_easily" | "burns_easily" | "neutral";
  seasonHints: string[];
}

export const SKIN_TYPES: Record<string, Record<string, SkinDetail>> = {
  cool: {
    porcelain_pink: { name: "Porcelain with Pink", undertone: "cool", depth: "very_light", clarity: "clear", cast: "pink", reactivity: "flushes_pink", seasonHints: ["winter", "summer"] },
    ivory_rose: { name: "Ivory with Rose", undertone: "cool", depth: "light", clarity: "clear", cast: "rose", reactivity: "flushes_pink", seasonHints: ["summer"] },
    fair_pink: { name: "Fair with Pink", undertone: "cool", depth: "light", clarity: "muted", cast: "pink", reactivity: "burns_easily", seasonHints: ["summer"] },
    beige_rose: { name: "Beige with Rose", undertone: "cool", depth: "light_medium", clarity: "muted", cast: "rose", reactivity: "neutral", seasonHints: ["summer"] },
    medium_rose: { name: "Medium with Rose", undertone: "cool", depth: "medium", clarity: "clear", cast: "rose", reactivity: "neutral", seasonHints: ["winter", "summer"] },
    olive_cool: { name: "Olive Cool", undertone: "cool", depth: "medium", clarity: "muted", cast: "gray-green", reactivity: "tans_easily", seasonHints: ["winter"] },
    deep_berry: { name: "Deep with Berry", undertone: "cool", depth: "deep", clarity: "clear", cast: "berry", reactivity: "neutral", seasonHints: ["winter"] },
    ebony_blue: { name: "Ebony with Blue", undertone: "cool", depth: "very_deep", clarity: "clear", cast: "blue", reactivity: "neutral", seasonHints: ["winter"] },
  },
  warm: {
    ivory_peach: { name: "Ivory with Peach", undertone: "warm", depth: "very_light", clarity: "clear", cast: "peach", reactivity: "burns_easily", seasonHints: ["spring"] },
    cream_golden: { name: "Cream with Golden", undertone: "warm", depth: "light", clarity: "clear", cast: "golden", reactivity: "flushes_red", seasonHints: ["spring"] },
    fair_peach: { name: "Fair with Peach", undertone: "warm", depth: "light", clarity: "muted", cast: "peach", reactivity: "burns_easily", seasonHints: ["spring"] },
    beige_golden: { name: "Beige with Golden", undertone: "warm", depth: "light_medium", clarity: "clear", cast: "golden", reactivity: "tans_easily", seasonHints: ["spring", "autumn"] },
    medium_apricot: { name: "Medium with Apricot", undertone: "warm", depth: "medium", clarity: "clear", cast: "apricot", reactivity: "tans_easily", seasonHints: ["autumn"] },
    olive_warm: { name: "Olive Warm", undertone: "warm", depth: "medium", clarity: "muted", cast: "yellow-green", reactivity: "tans_easily", seasonHints: ["autumn"] },
    caramel: { name: "Caramel", undertone: "warm", depth: "medium_deep", clarity: "clear", cast: "golden-brown", reactivity: "tans_easily", seasonHints: ["autumn"] },
    bronze: { name: "Bronze", undertone: "warm", depth: "deep", clarity: "clear", cast: "bronze", reactivity: "tans_easily", seasonHints: ["autumn"] },
    espresso_warm: { name: "Espresso Warm", undertone: "warm", depth: "very_deep", clarity: "clear", cast: "warm brown", reactivity: "neutral", seasonHints: ["autumn"] },
  },
  neutral: {
    ivory_neutral: { name: "Ivory Neutral", undertone: "neutral", depth: "very_light", clarity: "clear", cast: "balanced", reactivity: "burns_easily", seasonHints: ["spring", "summer"] },
    fair_neutral: { name: "Fair Neutral", undertone: "neutral", depth: "light", clarity: "muted", cast: "balanced", reactivity: "neutral", seasonHints: ["summer", "spring"] },
    beige_neutral: { name: "Beige Neutral", undertone: "neutral", depth: "light_medium", clarity: "muted", cast: "beige", reactivity: "neutral", seasonHints: ["summer", "autumn"] },
    medium_neutral: { name: "Medium Neutral", undertone: "neutral", depth: "medium", clarity: "muted", cast: "balanced", reactivity: "tans_easily", seasonHints: ["autumn", "summer"] },
    tan_neutral: { name: "Tan Neutral", undertone: "neutral", depth: "medium_deep", clarity: "clear", cast: "tan", reactivity: "tans_easily", seasonHints: ["autumn"] },
    deep_neutral: { name: "Deep Neutral", undertone: "neutral", depth: "deep", clarity: "clear", cast: "brown", reactivity: "neutral", seasonHints: ["winter", "autumn"] },
  },
};

// ============ CONTRAST & SATURATION ============

export interface ContrastLevel {
  name: string;
  description: string;
  examples: string;
  seasonHints: string[];
}

export const CONTRAST_LEVELS: Record<string, ContrastLevel> = {
  very_high: {
    name: "Very High Contrast",
    description: "Dramatic difference between hair, skin, and eyes. Think snow white skin with jet black hair.",
    examples: "Black hair + porcelain skin, or white hair + deep skin",
    seasonHints: ["winter"],
  },
  high: {
    name: "High Contrast",
    description: "Strong distinction between features, but not extreme.",
    examples: "Dark brown hair + fair skin + bright eyes",
    seasonHints: ["winter", "spring"],
  },
  medium_high: {
    name: "Medium-High Contrast",
    description: "Noticeable difference but with some blending.",
    examples: "Medium brown hair + light skin + clear eyes",
    seasonHints: ["spring", "winter"],
  },
  medium: {
    name: "Medium Contrast",
    description: "Balanced distinction between features.",
    examples: "Brown hair + medium skin + brown eyes",
    seasonHints: ["autumn", "spring"],
  },
  medium_low: {
    name: "Medium-Low Contrast",
    description: "Features blend together somewhat.",
    examples: "Light brown hair + beige skin + soft eyes",
    seasonHints: ["summer", "autumn"],
  },
  low: {
    name: "Low Contrast",
    description: "Features are similar in depth and intensity.",
    examples: "Blonde hair + fair skin + light eyes, all in similar values",
    seasonHints: ["summer"],
  },
  very_low: {
    name: "Very Low Contrast",
    description: "All features are very close in value, creating a soft, blended look.",
    examples: "Soft blonde + pale pink skin + pale blue eyes",
    seasonHints: ["summer"],
  },
};

export interface ChromaLevel {
  name: string;
  description: string;
  colorPreference: string;
  seasonHints: string[];
}

export const CHROMA_LEVELS: Record<string, ChromaLevel> = {
  very_bright: {
    name: "Very Bright/Clear",
    description: "Your natural coloring is vivid and saturated. Colors pop on you.",
    colorPreference: "Pure, saturated colors without gray",
    seasonHints: ["winter", "spring"],
  },
  bright: {
    name: "Bright",
    description: "Clear coloring with good saturation.",
    colorPreference: "Clear colors with minimal gray",
    seasonHints: ["spring", "winter"],
  },
  medium_bright: {
    name: "Medium-Bright",
    description: "Some clarity with slight softness.",
    colorPreference: "Colors that are mostly clear",
    seasonHints: ["spring", "autumn"],
  },
  medium: {
    name: "Medium Saturation",
    description: "Balanced between bright and muted.",
    colorPreference: "Medium intensity colors",
    seasonHints: ["autumn"],
  },
  medium_soft: {
    name: "Medium-Soft",
    description: "Slightly muted, gentle coloring.",
    colorPreference: "Slightly grayed or softened colors",
    seasonHints: ["summer", "autumn"],
  },
  soft: {
    name: "Soft/Muted",
    description: "Your coloring is gentle and blended.",
    colorPreference: "Dusty, muted colors with some gray",
    seasonHints: ["summer"],
  },
  very_soft: {
    name: "Very Soft/Muted",
    description: "Extremely gentle, chalky coloring.",
    colorPreference: "Heavily muted, powdery colors",
    seasonHints: ["summer"],
  },
};

// ============ VERIFICATION TESTS ============

export interface VeinTestResult {
  name: string;
  description: string;
  temperatureHint: "cool" | "neutral" | "warm";
}

export const VEIN_TEST: Record<string, VeinTestResult> = {
  blue_purple: {
    name: "Blue/Purple Veins",
    description: "Your veins appear distinctly blue or purple on your inner wrist.",
    temperatureHint: "cool",
  },
  green: {
    name: "Green Veins",
    description: "Your veins appear greenish or olive on your inner wrist.",
    temperatureHint: "warm",
  },
  blue_green_mix: {
    name: "Mix of Blue and Green",
    description: "You see both blue and green veins, neither dominating.",
    temperatureHint: "neutral",
  },
};

export interface JewelryTestResult {
  name: string;
  description: string;
  temperatureHint: "cool" | "neutral" | "warm";
}

export const JEWELRY_TEST: Record<string, JewelryTestResult> = {
  silver_platinum: {
    name: "Silver/Platinum looks best",
    description: "Cool metals like silver, platinum, and white gold complement your skin.",
    temperatureHint: "cool",
  },
  gold_brass: {
    name: "Gold/Brass looks best",
    description: "Warm metals like yellow gold, brass, and copper flatter your skin.",
    temperatureHint: "warm",
  },
  rose_gold: {
    name: "Rose Gold looks best",
    description: "Rose gold and copper-toned metals look particularly beautiful on you.",
    temperatureHint: "neutral",
  },
  both_equally: {
    name: "Both look equally good",
    description: "You can wear both silver and gold equally well.",
    temperatureHint: "neutral",
  },
};

export interface WhiteTestResult {
  name: string;
  description: string;
  temperatureHint: "cool" | "neutral" | "warm";
}

export const WHITE_TEST: Record<string, WhiteTestResult> = {
  pure_white: {
    name: "Pure/Bright White",
    description: "Crisp, bright white makes your skin glow and looks clean against you.",
    temperatureHint: "cool",
  },
  off_white_cream: {
    name: "Off-White/Cream",
    description: "Warmer whites like ivory, cream, and eggshell look more flattering.",
    temperatureHint: "warm",
  },
  soft_white: {
    name: "Soft/Muted White",
    description: "A soft white that's neither stark nor too creamy works best.",
    temperatureHint: "neutral",
  },
};

// ============ KABBALISTIC COLORS ============

export interface KabbalisticColor {
  hebrew: string;
  sefira: string;
  kohenGarment: string;
  meaning: string;
  ibnEzra: string;
  emotional: string;
}

export const KABBALISTIC_COLORS: Record<string, KabbalisticColor> = {
  blue: {
    hebrew: "תכלת (Techelet)",
    sefira: "Chesed (Loving-kindness)",
    kohenGarment: "The Techelet thread in the Tzitzit; the Robe of the Ephod",
    meaning: "Connection to the heavens, divine protection, spiritual sight",
    ibnEzra: "Ibn Ezra associated blue with the sky—the bridge between earth and the Divine",
    emotional: "Peace, trust, spiritual depth, expansiveness"
  },
  purple: {
    hebrew: "ארגמן (Argaman)",
    sefira: "Yesod (Foundation)",
    kohenGarment: "Woven into the Ephod and Choshen (Breastplate)",
    meaning: "Royalty, spiritual leadership, the meeting of heaven and earth",
    ibnEzra: "The color of kings, representing dominion blessed by Heaven",
    emotional: "Nobility, transformation, spiritual authority"
  },
  red: {
    hebrew: "אדום (Adom) / תולעת שני (Tola'at Shani)",
    sefira: "Gevurah (Strength/Judgment)",
    kohenGarment: "The crimson thread in the Ephod; the scarlet of purification",
    meaning: "Life force, passion, the blood of sacrifice and atonement",
    ibnEzra: "Red represents the vitality of life and the power of transformation",
    emotional: "Courage, vitality, passion, protective strength"
  },
  white: {
    hebrew: "לבן (Lavan)",
    sefira: "Keter (Crown) / Chochmah (Wisdom)",
    kohenGarment: "The linen garments worn on Yom Kippur",
    meaning: "Purity, the highest spiritual state, return to essence",
    ibnEzra: "White contains all colors in potential—the state before differentiation",
    emotional: "Purity, new beginnings, clarity, spiritual renewal"
  },
  gold: {
    hebrew: "זהב (Zahav)",
    sefira: "Tiferet (Beauty/Harmony)",
    kohenGarment: "The golden threads throughout; the Tzitz (forehead plate)",
    meaning: "Divine light, refined character, the illumination of Torah",
    ibnEzra: "Gold represents that which has been purified through fire",
    emotional: "Wisdom, success, divine favor, inner radiance"
  },
  green: {
    hebrew: "ירוק (Yarok)",
    sefira: "Netzach (Eternity/Victory)",
    kohenGarment: "The emerald (Nofech) in the Choshen",
    meaning: "Growth, renewal, the vitality of creation",
    ibnEzra: "Green is the color of vegetation—God's constant renewal of the world",
    emotional: "Growth, healing, hope, natural balance"
  },
  black: {
    hebrew: "שחור (Shachor)",
    sefira: "Malchut (Kingdom) in its hidden aspect",
    kohenGarment: "Not worn by the Kohen—represents the concealed",
    meaning: "The hidden, the potential, the womb of creation before light",
    ibnEzra: "Black is not absence but potentiality—the state before revelation",
    emotional: "Mystery, protection, depth, grounding in the hidden"
  }
};

// ============ HELPER FUNCTIONS ============

export function getHairColorsByCategory(category: string): HairColorDetail[] {
  return Object.values(HAIR_COLORS[category] || {});
}

export function getEyeColorsByCategory(category: string): EyeColorDetail[] {
  return Object.values(EYE_COLORS[category] || {});
}

export function getSkinTypesByUndertone(undertone: string): SkinDetail[] {
  return Object.values(SKIN_TYPES[undertone] || {});
}

export function getAllHairCategories(): string[] {
  return Object.keys(HAIR_COLORS);
}

export function getAllEyeCategories(): string[] {
  return Object.keys(EYE_COLORS);
}

export function getAllSkinUndertones(): string[] {
  return Object.keys(SKIN_TYPES);
}
