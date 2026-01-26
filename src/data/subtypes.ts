// Complete subtype definitions extracted from Nechama Yaffe's methodology
// This is a subset - the full data will be loaded from the database

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Subtype {
  id: string;
  name: string;
  season: Season;
  palette: {
    skinTones?: string[];
    formal?: string[];
    romantic?: string[];
    neutral?: string[];
    enlivened?: string[];
    highShade?: string[];
    pastels?: string[];
    metals?: string[];
    colors?: string[];
  };
  colorCombinations: string[];
  paletteEffects: string[];
  fabrics: string[];
  prints: string[];
}

export const SEASONS: { id: Season; name: string; description: string; gradient: string }[] = [
  {
    id: 'spring',
    name: 'Spring',
    description: 'Warm, clear, and light. Fresh like new blossoms with golden undertones.',
    gradient: 'from-amber-200 via-yellow-200 to-lime-200',
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Cool, soft, and muted. Gentle like morning mist with rose undertones.',
    gradient: 'from-blue-200 via-purple-200 to-pink-200',
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Warm, muted, and deep. Rich like harvest with earthy undertones.',
    gradient: 'from-orange-300 via-amber-400 to-red-400',
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Cool, clear, and high contrast. Dramatic like starlight with blue undertones.',
    gradient: 'from-purple-400 via-blue-400 to-cyan-400',
  },
];

export const SAMPLE_SUBTYPES: Subtype[] = [
  // Spring
  {
    id: 'french-spring',
    name: 'French Spring',
    season: 'spring',
    palette: {
      skinTones: ['Geranium Pink', 'Pink Peach', 'Ballet Pink', 'White'],
      romantic: ['Coral Pink', 'Rose Pink', 'Red and White'],
      formal: ['Midnight Blue', 'Navy', 'Blue Purple'],
      metals: ['Rose Gold', 'Silver'],
    },
    colorCombinations: ['Geranium and White', 'Red and White', 'Navy and White'],
    paletteEffects: ['Gardenia Summer', 'Southern Belle', 'Milk Maiden', 'Gibson Girl'],
    fabrics: ['Organza', 'Muslin', 'Cotton', 'Taffeta', 'Fine Tweed', 'Velvet'],
    prints: ['Gardenias', 'Dogwood', 'Jasmine', 'Small Roses', 'Butterflies'],
  },
  {
    id: 'island-spring',
    name: 'Island Spring',
    season: 'spring',
    palette: {
      skinTones: ['Coral', 'Apricot', 'Peach Cream', 'Golden Cream'],
      romantic: ['Coral', 'Salmon Pink', 'Warm Pink'],
      formal: ['Teal', 'Turquoise', 'Aquamarine'],
      metals: ['Yellow Gold', 'Coral Beads'],
    },
    colorCombinations: ['Coral and Turquoise', 'Teal and Gold', 'Salmon and Aqua'],
    paletteEffects: ['Tropical Paradise', 'Caribbean Dawn', 'Island Sunset'],
    fabrics: ['Cotton', 'Linen', 'Silk', 'Bamboo fiber'],
    prints: ['Tropical Flowers', 'Palm Leaves', 'Shell motifs'],
  },
  // Summer
  {
    id: 'tea-rose-summer',
    name: 'Tea Rose Summer',
    season: 'summer',
    palette: {
      skinTones: ['Rose Pink', 'Mauve', 'Porcelain Pink'],
      romantic: ['Dusty Rose', 'Lavender', 'Soft Mauve'],
      formal: ['Slate Blue', 'Soft Navy', 'Pewter'],
      metals: ['Silver', 'White Gold'],
    },
    colorCombinations: ['Rose and Silver', 'Mauve and Grey', 'Lavender and Blue'],
    paletteEffects: ['English Garden', 'Victorian Romance', 'Tea Party'],
    fabrics: ['Chiffon', 'Georgette', 'Lace', 'Fine Cotton'],
    prints: ['Roses', 'Soft florals', 'Watercolor prints'],
  },
  {
    id: 'moonlit-summer',
    name: 'Moonlit Summer',
    season: 'summer',
    palette: {
      skinTones: ['Cool Beige', 'Rose', 'Porcelain'],
      romantic: ['Soft Pink', 'Periwinkle', 'Lavender Grey'],
      formal: ['Charcoal', 'Navy', 'Cool Brown'],
      metals: ['Silver', 'Platinum'],
    },
    colorCombinations: ['Grey and Pink', 'Navy and Silver', 'Blue and Lavender'],
    paletteEffects: ['Moonlight Sonata', 'Starry Night', 'Cool Mist'],
    fabrics: ['Silk', 'Satin', 'Velvet', 'Cashmere'],
    prints: ['Stars', 'Celestial motifs', 'Abstract waves'],
  },
  // Autumn
  {
    id: 'auburn-autumn',
    name: 'Auburn Autumn',
    season: 'autumn',
    palette: {
      colors: ['Prussian Blue', 'Blue-Green', 'Dark Emerald', 'Hunter', 'Bronze Green', 'Terra Cotta', 'Amber', 'Topaz', 'Chocolate Brown'],
    },
    colorCombinations: ['Burnt Orange, Amber and Cream', 'Emerald and Cream', 'Prussian Blue and Terra Cotta'],
    paletteEffects: ['Mid Autumn', 'Woods and Pine Trees', 'Knight\'s Armour', 'Persian Carpet'],
    fabrics: ['Velvet', 'Tweed', 'Herringbone', 'Blanket wool', 'Aran Knits'],
    prints: ['Herringbone', 'American Indian designs', 'Geometric prints', 'Paisley'],
  },
  {
    id: 'burnished-autumn',
    name: 'Burnished Autumn',
    season: 'autumn',
    palette: {
      skinTones: ['Terra Cotta', 'Apricot', 'Apricot Cream', 'Cream'],
      formal: ['Blue-Black', 'Midnight Blue', 'Prussian Blue', 'Chocolate'],
      romantic: ['Burgundy', 'Maroon', 'Brick Red'],
      metals: ['Copper', 'Antique Gold', 'Bronze'],
    },
    colorCombinations: ['Terra Cotta and Cream', 'Emerald, Midnight and Copper', 'Copper, Olive Green and Cream'],
    paletteEffects: ['Mediterranean', 'Portuguese Mosaic', 'Spanish Desert'],
    fabrics: ['Shantung', 'Fine Lace', 'Satin', 'Linen', 'Cashmere'],
    prints: ['Sari Motifs', 'Indian prints', 'Paisley', 'Palm Trees'],
  },
  // Winter
  {
    id: 'burnished-winter',
    name: 'Burnished Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Blue-Black', 'Midnight Blue', 'Charcoal'],
      neutral: ['Pewter', 'Gunmetal', 'Grey', 'Brown-Grey'],
      romantic: ['Burgundy', 'Wine', 'Sangria', 'Maroon'],
      metals: ['Antique Gold', 'Pewter', 'Silver', 'Platinum'],
    },
    colorCombinations: ['Midnight Blue and Gold', 'Burgundy, Cream and Emerald', 'Charcoal, Silver and Cream'],
    paletteEffects: ['Winter Sunset', 'Medieval Knight', 'Spanish Renaissance', 'Antique Tapestry'],
    fabrics: ['Velvet', 'Brocade', 'Tapestry', 'Silk Shantung', 'Satin'],
    prints: ['Paisley', 'Brocade patterns', 'Tapestry designs', 'Herringbone'],
  },
  {
    id: 'cameo-winter',
    name: 'Cameo Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Navy Blue', 'Midnight Blue', 'Charcoal'],
      neutral: ['Silver Grey', 'Pewter', 'Dove Grey', 'Taupe'],
      romantic: ['Rose', 'Dusty Pink', 'Mauve'],
      metals: ['Silver', 'White Gold', 'Platinum'],
    },
    colorCombinations: ['Black and White', 'Navy and Silver', 'Grey and Rose'],
    paletteEffects: ['Porcelain Elegance', 'Victorian Portrait', 'Art Deco'],
    fabrics: ['Silk', 'Satin', 'Crepe', 'Fine Wool'],
    prints: ['Cameo motifs', 'Art Deco patterns', 'Geometric'],
  },
];

export const getSeasonColor = (season: Season): string => {
  const colors = {
    spring: 'bg-spring',
    summer: 'bg-summer',
    autumn: 'bg-autumn',
    winter: 'bg-winter',
  };
  return colors[season];
};

export const getSeasonBadge = (season: Season): string => {
  const badges = {
    spring: 'badge-spring',
    summer: 'badge-summer',
    autumn: 'badge-autumn',
    winter: 'badge-winter',
  };
  return badges[season];
};
