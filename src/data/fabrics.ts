/**
 * STREAMS OF COLOR - FABRIC DATABASE & MATCHING
 * Complete fabric analysis system for "Is This My Color?" tool
 */

// =============================================================================
// TYPES
// =============================================================================

export interface Fabric {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  characteristics: string[];
  formalityLevel: string;
  careLevel: string;
  quality?: string;
}

export interface SubtypeFabricProfile {
  subtype: string;
  name: string;
  season: string;
  perfect: string[];
  good: string[];
  avoid: string[];
  notes: string;
}

export interface FabricRecommendation {
  status: "perfect" | "good" | "avoid" | "neutral" | "unknown";
  emoji: string;
  headline: string;
  message: string;
  detail?: string;
  alternatives?: string[];
}

// =============================================================================
// FABRIC DATABASE
// =============================================================================

export const FABRICS: Record<string, Fabric> = {
  // NATURAL FIBERS
  silk: {
    id: "silk",
    name: "Silk",
    category: "natural",
    keywords: ["silk", "charmeuse", "dupioni", "habotai", "crepe de chine", "silk blend", "100% silk", "pure silk", "mulberry silk"],
    characteristics: ["lustrous", "flowing", "elegant", "lightweight"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  cotton: {
    id: "cotton",
    name: "Cotton",
    category: "natural",
    keywords: ["cotton", "poplin", "broadcloth", "percale", "cotton blend", "100% cotton", "pure cotton", "organic cotton"],
    characteristics: ["breathable", "crisp", "comfortable", "versatile"],
    formalityLevel: "casual",
    careLevel: "easy"
  },
  fineCotton: {
    id: "fineCotton",
    name: "Fine Cotton",
    category: "natural",
    keywords: ["pima", "pima cotton", "egyptian cotton", "supima", "sea island cotton", "swiss cotton", "fine cotton"],
    characteristics: ["soft", "refined", "quality", "smooth"],
    formalityLevel: "smart casual",
    careLevel: "moderate"
  },
  linen: {
    id: "linen",
    name: "Linen",
    category: "natural",
    keywords: ["linen", "flax", "100% linen", "pure linen", "linen blend", "belgian linen", "irish linen"],
    characteristics: ["textured", "breathable", "relaxed", "natural"],
    formalityLevel: "casual",
    careLevel: "moderate"
  },
  wool: {
    id: "wool",
    name: "Wool",
    category: "natural",
    keywords: ["wool", "merino", "lambswool", "virgin wool", "100% wool", "pure wool", "wool blend", "italian wool"],
    characteristics: ["warm", "structured", "classic", "durable"],
    formalityLevel: "versatile",
    careLevel: "moderate"
  },
  cashmere: {
    id: "cashmere",
    name: "Cashmere",
    category: "natural",
    keywords: ["cashmere", "kashmir", "100% cashmere", "pure cashmere", "cashmere blend", "mongolian cashmere"],
    characteristics: ["luxurious", "soft", "refined", "lightweight warm"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  mohair: {
    id: "mohair",
    name: "Mohair",
    category: "natural",
    keywords: ["mohair", "kid mohair", "mohair blend"],
    characteristics: ["fluffy", "lustrous", "warm", "textured"],
    formalityLevel: "smart casual",
    careLevel: "delicate"
  },
  alpaca: {
    id: "alpaca",
    name: "Alpaca",
    category: "natural",
    keywords: ["alpaca", "baby alpaca", "alpaca blend", "peruvian alpaca"],
    characteristics: ["soft", "warm", "hypoallergenic", "luxurious"],
    formalityLevel: "smart casual",
    careLevel: "moderate"
  },
  angora: {
    id: "angora",
    name: "Angora",
    category: "natural",
    keywords: ["angora", "angora rabbit", "angora wool"],
    characteristics: ["soft", "fluffy", "warm", "delicate"],
    formalityLevel: "smart casual",
    careLevel: "delicate"
  },

  // TEXTURED FABRICS
  velvet: {
    id: "velvet",
    name: "Velvet",
    category: "textured",
    keywords: ["velvet", "velour", "panne velvet", "crushed velvet", "silk velvet", "cotton velvet", "velveteen"],
    characteristics: ["rich", "luxurious", "depth", "soft"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  suede: {
    id: "suede",
    name: "Suede",
    category: "textured",
    keywords: ["suede", "nubuck", "sueded", "faux suede", "microsuede", "ultrasuede"],
    characteristics: ["soft", "matte", "tactile", "casual luxury"],
    formalityLevel: "smart casual",
    careLevel: "delicate"
  },
  leather: {
    id: "leather",
    name: "Leather",
    category: "textured",
    keywords: ["leather", "nappa", "lambskin", "cowhide", "genuine leather", "real leather", "full grain", "top grain"],
    characteristics: ["structured", "durable", "classic", "sophisticated"],
    formalityLevel: "versatile",
    careLevel: "moderate"
  },
  corduroy: {
    id: "corduroy",
    name: "Corduroy",
    category: "textured",
    keywords: ["corduroy", "cord", "pinwale", "wide wale", "fine wale", "needlecord"],
    characteristics: ["textured", "casual", "warm", "nostalgic"],
    formalityLevel: "casual",
    careLevel: "easy"
  },
  tweed: {
    id: "tweed",
    name: "Tweed",
    category: "textured",
    keywords: ["tweed", "harris tweed", "donegal", "herringbone", "houndstooth tweed", "scottish tweed"],
    characteristics: ["textured", "rustic", "heritage", "structured"],
    formalityLevel: "smart casual",
    careLevel: "moderate"
  },
  boucle: {
    id: "boucle",
    name: "Bouclé",
    category: "textured",
    keywords: ["boucle", "bouclé", "nubby", "looped", "boucle tweed"],
    characteristics: ["textured", "soft", "chanel-esque", "feminine"],
    formalityLevel: "dressy",
    careLevel: "moderate"
  },

  // SHEER & DELICATE
  chiffon: {
    id: "chiffon",
    name: "Chiffon",
    category: "sheer",
    keywords: ["chiffon", "silk chiffon", "georgette chiffon"],
    characteristics: ["flowing", "ethereal", "romantic", "lightweight"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  georgette: {
    id: "georgette",
    name: "Georgette",
    category: "sheer",
    keywords: ["georgette", "crepe georgette"],
    characteristics: ["flowing", "slightly textured", "elegant"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  organza: {
    id: "organza",
    name: "Organza",
    category: "sheer",
    keywords: ["organza", "silk organza"],
    characteristics: ["crisp", "sheer", "structured", "formal"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },
  tulle: {
    id: "tulle",
    name: "Tulle",
    category: "sheer",
    keywords: ["tulle", "net", "netting", "illusion"],
    characteristics: ["airy", "romantic", "layered", "whimsical"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },
  lace: {
    id: "lace",
    name: "Lace",
    category: "sheer",
    keywords: ["lace", "guipure", "chantilly", "alencon", "venetian lace", "french lace", "eyelash lace", "crochet lace"],
    characteristics: ["romantic", "delicate", "feminine", "intricate"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  eyelet: {
    id: "eyelet",
    name: "Eyelet",
    category: "sheer",
    keywords: ["eyelet", "broderie anglaise", "embroidered cotton", "cutwork"],
    characteristics: ["fresh", "romantic", "summery", "feminine"],
    formalityLevel: "smart casual",
    careLevel: "moderate"
  },

  // SATINS & SHEENS
  satin: {
    id: "satin",
    name: "Satin",
    category: "sheen",
    keywords: ["satin", "sateen", "duchess satin", "bridal satin", "silk satin", "charmeuse satin"],
    characteristics: ["lustrous", "smooth", "elegant", "formal"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },
  charmeuse: {
    id: "charmeuse",
    name: "Charmeuse",
    category: "sheen",
    keywords: ["charmeuse", "silk charmeuse"],
    characteristics: ["drapey", "lustrous", "fluid", "sensual"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  taffeta: {
    id: "taffeta",
    name: "Taffeta",
    category: "sheen",
    keywords: ["taffeta", "silk taffeta", "paper taffeta"],
    characteristics: ["crisp", "rustling", "structured", "formal"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },

  // KNITS
  jersey: {
    id: "jersey",
    name: "Jersey",
    category: "knit",
    keywords: ["jersey", "t-shirt", "cotton jersey", "modal jersey", "stretch jersey"],
    characteristics: ["stretchy", "comfortable", "casual", "easy"],
    formalityLevel: "casual",
    careLevel: "easy"
  },
  fineKnit: {
    id: "fineKnit",
    name: "Fine Knit",
    category: "knit",
    keywords: ["fine gauge", "fine knit", "lightweight knit", "thin knit"],
    characteristics: ["refined", "smooth", "elegant", "polished"],
    formalityLevel: "smart casual",
    careLevel: "moderate"
  },
  chunkyKnit: {
    id: "chunkyKnit",
    name: "Chunky Knit",
    category: "knit",
    keywords: ["chunky", "cable knit", "aran", "fisherman", "thick knit", "heavy knit", "oversized knit"],
    characteristics: ["cozy", "textured", "casual", "winter"],
    formalityLevel: "casual",
    careLevel: "moderate"
  },

  // DENIM & CASUAL
  denim: {
    id: "denim",
    name: "Denim",
    category: "casual",
    keywords: ["denim", "jeans", "jean", "dark denim", "raw denim", "selvedge", "indigo"],
    characteristics: ["durable", "casual", "classic", "versatile"],
    formalityLevel: "casual",
    careLevel: "easy"
  },
  chambray: {
    id: "chambray",
    name: "Chambray",
    category: "casual",
    keywords: ["chambray", "light denim"],
    characteristics: ["soft", "casual", "breathable", "summery"],
    formalityLevel: "casual",
    careLevel: "easy"
  },
  canvas: {
    id: "canvas",
    name: "Canvas",
    category: "casual",
    keywords: ["canvas", "duck", "duck canvas", "heavy cotton"],
    characteristics: ["sturdy", "casual", "utilitarian", "durable"],
    formalityLevel: "casual",
    careLevel: "easy"
  },

  // DECORATIVE
  brocade: {
    id: "brocade",
    name: "Brocade",
    category: "decorative",
    keywords: ["brocade", "jacquard", "damask", "matelassé"],
    characteristics: ["ornate", "rich", "formal", "textured"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },
  embroidered: {
    id: "embroidered",
    name: "Embroidered",
    category: "decorative",
    keywords: ["embroidered", "embroidery", "beaded embroidery"],
    characteristics: ["detailed", "artisan", "special", "unique"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },
  sequined: {
    id: "sequined",
    name: "Sequined",
    category: "decorative",
    keywords: ["sequin", "sequined", "beaded", "paillette"],
    characteristics: ["sparkly", "festive", "glamorous", "statement"],
    formalityLevel: "formal",
    careLevel: "delicate"
  },
  metallic: {
    id: "metallic",
    name: "Metallic",
    category: "decorative",
    keywords: ["metallic", "lamé", "lurex", "gold thread", "silver thread"],
    characteristics: ["shiny", "festive", "bold", "statement"],
    formalityLevel: "dressy",
    careLevel: "delicate"
  },

  // SYNTHETICS
  crepe: {
    id: "crepe",
    name: "Crêpe",
    category: "synthetic",
    keywords: ["crepe", "crêpe", "crepe de chine", "moss crepe", "stretch crepe"],
    characteristics: ["textured", "drapey", "elegant", "matte"],
    formalityLevel: "dressy",
    careLevel: "moderate"
  },
  rayon: {
    id: "rayon",
    name: "Rayon",
    category: "synthetic",
    keywords: ["rayon", "viscose", "modal", "lyocell", "tencel", "cupro"],
    characteristics: ["drapey", "soft", "breathable", "silk-like"],
    formalityLevel: "versatile",
    careLevel: "moderate"
  },
};

// =============================================================================
// FABRIC PROFILES BY SUBTYPE
// =============================================================================

export const SUBTYPE_FABRICS: Record<string, SubtypeFabricProfile> = {
  // SPRING SUBTYPES
  wildflowerSpring: {
    subtype: "wildflowerSpring",
    name: "Wildflower Spring",
    season: "spring",
    perfect: ["silk", "fineCotton", "chiffon", "eyelet", "lace", "cotton", "linen"],
    good: ["jersey", "crepe", "rayon", "chambray", "fineKnit", "velvet"],
    avoid: ["heavyDenim", "canvas", "chunkyKnit", "leather", "tweed", "brocade"],
    notes: "Wildflower Spring flourishes in soft, romantic fabrics with delicate textures. Think flowing silks, pretty eyelet, and fine cottons."
  },
  frenchSpring: {
    subtype: "frenchSpring",
    name: "French Spring",
    season: "spring",
    perfect: ["silk", "chiffon", "fineCotton", "lace", "crepe", "charmeuse"],
    good: ["linen", "jersey", "eyelet", "rayon", "georgette", "fineKnit"],
    avoid: ["chunkyKnit", "canvas", "tweed", "leather", "brocade", "sequined"],
    notes: "French Spring embodies Parisian elegance with refined, feminine fabrics. Soft silks, delicate lace, and quality crepes are your best friends."
  },
  earlySpring: {
    subtype: "earlySpring",
    name: "Early Spring",
    season: "spring",
    perfect: ["silk", "fineCotton", "chiffon", "cashmere", "fineKnit", "crepe"],
    good: ["cotton", "jersey", "linen", "rayon", "eyelet", "chambray"],
    avoid: ["chunkyKnit", "tweed", "brocade", "leather", "canvas", "velvet"],
    notes: "Early Spring captures the first delicate touches of the season. Light, fresh fabrics with subtle softness work beautifully."
  },

  // SUMMER SUBTYPES
  englishSummer: {
    subtype: "englishSummer",
    name: "English Summer",
    season: "summer",
    perfect: ["silk", "chiffon", "velvet", "cashmere", "lace", "fineCotton", "crepe"],
    good: ["linen", "jersey", "fineKnit", "rayon", "chambray", "eyelet"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "leather", "tweed", "nylon"],
    notes: "English Summer suits soft, romantic fabrics with understated elegance. Think garden party sophistication."
  },
  degasSummer: {
    subtype: "degasSummer",
    name: "Degas Summer",
    season: "summer",
    perfect: ["silk", "chiffon", "tulle", "organza", "velvet", "satin", "lace"],
    good: ["fineCotton", "crepe", "jersey", "cashmere", "georgette", "fineKnit"],
    avoid: ["denim", "canvas", "chunkyKnit", "leather", "tweed", "corduroy"],
    notes: "Named after the artist of ballerinas, Degas Summer shines in ethereal, dance-inspired fabrics."
  },
  ballerinaSummer: {
    subtype: "ballerinaSummer",
    name: "Ballerina Summer",
    season: "summer",
    perfect: ["silk", "tulle", "chiffon", "velvet", "satin", "lace", "organza"],
    good: ["fineCotton", "jersey", "cashmere", "crepe", "fineKnit", "eyelet"],
    avoid: ["denim", "chunkyKnit", "leather", "canvas", "tweed", "corduroy"],
    notes: "Ballerina Summer is made for graceful, flowing fabrics that move beautifully."
  },
  cameoSummer: {
    subtype: "cameoSummer",
    name: "Cameo Summer",
    season: "summer",
    perfect: ["silk", "velvet", "lace", "chiffon", "satin", "cashmere", "crepe"],
    good: ["fineCotton", "jersey", "fineKnit", "rayon", "georgette", "boucle"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "leather", "tweed", "nylon"],
    notes: "Cameo Summer evokes vintage elegance with refined, romantic fabrics."
  },
  chinoiserieSummer: {
    subtype: "chinoiserieSummer",
    name: "Chinoiserie Summer",
    season: "summer",
    perfect: ["silk", "satin", "brocade", "velvet", "chiffon", "crepe", "charmeuse"],
    good: ["fineCotton", "lace", "fineKnit", "rayon", "organza"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "corduroy", "nylon"],
    notes: "Chinoiserie Summer flourishes in luxurious fabrics with Eastern influence."
  },
  emeraldSummer: {
    subtype: "emeraldSummer",
    name: "Emerald Summer",
    season: "summer",
    perfect: ["silk", "velvet", "satin", "chiffon", "cashmere", "lace", "crepe"],
    good: ["fineCotton", "jersey", "fineKnit", "rayon", "georgette", "charmeuse"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "leather", "nylon"],
    notes: "Emerald Summer glows in rich, luxurious fabrics with depth and elegance."
  },
  porcelainSummer: {
    subtype: "porcelainSummer",
    name: "Porcelain Summer",
    season: "summer",
    perfect: ["silk", "velvet", "chiffon", "satin", "lace", "cashmere", "organza"],
    good: ["fineCotton", "crepe", "jersey", "fineKnit", "charmeuse", "georgette"],
    avoid: ["chunkyKnit", "heavyDenim", "canvas", "tweed", "corduroy", "nylon"],
    notes: "Porcelain Summer is pure elegance in soft, refined fabrics."
  },
  roseGoldSummer: {
    subtype: "roseGoldSummer",
    name: "Rose Gold Summer",
    season: "summer",
    perfect: ["silk", "velvet", "satin", "chiffon", "cashmere", "lace", "charmeuse"],
    good: ["fineCotton", "crepe", "jersey", "fineKnit", "rayon", "georgette"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "corduroy", "nylon"],
    notes: "Rose Gold Summer glows in warm, luxurious fabrics with subtle luster."
  },
  summerRose: {
    subtype: "summerRose",
    name: "Summer Rose",
    season: "summer",
    perfect: ["silk", "velvet", "chiffon", "lace", "satin", "crepe", "cashmere"],
    good: ["fineCotton", "jersey", "fineKnit", "rayon", "georgette", "eyelet"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "leather", "nylon"],
    notes: "Summer Rose blooms in romantic, soft fabrics with subtle luster."
  },
  waterLilySummer: {
    subtype: "waterLilySummer",
    name: "Water Lily Summer",
    season: "summer",
    perfect: ["silk", "chiffon", "velvet", "crepe", "georgette", "charmeuse", "lace"],
    good: ["fineCotton", "jersey", "fineKnit", "linen", "rayon", "satin"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "leather", "corduroy"],
    notes: "Water Lily Summer thrives in flowing, fluid fabrics that echo water's movement."
  },
  duskySummer: {
    subtype: "duskySummer",
    name: "Dusky Summer",
    season: "summer",
    perfect: ["silk", "velvet", "suede", "cashmere", "lace", "crepe", "leather"],
    good: ["fineCotton", "jersey", "fineKnit", "denim", "chambray", "linen"],
    avoid: ["chunkyKnit", "canvas", "sequined", "metallic", "nylon", "polyester"],
    notes: "Dusky Summer has a romantic cowgirl edge - soft suedes, worn leather, and delicate laces."
  },
  sunsetSummer: {
    subtype: "sunsetSummer",
    name: "Sunset Summer",
    season: "summer",
    perfect: ["silk", "velvet", "cashmere", "crepe", "chiffon", "suede", "satin"],
    good: ["fineCotton", "jersey", "fineKnit", "linen", "rayon", "leather"],
    avoid: ["chunkyKnit", "canvas", "sequined", "metallic", "nylon", "polyester"],
    notes: "Sunset Summer captures late day warmth in rich, sophisticated fabrics."
  },
  iridescentSummer: {
    subtype: "iridescentSummer",
    name: "Iridescent Summer",
    season: "summer",
    perfect: ["silk", "satin", "charmeuse", "organza", "chiffon", "velvet", "taffeta"],
    good: ["fineCotton", "crepe", "fineKnit", "rayon", "lace", "georgette"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "tweed", "corduroy"],
    notes: "Iridescent Summer shimmers in fabrics with subtle light play."
  },

  // AUTUMN SUBTYPES
  renaissanceAutumn: {
    subtype: "renaissanceAutumn",
    name: "Renaissance Autumn",
    season: "autumn",
    perfect: ["velvet", "suede", "leather", "cashmere", "tweed", "brocade", "wool"],
    good: ["silk", "corduroy", "linen", "denim", "crepe", "fineKnit", "jersey"],
    avoid: ["sequined", "metallic", "nylon", "tulle", "organza"],
    notes: "Renaissance Autumn embodies medieval richness - velvet, brocade, and sumptuous suedes."
  },
  mellowAutumn: {
    subtype: "mellowAutumn",
    name: "Mellow Autumn",
    season: "autumn",
    perfect: ["cashmere", "suede", "velvet", "silk", "wool", "fineKnit", "crepe"],
    good: ["linen", "cotton", "jersey", "leather", "corduroy", "rayon"],
    avoid: ["sequined", "metallic", "chunkyKnit", "nylon", "tulle"],
    notes: "Mellow Autumn suits soft, warm fabrics with understated luxury."
  },
  burnishedAutumn: {
    subtype: "burnishedAutumn",
    name: "Burnished Autumn",
    season: "autumn",
    perfect: ["leather", "suede", "velvet", "silk", "cashmere", "brocade", "wool"],
    good: ["tweed", "corduroy", "linen", "cotton", "denim", "fineKnit"],
    avoid: ["sequined", "nylon", "tulle", "organza", "polyester", "metallic"],
    notes: "Burnished Autumn glows in warm, rich fabrics with Mediterranean influence."
  },
  topazAutumn: {
    subtype: "topazAutumn",
    name: "Topaz Autumn",
    season: "autumn",
    perfect: ["silk", "cashmere", "velvet", "suede", "leather", "wool", "crepe"],
    good: ["linen", "cotton", "fineKnit", "jersey", "tweed", "corduroy"],
    avoid: ["sequined", "metallic", "nylon", "tulle", "chunkyKnit"],
    notes: "Topaz Autumn sparkles in warm, quality fabrics."
  },
  cloisonneAutumn: {
    subtype: "cloisonneAutumn",
    name: "Cloisonné Autumn",
    season: "autumn",
    perfect: ["silk", "velvet", "brocade", "satin", "cashmere", "embroidered"],
    good: ["crepe", "wool", "fineKnit", "suede", "leather", "lace"],
    avoid: ["chunkyKnit", "canvas", "heavyDenim", "nylon", "polyester"],
    notes: "Cloisonné Autumn flourishes in ornate, artistic fabrics."
  },
  multiColoredAutumn: {
    subtype: "multiColoredAutumn",
    name: "Multi-Colored Autumn",
    season: "autumn",
    perfect: ["silk", "velvet", "brocade", "embroidered", "cashmere", "wool"],
    good: ["tweed", "leather", "suede", "crepe", "fineKnit", "linen"],
    avoid: ["polyester", "nylon", "jersey", "canvas"],
    notes: "Multi-Colored Autumn shines in rich, complex fabrics."
  },
  persianAutumn: {
    subtype: "persianAutumn",
    name: "Persian Autumn",
    season: "autumn",
    perfect: ["silk", "velvet", "brocade", "cashmere", "leather", "embroidered", "satin"],
    good: ["wool", "suede", "crepe", "fineKnit", "tweed"],
    avoid: ["polyester", "nylon", "chunkyKnit", "canvas"],
    notes: "Persian Autumn evokes Silk Road luxury - rich brocades, sumptuous velvets, and ornate embroideries."
  },
  tapestryAutumn: {
    subtype: "tapestryAutumn",
    name: "Tapestry Autumn",
    season: "autumn",
    perfect: ["velvet", "brocade", "silk", "wool", "cashmere", "embroidered"],
    good: ["tweed", "leather", "suede", "corduroy", "crepe", "fineKnit"],
    avoid: ["polyester", "nylon", "tulle", "organza", "sequined"],
    notes: "Tapestry Autumn is made for rich, woven fabrics with depth and history."
  },

  // WINTER SUBTYPES
  emeraldWinter: {
    subtype: "emeraldWinter",
    name: "Emerald Winter",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "cashmere", "leather", "wool", "brocade"],
    good: ["crepe", "fineKnit", "suede", "jersey", "taffeta", "charmeuse"],
    avoid: ["chunkyKnit", "canvas", "fleece"],
    notes: "Emerald Winter commands rich, luxurious fabrics with depth."
  },
  silkRoadWinter: {
    subtype: "silkRoadWinter",
    name: "Silk Road Winter",
    season: "winter",
    perfect: ["silk", "velvet", "brocade", "cashmere", "satin", "embroidered"],
    good: ["wool", "leather", "crepe", "fineKnit", "charmeuse", "suede"],
    avoid: ["chunkyKnit", "canvas", "fleece", "polyester", "nylon"],
    notes: "Silk Road Winter evokes ancient trade route luxury."
  },
  exoticWinter: {
    subtype: "exoticWinter",
    name: "Exotic Winter",
    season: "winter",
    perfect: ["silk", "velvet", "satin", "leather", "cashmere", "brocade", "sequined"],
    good: ["wool", "crepe", "fineKnit", "suede", "taffeta", "metallic"],
    avoid: ["chunkyKnit", "canvas", "fleece"],
    notes: "Exotic Winter dazzles in bold, luxurious fabrics."
  },
  fairyTaleWinter: {
    subtype: "fairyTaleWinter",
    name: "Fairy Tale Winter",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "brocade", "lace", "cashmere", "taffeta"],
    good: ["wool", "crepe", "fineKnit", "suede", "leather", "chiffon"],
    avoid: ["chunkyKnit", "canvas", "fleece", "polyester"],
    notes: "Fairy Tale Winter is made for magical, romantic fabrics."
  },
  gemstoneWinter: {
    subtype: "gemstoneWinter",
    name: "Gemstone Winter",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "cashmere", "brocade", "sequined", "metallic"],
    good: ["wool", "crepe", "fineKnit", "leather", "taffeta", "charmeuse"],
    avoid: ["fleece", "canvas", "chunkyKnit"],
    notes: "Gemstone Winter sparkles in jewel-worthy fabrics."
  },
  mediterraneanWinter: {
    subtype: "mediterraneanWinter",
    name: "Mediterranean Winter",
    season: "winter",
    perfect: ["silk", "velvet", "leather", "cashmere", "wool", "brocade", "satin"],
    good: ["suede", "crepe", "fineKnit", "linen", "denim", "embroidered"],
    avoid: ["fleece", "nylon", "chunkyKnit", "canvas", "polyester", "tulle"],
    notes: "Mediterranean Winter suits warm, luxurious fabrics with Southern European flair."
  },
  multiColoredWinter: {
    subtype: "multiColoredWinter",
    name: "Multi-Colored Winter",
    season: "winter",
    perfect: ["silk", "velvet", "brocade", "satin", "embroidered", "sequined"],
    good: ["cashmere", "wool", "crepe", "fineKnit", "leather", "taffeta"],
    avoid: ["polyester", "fleece", "canvas"],
    notes: "Multi-Colored Winter shines in complex, rich fabrics."
  },
  ornamentalWinter: {
    subtype: "ornamentalWinter",
    name: "Ornamental Winter",
    season: "winter",
    perfect: ["brocade", "velvet", "silk", "satin", "embroidered", "sequined", "metallic"],
    good: ["cashmere", "wool", "crepe", "taffeta", "lace"],
    avoid: ["polyester", "fleece", "canvas", "chunkyKnit"],
    notes: "Ornamental Winter is made for decorative, statement fabrics."
  },
  tapestryWinter: {
    subtype: "tapestryWinter",
    name: "Tapestry Winter",
    season: "winter",
    perfect: ["velvet", "brocade", "silk", "wool", "embroidered"],
    good: ["cashmere", "leather", "satin", "crepe", "fineKnit", "suede"],
    avoid: ["polyester", "fleece", "canvas", "nylon"],
    notes: "Tapestry Winter commands rich, woven fabrics with historical depth."
  },
  crystalWinter: {
    subtype: "crystalWinter",
    name: "Crystal Winter",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "cashmere", "lace", "sequined"],
    good: ["wool", "crepe", "fineKnit", "taffeta", "charmeuse", "metallic"],
    avoid: ["chunkyKnit", "canvas", "fleece", "corduroy"],
    notes: "Crystal Winter shines in fabrics with clarity and sparkle."
  },
  winterRose: {
    subtype: "winterRose",
    name: "Winter Rose",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "cashmere", "lace", "chiffon", "crepe"],
    good: ["wool", "fineKnit", "taffeta", "charmeuse", "georgette", "brocade"],
    avoid: ["chunkyKnit", "canvas", "fleece"],
    notes: "Winter Rose blooms in romantic yet dramatic fabrics."
  },
  burnishedWinter: {
    subtype: "burnishedWinter",
    name: "Burnished Winter",
    season: "winter",
    perfect: ["leather", "velvet", "silk", "cashmere", "suede", "wool", "satin"],
    good: ["crepe", "fineKnit", "brocade", "denim", "tweed", "linen"],
    avoid: ["fleece", "nylon", "sequined", "chunkyKnit", "canvas", "tulle"],
    notes: "Burnished Winter glows in warm, luxurious fabrics with depth."
  },
  cameoWinter: {
    subtype: "cameoWinter",
    name: "Cameo Winter",
    season: "winter",
    perfect: ["velvet", "silk", "satin", "cashmere", "lace", "crepe", "charmeuse"],
    good: ["wool", "fineKnit", "taffeta", "brocade", "georgette", "chiffon"],
    avoid: ["chunkyKnit", "canvas", "fleece"],
    notes: "Cameo Winter combines drama with vintage elegance."
  },
  grecianAutumn: {
    subtype: "grecianAutumn",
    name: "Grecian Autumn",
    season: "autumn",
    perfect: ["silk", "crepe", "cashmere", "linen", "suede", "fineKnit", "jersey"],
    good: ["velvet", "cotton", "rayon", "wool", "leather", "chiffon"],
    avoid: ["sequined", "chunkyKnit", "brocade", "tweed", "metallic", "nylon"],
    notes: "Grecian Autumn flows in draped, elegant fabrics."
  },
  auburnAutumn: {
    subtype: "auburnAutumn",
    name: "Auburn Autumn",
    season: "autumn",
    perfect: ["tweed", "leather", "suede", "velvet", "wool", "cashmere", "corduroy"],
    good: ["denim", "cotton", "linen", "fineKnit", "jersey", "silk"],
    avoid: ["sequined", "metallic", "nylon", "tulle", "organza"],
    notes: "Auburn Autumn thrives in rich, textured fabrics with depth."
  },
  sunlitAutumn: {
    subtype: "sunlitAutumn",
    name: "Sunlit Autumn",
    season: "autumn",
    perfect: ["silk", "linen", "cashmere", "suede", "velvet", "cotton", "crepe"],
    good: ["wool", "leather", "fineKnit", "jersey", "denim", "rayon"],
    avoid: ["sequined", "metallic", "nylon", "chunkyKnit", "brocade", "tulle"],
    notes: "Sunlit Autumn glows in warm, natural fabrics."
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getFabricProfile(subtypeId: string): SubtypeFabricProfile | undefined {
  // Convert kebab-case to camelCase
  const camelCaseId = subtypeId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return SUBTYPE_FABRICS[camelCaseId];
}

export function getFabricRecommendation(
  fabricId: string,
  subtypeId: string
): FabricRecommendation {
  const profile = getFabricProfile(subtypeId);
  const fabric = FABRICS[fabricId];
  
  if (!profile || !fabric) {
    return {
      status: "unknown",
      emoji: "❓",
      headline: "Unknown",
      message: "We don't have information about this combination."
    };
  }
  
  if (profile.perfect.includes(fabricId)) {
    return {
      status: "perfect",
      emoji: "✨",
      headline: "Perfect Match!",
      message: `${fabric.name} is one of your best fabrics. It will enhance your natural coloring beautifully.`,
      detail: profile.notes
    };
  }
  
  if (profile.good.includes(fabricId)) {
    return {
      status: "good",
      emoji: "👍",
      headline: "Good Choice",
      message: `${fabric.name} works well for you. A solid choice that complements your coloring.`,
      detail: profile.notes
    };
  }
  
  if (profile.avoid.includes(fabricId)) {
    return {
      status: "avoid",
      emoji: "⚠️",
      headline: "Not Your Best",
      message: `${fabric.name} may not be the most flattering choice for your coloring.`,
      alternatives: profile.perfect.slice(0, 3),
      detail: profile.notes
    };
  }
  
  return {
    status: "neutral",
    emoji: "➡️",
    headline: "Neutral",
    message: `${fabric.name} is neither particularly good nor bad for your coloring. Consider your perfect fabrics for best results.`
  };
}
