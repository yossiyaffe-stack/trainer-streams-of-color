// Complete subtype definitions from Nechama Yaffe's methodology
// Extracted from algorithm files - 40+ subtypes with full details

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface JewelryInfo {
  metals?: { perfect?: string[]; good?: string[]; avoid?: string[] };
  stones?: { perfect?: string[]; good?: string[]; avoid?: string[] };
  styles?: string[];
  types?: string[];
  inspirations?: string[];
}

export interface MakeupInfo {
  lips?: { perfect?: string[] };
  cheeks?: { perfect?: string[] };
  eyes?: { perfect?: string[] };
  mascara?: string;
  tips?: string[];
  looks?: string[];
  soft?: string;
  dramatic?: string;
  everyday?: string;
  evening?: string;
  options?: string[];
}

export interface StyleInfo {
  details?: string[];
  silhouettes?: string[];
  sleeves?: string[];
  dresses?: string[];
  skirts?: string[];
  tops?: string[];
  shoes?: string[];
  coats?: string[];
  hair?: string[];
  necklines?: string[];
  collars?: string[];
  looks?: string[];
  accessories?: string[];
  recommendations?: string[];
  overview?: string;
}

export interface Subtype {
  id: string;
  name: string;
  season: Season;
  beautyStatement?: string;
  palette: {
    skinTones?: string[];
    formal?: string[];
    romantic?: string[];
    neutral?: string[];
    neutrals?: string[];
    enlivened?: string[];
    highShade?: string[];
    highNote?: string[];
    pastels?: string[];
    metals?: string[];
    metallics?: string[];
    colors?: string[];
    hairColor?: string[];
    eyeColor?: string[];
    secondBasic?: string[];
    subdued?: string[];
    casual?: string[];
  };
  colorCombinations: string[];
  paletteEffects: string[];
  fabrics: string[];
  prints: string[];
  jewelry: JewelryInfo;
  makeup?: MakeupInfo;
  style?: StyleInfo;
  eras?: string[];
  artists?: string[];
  designers?: string[];
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

// =============================================================================
// SPRING SUBTYPES
// =============================================================================

export const SPRING_SUBTYPES: Subtype[] = [
  {
    id: 'wildflower-spring',
    name: 'Wildflower Spring',
    season: 'spring',
    beautyStatement: 'Delicate, romantic, whimsical Spring with Dutch master sensibility',
    palette: {
      skinTones: ['Blush', 'Rose', 'Pink', 'Red/White Geranium', 'Coral', 'Peach', 'Pale Peach'],
      neutrals: ['Caramel', 'Golden Brown', 'Green/Brown', 'Amber', 'Cocoa', 'Grey/Brown', 'Fawn', 'Cordovan'],
      formal: ['Indigo', 'Navy', 'Denim'],
      romantic: ['Coral', 'Rose', 'Pink'],
      hairColor: ['Caramel', 'Golden Brown', 'Amber', 'Cocoa'],
      enlivened: ['Kelly Green', 'Soft Emerald', 'Seafoam', 'Mint', 'Moss'],
      pastels: ['Vanilla', 'Ivory', 'Lemon Yellow', 'Buttercream', 'Pink/Cream'],
      highNote: ['Periwinkle', 'Blueberry', 'Baby Blue', 'Sky Blue'],
      metallics: ['Gold', 'Silver'],
    },
    colorCombinations: [
      'Cream, Lemon Yellow and Blush',
      'Black Velvet, Silver and Ivory',
      'Seafoam and Emerald',
      'Geranium and Cocoa',
      'Rose, Lilac and Fawn',
      'Caramel, Chocolate and Cream',
      'Lavender and Gold',
      'Coral and Aqua',
    ],
    fabrics: ['Tulle Trim', 'Ruched Fabric', 'Embroidery', 'Appliqué', 'Floral Print', 'Crocheted Lace', 'Eyelet', 'Paisley', 'Suede', 'Velvet', 'Small Tweeds', 'Gingham', 'Patchwork'],
    prints: ['Florals', 'Butterflies', 'Whimsical Prints', 'Dutch Knits', 'Trompe L\'oeil', 'Purple/Blue/Green Plaid'],
    paletteEffects: ['Girl with a Pearl Earring', 'Fawn in a Field of Wildflowers', 'Bouquet of Flowers in a Vase', 'Milk Maiden'],
    style: {
      details: ['Romantic layers', 'Whimsical accessories', 'Soft textures'],
    },
    jewelry: {
      styles: ['Enamel', 'Cloisonné', 'Wildflowers', 'Whimsical Charms', 'Clover', 'Celtic Knots', 'Pearls', 'Fleur-de-lis'],
      metals: { perfect: ['Gold', 'Silver'] },
      stones: { perfect: ['Pearl', 'Blue Topaz', 'Amethyst'] },
    },
    eras: ['1600s Dutch', 'Rembrandt and Vermeer', '1700s French Romantic', '1930s Europe', 'Milk Maiden'],
    artists: ['Vermeer', 'Rembrandt', 'Van Gogh', 'Degas'],
    designers: ['Miu Miu', 'Marni', 'Chanel'],
  },
  {
    id: 'french-spring',
    name: 'French Spring',
    season: 'spring',
    palette: {
      skinTones: ['Geranium Pink', 'Pink Peach', 'Ballet Pink', 'White'],
      romantic: ['Coral Pink', 'Rose Pink', 'Red and White'],
      formal: ['Midnight Blue', 'Navy', 'Blue Purple'],
      hairColor: ['Soft Chocolate', 'Cocoa', 'Cream Blends'],
      secondBasic: ['Purple', 'Grape', 'Soft Plum', 'Lavender', 'Violet'],
      subdued: ['Slate Blue', 'Confederate Blue', 'Sky Blue', 'Silver Blue'],
      casual: ['Silver-Green', 'Moss Green', 'Soft Pistachio'],
      metallics: ['Rose Gold', 'Silver'],
      enlivened: ['Bottle Green', 'Seafoam Green', 'Blue Green'],
      highNote: ['Robin\'s Egg Blue', 'Soft Turquoise'],
      pastels: ['Silver-Blue', 'Silver-Purple', 'Silver-Green'],
    },
    colorCombinations: [
      'Geranium and White',
      'Red and White',
      'Coral, Seafoam and Silver-Green',
      'Bottle Green, Robin\'s Egg Blue and White',
      'Plum and Rose',
      'Pistachio, Chocolate and White',
      'Navy and White',
      'Sky Blue, Midnight Blue and Coral',
      'Red and Turquoise',
    ],
    fabrics: ['Organza', 'Muslin', 'Cotton', 'Taffeta', 'Fine Tweed', 'Velvet', 'Grosgrain Ribbons', 'Linen/Cotton', 'Cotton lace', 'Fine Lace', 'Denim', 'Chambray', 'Wool Jersey', 'Angora', 'White or Chocolate Fur', 'Suede'],
    prints: ['Gardenias', 'Dogwood', 'Jasmine', 'Small Roses', 'Butterflies', 'Birds', 'Fleur De Lis', 'Small Diamonds', 'Rectangles', 'Blue and White Stripes', 'Paisley', 'Florals', 'Polka dots', 'Whimsical Prints', 'Delftware', 'Delft Blue and White', 'Porcelain Tiles', 'Camelias'],
    paletteEffects: ['Gardenia Summer', 'Southern Belle', 'Milk Maiden', 'Gibson Girl'],
    style: {
      details: ['Side Part', 'Braided hair', 'Hair with Volume and Texture', 'Soft Bun', 'Lacing on dresses and tops', 'Peasant style', 'Dirndl Skirt', 'Two tone or Three toned suede bag and boots', 'Jeweled Embellishments on Clothing'],
    },
    jewelry: {
      stones: {
        perfect: ['Green Glass', 'Blue Topaz', 'Sapphire', 'Pink Coral', 'White Coral', 'Amethyst'],
        good: ['Cameos'],
        avoid: ['Amber', 'Orange stones', 'Heavy gold'],
      },
      metals: {
        perfect: ['Rose Gold', 'Silver'],
        avoid: ['Yellow Gold', 'Copper'],
      },
      styles: ['Enameled Jewelry', 'Floral Jewels', 'Clusters of Stones', 'Velvet Ribbons for Necklaces'],
    },
    makeup: {
      lips: { perfect: ['Coral', 'Soft Pink'] },
      cheeks: { perfect: ['Soft Pink', 'Coral'] },
      eyes: { perfect: ['Blue-Green', 'Purple'] },
      mascara: 'Brown',
      tips: ['Soft Lip and Cheeks with Blue-Green Eyeliner', 'Defined Brows with Coral lip'],
    },
    eras: ['1800\'s French Dress', '1800\'s Dutch', 'Gibson Girl', 'Turn of the century American Fashion', 'Japanese Kimono'],
    artists: ['Mary Cassatt', 'Renoir', 'Odilon Redon'],
  },
  {
    id: 'early-spring',
    name: 'Early Spring',
    season: 'spring',
    beautyStatement: 'The first delicate touches of Spring - soft, fresh, awakening',
    palette: {
      skinTones: ['Soft Pink', 'Blush', 'Peach', 'Cream'],
      romantic: ['Rose', 'Dusty Mauve', 'Raspberry', 'Soft Purple'],
      formal: ['Teal', 'Deep Blue-Green', 'Navy'],
      neutrals: ['Soft Gray', 'Taupe', 'Rose Beige'],
      enlivened: ['Teal', 'Aquamarine', 'Seafoam'],
      pastels: ['Soft Pink', 'Lavender', 'Cream', 'Sage'],
      metallics: ['Rose Gold', 'Silver'],
    },
    colorCombinations: [
      'Soft Pink and Teal',
      'Cream and Seafoam',
      'Lavender and Rose',
      'Blush and Navy',
      'Taupe and Aquamarine',
    ],
    fabrics: ['Silk', 'Fine Cotton', 'Chiffon', 'Cashmere', 'Fine Knit', 'Crêpe', 'Eyelet'],
    prints: ['Cherry Blossoms', 'Seashells', 'Butterflies', 'Delicate Florals', 'Birds', 'First Flowers'],
    paletteEffects: ['Cherry Blossoms', 'First Flowers', 'Morning Dew', 'New Growth'],
    style: {
      details: ['Delicate layers', 'Soft textures', 'Fresh, awakening looks'],
    },
    jewelry: {
      metals: { perfect: ['Rose Gold', 'Silver'] },
      stones: { perfect: ['Aquamarine', 'Rose Quartz', 'Pearl', 'Blue Topaz'] },
      styles: ['Delicate chains', 'Floral motifs', 'Spring-inspired'],
    },
    eras: ['Edwardian', 'Early 1900s', 'French Romantic'],
  },
];

// =============================================================================
// SUMMER SUBTYPES
// =============================================================================

export const SUMMER_SUBTYPES: Subtype[] = [
  {
    id: 'ballerina-summer',
    name: 'Ballerina Summer',
    season: 'summer',
    palette: {
      skinTones: ['Rose', 'Dusty Rose', 'Cream'],
      romantic: ['Red', 'Rose Red'],
      formal: ['Navy Blue', 'Midnight Blue'],
      hairColor: ['Chocolate', 'Amber'],
      eyeColor: ['Dark Brown', 'Gold'],
      neutrals: ['Slate Blue', 'Grey Blue'],
      metallics: ['Rose Gold', 'Silver'],
      enlivened: ['Dark Emerald', 'Bottle Green'],
      highNote: ['Emerald'],
      pastels: ['Lavender', 'Lilac', 'Pink', 'Cream'],
    },
    colorCombinations: [
      'Lavender, Purple and Cream',
      'Rose, Red and Ivory',
      'Emerald and Ivory',
      'Emerald and Lavender',
      'Bottle Green and Pink',
      'Ballet Pink and Chocolate',
      'Grey and Silver',
      'Rose Gold and Emerald Green',
    ],
    paletteEffects: ['Princess', 'Rose Garden', 'Ballerina', 'Peasant Girl- Eastern Europe', 'Milk Maiden'],
    fabrics: ['Lace', 'Eyelet', 'White Fur', 'Fine Cotton', 'Organza', 'Chiffon', 'Embroidery', 'Needlepoint', 'Fine wool', 'Wool Jersey', 'Velvet', 'Fine Corduroy'],
    prints: ['Florals', 'Roses', 'Hydrangeas', 'Tulips', 'Violets', 'Paisley', 'Polka Dots', 'Fleur De Lis', 'Hearts', 'Lockets', 'Ribbons', 'Birds', 'Butterflies', 'Fountains', 'Windowpane', 'Diamonds', 'Ovals', 'Delicate Branches with Flowers'],
    style: {
      silhouettes: ['A line Skirts or Dress', 'Princess cut dress or coat'],
      sleeves: ['Butterfly Sleeve', 'Ruffled Sleeve', 'Mutton Sleeve', 'Puffed sleeve at shoulder'],
      details: ['Pleated skirt', 'Narrow belts', 'Suede belts and boots', 'Vintage embroidery', 'Military style velvet jacket', 'Gold buttons', 'Braid or ribbon trim'],
      hair: ['High updo with flowers', 'Side part with embellished floral pins', 'Ribbons in hair'],
    },
    jewelry: {
      stones: {
        perfect: ['Amethyst', 'Blue topaz', 'Green opals', 'Blue Glass', 'Pearls', 'Quartz'],
        good: ['Pink Coral', 'White Coral'],
        avoid: ['Amber', 'Orange stones', 'Dark heavy stones'],
      },
      metals: {
        perfect: ['Rose Gold', 'Silver'],
        avoid: ['Yellow Gold', 'Copper', 'Bronze'],
      },
      styles: ['Colored stones', 'Enamel Flowers', 'Hanging beaded earrings', 'Cameo Flowers', 'Flower and bird designs'],
    },
    makeup: {
      eyes: { perfect: ['Emerald', 'Silver', 'Gold', 'Rose'] },
      lips: { perfect: ['Rose', 'Cherry red', 'Cream'] },
      cheeks: { perfect: ['Rose', 'Pink'] },
      looks: ['Emerald with Silver or Gold for evening', 'All Rose for Romantic look', 'Cream, Rose and Cherry red for classic Summer look'],
    },
    eras: ['Gibson Girl', 'England 1800\'s', 'France 1800\'s', 'Hungarian Costume 19th century'],
    artists: ['Monet', 'Cassatt'],
  },
  {
    id: 'cameo-summer',
    name: 'Cameo Summer',
    season: 'summer',
    palette: {
      skinTones: ['Cream', 'Peach', 'Rose'],
      romantic: ['Dark Rose', 'Claret', 'Soft Red', 'Cameo'],
      formal: ['Purple', 'Dark Purple'],
      neutrals: ['Slate Blue', 'Confederate Blue'],
      metallics: ['Rose Gold', 'Silver'],
      enlivened: ['Blue Green', 'Aqua', 'Dark Greens'],
      pastels: ['Lavender', 'Lilac', 'Pale Greens', 'Seafoam', 'Grey Green'],
    },
    colorCombinations: [
      'Purple, Teal and Midnight',
      'Golden Brown and Rose',
      'Cameo, Seafoam and Lavender',
      'Rose Gold and Soft Blue',
      'Dark Rose and Seafoam',
      'Purple and Cream',
      'Claret and Pastel Green',
    ],
    fabrics: ['Toile', 'Embroidered Cotton', 'Velvet', 'Chiffon', 'Smooth Satin', 'Micro Tweeds', 'Fine Wool', 'Cotton Linen Mix', 'Suede', 'Jersey', 'Satin Jersey', 'Polished Cotton'],
    paletteEffects: ['English Roses', 'Romantic French Design', 'Fleur de Lis', 'Trompe L\'oeil', 'Iridescent Embroidered Cloth'],
    prints: [],
    style: {
      shoes: ['Oval shoes'],
      silhouettes: ['S-curve'],
      details: ['Feathers and Lace', 'Delicate Ties and Ribbon at sleeves'],
    },
    jewelry: {
      stones: {
        perfect: ['Cameos', 'Pink Quartz', 'Pearls', 'Rubies', 'Sapphires', 'Labradorite', 'Green Stones'],
      },
      metals: {
        perfect: ['Rose Gold', 'Silver'],
      },
      styles: ['Dangling Earrings', 'Teardrop earrings', 'Pear Cut Pink Diamond'],
    },
    makeup: {
      lips: { perfect: ['Reds', 'Rose'] },
      cheeks: { perfect: ['Cameo', 'Pale Pink'] },
      eyes: { perfect: ['Blue Green liner or Shadow'] },
      tips: ['Use High Tone for Evening'],
    },
  },
  {
    id: 'chinoiserie-summer',
    name: 'Chinoiserie Summer',
    season: 'summer',
    palette: {
      formal: ['Dark Blue', 'Dark Green', 'Hunter Green', 'Prussian Blue', 'Chocolate Brown'],
      neutral: ['Olive Green', 'Grey Green', 'Burgundy'],
      hairColor: ['Golden Brown', 'Chestnut', 'Topaz'],
      skinTones: ['Rose', 'Apricot Rose', 'Dusty Rose', 'Rose-Terra Cotta', 'Apricot', 'Cream', 'Ivory'],
      romantic: ['Dark Rose', 'Sangria', 'Dusty Red'],
      eyeColor: ['Blue green', 'Aquamarine', 'Sapphire'],
      enlivened: ['Emerald', 'Bright Hunter Green'],
      highShade: ['Sapphire Blue', 'Teal'],
      pastels: ['Sage', 'Lavender (iridescent)', 'Sky Blue', 'Apricot', 'Ivory'],
      metals: ['Rose Gold', 'Gold', 'Silver'],
    },
    colorCombinations: [
      'Rose, Ivory and Deep Rose',
      'Sapphire and Ivory',
      'Chocolate Brown, Olive and Cream',
      'Burgundy, Olive and Apricot',
      'Sage, Lavender and Silver Grey',
      'Emerald Green and Cream',
      'Teal, Olive and Ivory',
      'Black Olive, Dusty Red and Golden Brown',
    ],
    paletteEffects: ['Summer Princess', 'Guinevere', 'Summer Woods', 'Summer Rose Garden', 'Renaissance Princess', 'Grecian Effects', 'Japanese Garden', 'Chinoiserie Effect', 'Cloisonne Effect'],
    fabrics: ['Lace', 'Crocheted lace', 'Eyelet', 'Velvet', 'Crushed Velvet', 'Corduroy', 'Chambray', 'Denim', 'Soft Leather', 'Suede', 'Embossed Leather', 'Fine Tweed', 'Brocade', 'Tapestry', 'Organza', 'Pleated Cotton', 'Cotton Linen', 'Silk', 'Woven Silk', 'Polished Cotton', 'Jersey', 'Fine Wool', 'Mohair', 'Angora', 'Melange', 'Needle point'],
    prints: ['Roses', 'Myrtle', 'Clematis', 'Wisteria', 'Wild Rose', 'Camelias', 'Almond Blossoms', 'Star Flowers', 'Hibiscus', 'Jasmine', 'Fine Ombre Stripe', 'Ombre', 'Iridescent fabrics', 'Climbing Flowers', 'Trees and Flowers', 'Orchard prints', 'Prince of Wales plaid', 'Small Scottish Plaid', 'Painted Pagodas and Houses', 'Birds', 'Butterflies', 'Dragonflies', 'Feathers', 'Wings', 'Hearts', 'Pearls', 'Seashells', 'Trompe L\'oeil Ribbons and Lace'],
    style: {
      overview: 'French Girls Chic, Summer Rose Look, Romantic princess style, updated Bohemian princess look with leather/suede accents',
      dresses: ['A Line dresses', 'Safari dress', 'Kimono dress', 'Wrap dresses', 'Pleated dresses', 'Grecian style', 'Peasant Dresses'],
      skirts: ['A line with fitted top', 'Straight skirt with romantic top', 'Denim or suede skirt with flowy top'],
      hair: ['Soft Updo', 'Side part with soft curls/waves', 'Braiding or twisting hair back', 'Leaves and flowers in updo'],
      shoes: ['Suede shoes', 'Ballerina wrap', 'Espadrilles', 'Riding boots', 'Blue suede ankle boots'],
    },
    jewelry: {
      types: ['Enamel', 'Cloisonne', 'Colored Glass'],
      metals: { perfect: ['Rose Gold', 'Gold', 'Silver'] },
      stones: { perfect: ['Blue Topaz', 'Aquamarine', 'Labradorite', 'Pink Quartz', 'Opals', 'White Coral', 'Amethyst', 'Garnet'] },
      styles: ['Embossed Gold', 'Filigree', 'Engraved gold', 'Cameos in Roses and Leaves', 'Gold chains of Leaves, Branches and Flowers', 'Birds and Feathers'],
    },
    makeup: {
      soft: 'Skin tones and pastels, Roses and Apricots. Soft green eyeliner with rose lip',
      evening: 'Dramatic colors, Blues and teals',
    },
    designers: ['Bluemarine', 'Chloe'],
    artists: ['Sargent', 'Degas'],
  },
  {
    id: 'degas-summer',
    name: 'Degas Summer',
    season: 'summer',
    palette: {
      colors: ['Mushroom', 'Taupe', 'Mauve', 'Pink Mauve', 'Gray pink', 'Silver', 'Silver Gray', 'Pistachio', 'Soft Yellow Green', 'Apricot', 'Lemon Cream', 'Soft Purple', 'Lilac', 'Deep purple', 'Brown Purple', 'Blue Gray', 'Cadet Blue', 'Deep teal', 'Aqua', 'Blue-Green', 'Seafoam', 'Gray Green'],
    },
    colorCombinations: [
      'Apricot, Cream and Seafoam',
      'Cadet Blue, Violet and Cream',
      'Grey Green, Pistachio and Lemon Cream',
      'Mauve and Seafoam',
      'Mauve, Mushroom and Ballet Slipper Pink',
      'Silver, Taupe and Burgundy',
      'Cadet Blue, Grey Blue and Silver',
    ],
    paletteEffects: ['1800\'s Indian and Persian design (soft)', '1600\'s Dutch', 'Mid 1800\'s France', 'English Rose', 'Ballerina', 'Summer Lake at Dawn', 'Opal and Moonstone Palette', 'Softly Iridescent Colors', 'Peacock-Pheasant Palette'],
    fabrics: ['Velvet', 'Soft knits', 'Chanel Tweed', 'Fine corduroy', 'Jersey', 'Silk', 'Tulle', 'Eyelet', 'Crocheted Lace', 'Angora', 'Mohair', 'Scottish Lace', 'Colored Denim', 'Iridescent leather', 'Soft Leather', 'Suede', 'Cotton', 'Cotton-Linen'],
    prints: ['Small flowers', 'Stripes', 'Animal print', 'Tulips', 'Peonies', 'Bluebells', 'Hibiscus', 'Jasmine', 'Daisies', 'Bamboo prints', 'Soft tropical flowers'],
    style: {
      overview: 'Military Styles in soft Grays Mushrooms and Cadet blues, Silver buttons, epaulets',
      shoes: ['Ballet flats', 'espadrilles', 'criss cross straps', 'suede shoes', 'pointed or oval toes'],
      skirts: ['Straight skirt with flowy sleeves top', 'A-line dress and skirt', 'Fitted top with Flowy skirt'],
      sleeves: ['Puffed sleeve', 'mutton sleeve', 'small puff at shoulder'],
      hair: ['Side part', 'High Bun'],
      recommendations: ['Brace palette by wearing darker colors over lighter', 'Add structure to one part of outfit', 'Avoid prints that are too high contrast'],
    },
    jewelry: {
      stones: { perfect: ['Garnet', 'Rhodonite', 'Quartz', 'Moonstone', 'Opal', 'Blue Topaz', 'Agate', 'Tourmaline'] },
      metals: { perfect: ['Rose Gold', 'Silver'] },
      styles: ['Beaded Chandelier Earrings', 'Tear Drop shapes', 'Oval cut gems', 'Multi colored gemstones in shapes of flowers and birds', 'Ivory enamel flowers'],
    },
    makeup: {
      options: [
        'Iridescent Mauves, Pink and Green eyeshadow or liner',
        'Soft Pink cheeks and lip with blue gray eyeliner',
        'Deep Mauve lip with defined eyes',
      ],
    },
    artists: ['Ingres', 'Vermeer'],
    designers: ['Marni', 'Bluemarine', 'Chloe'],
  },
  {
    id: 'dusky-summer',
    name: 'Dusky Summer',
    season: 'summer',
    palette: {
      colors: ['Cream', 'Rose', 'Deep Rose', 'Mauve', 'Sangria', 'Burgundy', 'Deep Purple', 'Chocolate', 'Green/Brown', 'Teal', 'Sea Green', 'Aqua', 'Silver', 'Amber', 'Silver Blue', 'Powder Blue', 'Slate Blue'],
    },
    colorCombinations: [
      'Cream and Chocolate',
      'Rose, Cream and Green',
      'Amber, Purple and Silver',
      'Forest Green and Soft Green',
      'Amber, Chocolate and Cream',
      'Aqua, Sea Green and Silver',
    ],
    fabrics: ['Jersey', 'Angora', 'Velvet', 'Chenille', 'Chiffon', 'Fine Cotton', 'Organza', 'Fine Corduroy', 'Mohair', 'Colored Denim'],
    paletteEffects: ['Gibson Girl', 'Cowgirl', 'Grecian', 'Edwardian Era', 'English 1800\'s', 'American Pioneer', 'Patchwork'],
    prints: [],
    style: {
      shoes: ['Cowboy Boots', 'Oval Toe', 'Espadrilles'],
      details: ['Criss cross Ribbons', 'Worn Leather', 'Leopard Print chiffon', 'Mermaid style', 'A line', 'Fine pleats', 'Braids', 'Side part', 'Net Lace', 'Crochet Lace', 'Graphics and Florals mixed'],
    },
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Silver'] },
      stones: { perfect: ['Aquamarine', 'Labradorite', 'Turquoise', 'Opals', 'Rose Quartz', 'Pink Pearls'] },
      styles: ['Small Charms', 'Hearts and Flowers', 'Enameled Flowers'],
    },
    makeup: {
      lips: { perfect: ['Mauve', 'Sangria'] },
      cheeks: { perfect: ['Rose', 'Mauve'] },
      eyes: { perfect: ['Green and gold eyeliner/Shadow'] },
      looks: ['Soft look with shades of rose and strong brow', 'Smudged eyeliner/soft shadow'],
    },
  },
  {
    id: 'emerald-summer',
    name: 'Emerald Summer',
    season: 'summer',
    palette: {
      skinTones: ['Cameo', 'Rose', 'Terra Cotta-Rose', 'Apricot-Cream', 'Cream', 'Ivory'],
      romantic: ['Soft Wine', 'Burgundy', 'Vintage Rose'],
      formal: ['Midnight', 'Prussian Blue', 'Navy', 'Blue-Black'],
      hairColor: ['Golden Brown', 'Amber', 'Topaz', 'Chocolate'],
      eyeColor: ['Blue Green', 'Aquamarine'],
      neutrals: ['Blue-Purples', 'Dusty Blue', 'Slate Blue', 'Silver Grey', 'Silver Green'],
      metallics: ['Rose Gold', 'Copper', 'White Gold'],
      enlivened: ['Bottle Green', 'Forest Green'],
      highNote: ['Emerald'],
      pastels: ['Soft Rose', 'Sage', 'Cream', 'Silver'],
    },
    colorCombinations: [
      'Midnight Blue and Cream',
      'Rose, Burgundy and Grey',
      'Slate Blue, Midnight Blue and Emerald',
      'Emerald and Rose Gold',
      'Dusty Blue, Rose and Sage',
      'Bottle Green and Amber',
      'Amber, Rose and Sage',
    ],
    paletteEffects: ['Rose Garden', 'Renaissance Princess', 'Tea Rose Palette', 'Summer Sunset', 'Summer Woods'],
    fabrics: ['Crocheted Lace', 'Fine Lace', 'Velvet', 'Corduroy', 'Striped Denim', 'Fine Wool', 'Fine Tweed', 'Embossed Floral Leather', 'Suede', 'Jersey wool', 'Fine Cotton', 'Cotton/Linen Blend', 'Burlap', 'Colored Denim', 'Silk', 'Organza', 'Chiffon', 'Applique'],
    prints: ['Antique Roses', 'Tea Roses', 'Stone Garden Bench', 'Marbled Stone', 'Birds', 'Flowers', 'Butterflies', 'Hearts', 'Lockets', 'Fleur De Lis', 'Cameos', 'Trompe L\'oeil Lace and Ribbons', 'Small geometric shapes', 'Polka dots', 'Paisley', 'Tile Mosaic', 'Climbing florals', 'Floral embroidery', 'Vases with Flowers'],
    style: {
      details: ['Princess cut Coats and jackets', 'Military braided jacket', 'Princess cut dresses', 'belted dresses', 'Shirtwaist dresses', 'Safari style jacket', 'Puff sleeve', 'butterfly sleeve', 'Ruffled sleeve', 'Renaissance looks with layered fabrics', 'Riding style leather boots and velvet jacket'],
    },
    jewelry: {
      stones: { perfect: ['Emeralds', 'Small diamonds', 'Topaz', 'Blue Topaz'] },
      metals: { perfect: ['Copper', 'Rose Gold', 'White Gold'] },
      styles: ['Cameos', 'Enamel flowers and leaves', 'Floral filigree', 'Marble or Mother of Pearl', 'Pearls'],
    },
    eras: ['English Renaissance', 'French 1800\'s', 'England 1800\'s', 'Gibson Girl', '1940\'s fashion'],
    artists: ['John Singer Sargent', 'Dante Gabriel Rossetti'],
  },
  {
    id: 'english-summer',
    name: 'English Summer',
    season: 'summer',
    palette: {
      skinTones: ['Pink Mauve', 'Mauve-Rose', 'Rose', 'Dark Rose'],
      romantic: ['Wine', 'Soft Burgundy', 'Sangria'],
      formal: ['Blue Black', 'Prussian Blue', 'Midnight Green', 'Midnight Blue'],
      hairColor: ['Golden Brown', 'Dark Brown', 'Chocolate'],
      eyeColor: ['Grey Green', 'Golden Green', 'Olive Green'],
      neutrals: ['Grey', 'Blue Grey', 'Slate Blue', 'Grey Purple', 'Burgundy'],
      metallics: ['Rose Gold', 'Gold'],
      enlivened: ['Teal', 'Blue Green'],
      highNote: ['Emerald'],
      pastels: ['Mauve', 'Cream', 'Sage'],
    },
    colorCombinations: [
      'Sage, Mauve and Cream',
      'Burgundy, Green and Rose',
      'Rose, Mauve and Cream',
      'Emerald and Rose',
      'Teal, Emerald and Lilac',
      'Chocolate and Rose',
      'Slate Blue, Slate Purple and Grey',
    ],
    paletteEffects: ['Sunlight shining through the woods', 'Late English Summer', 'English Rose Garden', 'Garden with hanging Flowers'],
    fabrics: ['Embroidered Chiffon', 'Applique', 'Jacquard', 'Tapestry', 'Fine Lace', 'Embroidery on Cotton', 'Fine tweed', 'Fine Wool knit', 'Linen Cotton', 'Cotton Organza', 'Chenille', 'Stretch velvet', 'Matte Velvet', 'Fine ribbons'],
    prints: ['Pearls', 'Seashells', 'Roses', 'Lilies', 'Lilacs', 'Tulips', 'Lavender', 'Small ovals, squares or diamonds', 'Narrow stripe or lines', 'Delicate flowers and branches', 'Birds and Flowering trees', 'Dogwood', 'Ribbon Prints', 'Lace Trompe L\'oeil', 'Watercolor Prints'],
    style: {
      necklines: ['Oval neckline', 'sweetheart neckline', 'Cowl neck', 'V neckline', 'Mandarin Collar'],
      sleeves: ['Bell Sleeve', 'Sleeve with drape', 'Butterfly sleeve'],
      details: ['Asymmetrical hemline', 'A line Skirts and dresses', 'Narrow belts', 'Rose Gold belt', 'Wrap Dresses', 'Renaissance lacing'],
    },
    jewelry: {
      stones: { perfect: ['Green Glass', 'Labradorite', 'Pearls', 'Topaz', 'Green Opal', 'Agate', 'Aquamarine', 'Aventurine'] },
      metals: { perfect: ['Rose Gold', 'Gold', 'Silver'] },
      styles: ['Delicate colored beads', 'Glass beads', 'Dangling pearls', 'Clusters of stones', 'Enamel Designs', 'Pear shaped pendant', 'Chandelier earrings in Filigree'],
    },
    makeup: {
      eyes: { perfect: ['Green eyeliner', 'Gold eyeshadow'] },
      lips: { perfect: ['Burgundy'] },
      cheeks: { perfect: ['Rose tones'] },
    },
    eras: ['English 1800\'s', 'Art Deco', 'French 1700\'s'],
    artists: ['Monet', 'Manet'],
  },
  {
    id: 'porcelain-summer',
    name: 'Porcelain Summer',
    season: 'summer',
    beautyStatement: 'Deep Sapphire Blues and Glass Greens. Light pinks and blues of flowers grounded with Golden Browns. A pure and iridescent Palette',
    palette: {
      skinTones: ['Rose', 'Rose Mauve', 'Pale Mauve', 'Cream', 'Pink-Cream', 'Ivory'],
      romantic: ['Mauve-Red', 'Plum', 'Rose', 'Dusty Red'],
      formal: ['Midnight Blue', 'Navy', 'Slate Blue'],
      hairColor: ['Golden Brown', 'Amber', 'Chocolate'],
      eyeColor: ['Midnight Blue', 'Sapphire Blue', 'Blue-Grey'],
      neutral: ['Taupe', 'Mushroom', 'Dove Grey'],
      metallics: ['Gold', 'Silver'],
      enlivened: ['Blue Greens', 'Teal', 'Emerald'],
      highNote: ['Sapphire Blue', 'Sea green'],
      pastels: ['Lavender', 'Periwinkle', 'Chambray', 'Dusty Blue', 'Ivory', 'Cream', 'Light Pink'],
    },
    colorCombinations: [
      'Sage, Pale Pink and Sky Blue',
      'Emerald and Sapphire',
      'Cream, Rose and Soft Purple',
      'Lavender, Rose and Amber',
      'Chocolate and Light Pink',
      'Sea Green, Silver Blue and Ivory',
      'Taupe, Purple and Mauve',
      'Dark Blue, Ivory and Silver',
      'Aqua, Seafoam and Golden Brown',
    ],
    paletteEffects: ['Ballerina', 'Porcelain effect', 'Summer Rose Garden', 'Venice Watercolors', 'Watercolor painting', 'Cloisonne', 'French and English designs'],
    fabrics: ['Fine Lace', 'Eyelet', 'Crocheted Lace', 'Net', 'Chiffon', 'Tulle', 'Tweed', 'Velvet', 'Crushed velvet', 'Corduroy', 'Chambray', 'Denim', 'Fine wool', 'Boucle', 'Jersey', 'Gauze', 'Polished Cotton', 'Silk', 'Iridescent fabric', 'Mohair', 'Angora'],
    prints: ['Roses', 'Daisies', 'Anemones', 'Peonies', 'Hydrangeas', 'Dogwood', 'Water Lilies', 'Lotus Flowers', 'Jasmine', 'Lace Prints', 'Trompe L\'oeil', 'Swans', 'Birds and Feathers', 'Deer', 'Porcelain designs', 'Blue and White China', 'Windowpane', 'Bouquets of Flowers', 'Vases', 'Green Glass', 'Fine stripes', 'Climbing Florals', 'Kimono Prints', 'Cherry Blossoms', 'Polka dots', 'Paisley-delicate', 'Toile Prints', 'Musical instruments', 'Musical Notes'],
    style: {
      overview: 'Princess Palette, French and English Designs. Mix Structured design with something Flowy and Romantic',
      dresses: ['A line Dresses', 'Ribbon tie at wrists and neck', 'Puffed sleeve', 'Safari Dress', 'Column Dress', 'Dress with tiered skirt', 'Grecian pleated dress', 'Princess Cut dresses', 'Military style dress'],
      skirts: ['Pleated skirts', 'Belted Skirts', 'Denim skirt', 'Pencil Skirt in rose print', 'Shredded Tulle skirt', 'Tweed Skirt with lace trim'],
      tops: ['Ribbon tie', 'Kimono style', 'Mandarin Collar shirt', 'Angora Sweater', 'Gauze Cotton Poets Blouse', 'Lace and Ribbons blouse', 'Military style'],
      shoes: ['Oval toed', 'Espadrilles', 'Ballerina Wrap', 'Greek Sandals', 'Suede Loafer', 'Velvet boots', 'Blue Suede ankle boots', 'Riding Boots'],
      coats: ['Princess style coat', 'Military style with Gold buttons and Braid', 'Cape Coat', 'Tweed Coat'],
      hair: ['Long layers', 'updo', 'high ponytail', 'braids', 'crown braid', 'jeweled clips', 'headbands'],
      recommendations: ['Mix floral Prints and Solids', 'Wear structured top with Flowy skirt', 'Mix fabrics: Denim and Lace, Tweed and silk, Tulle and Leather'],
    },
    jewelry: {
      inspirations: ['Faberge'],
      stones: { perfect: ['Amethyst', 'Blue topaz', 'Topaz', 'Garnet', 'Quartz', 'Pearls', 'Sapphires', 'Green Glass', 'Tourmaline', 'Aventurine'] },
      metals: { perfect: ['Gold', 'Silver'] },
      styles: ['Enamel designs', 'Cameos', 'Cloisonne', 'Jeweled flowers', 'Bird Pendants', 'Delicate dangling bird earrings', 'feather earrings', 'Climbing flowers', 'Filigree', 'Whimsical designs with birds, trees and houses'],
    },
    makeup: {
      soft: 'Pastels and Skin tones',
      evening: 'Deep Rose and Dusty red with Emerald and Blue',
    },
    eras: ['Edwardian', 'French 1700\'s', 'Russian Princess 1800\'s'],
    artists: ['Degas', 'Sargent'],
  },
  {
    id: 'rose-gold-summer',
    name: 'Rose Gold Summer',
    season: 'summer',
    palette: {
      skinTones: ['Rose Gold', 'Rose', 'Antique Rose', 'Peach-Rose', 'Cream', 'Ivory'],
      romantic: ['Coral Rose', 'Rose', 'Velvet Rose'],
      hairColor: ['Golden Brown', 'Soft Brown', 'Chocolate'],
      eyeColor: ['Blue Green', 'Aqua', 'Gold Green', 'Aquamarine'],
      neutrals: ['Taupe', 'Mushroom', 'Dove Grey', 'Silver Grey', 'Blue Purple', 'Grey Purple', 'Slate Blue'],
      formal: ['Navy Blue', 'Prussian Blue', 'Indigo'],
      pastels: ['Silver-Green', 'Silver Blue', 'Lavender'],
      enlivened: ['Teal', 'Blue Green'],
      highShade: ['Emerald', 'Bright Teal'],
    },
    colorCombinations: [
      'Antique Rose, Cream and Coral',
      'Emerald, Coral and Ivory',
      'Blue Purple, Silver Purple and Ivory',
      'Navy Blue and Ivory',
      'Lemon yellow, Cream and Golden Brown',
      'Golden Brown and Chocolate',
      'Golden Brown, Ivory and Rose',
      'Teal and Green',
    ],
    paletteEffects: ['English Rose Garden', 'Renaissance Princess', 'Gibson Girl', 'French 1700\'s', 'English 1800\'s', 'Ancient Greece', 'Edwardian Costume', 'Ballerina Costume'],
    fabrics: ['Fine Velvet', 'Crushed Velvet', 'Velour', 'Jersey', 'Fine Tweed', 'Tulle', 'Chiffon', 'Lace', 'Crocheted Lace', 'Gauze Cotton', 'Silk', 'Denim', 'Fine Corduroy', 'Chambray', 'Shredded Tulle', 'Brocade-Soft'],
    prints: ['Hearts', 'Fleur De Lis', 'Ribbons', 'Toile in Roses, Leaves and Fountain', 'Peonies', 'Tulips', 'Hollyhocks', 'Larkspur', 'Dogwood', 'Hydrangeas', 'Daisies', 'Paisley', 'Window Panes', 'Fine Stripe', 'Seashells', 'Pearls', 'Sea Glass', 'Watercolor Prints', 'Polka Dots', 'Small Diamonds', 'Ovals', 'Leopard Prints', 'Birds', 'Deer'],
    style: {
      silhouettes: ['A line Skirt', 'A line Dress'],
      sleeves: ['Bell Sleeve', 'Puff Sleeve', 'Butterfly sleeve'],
      necklines: ['Square Neckline', 'Sweetheart Neckline', 'Oval Neckline'],
      looks: ['Renaissance looks', 'Ballerina', 'Riding Style', 'Grecian Dress'],
      shoes: ['Wedges', 'Espadrilles', 'Oval Toes', 'Rounded rectangular toe', 'pointed toe'],
    },
    jewelry: {
      stones: { perfect: ['White Coral', 'Pearls', 'Pink Coral', 'Sea Glass', 'Aventurine', 'Topaz', 'Blue Topaz', 'Quartz', 'Marble', 'Opals'] },
      metals: { perfect: ['Rose Gold', 'Woven Gold', 'Silver'] },
      styles: ['Hearts', 'Lockets', 'Ribbons', 'Delicate chains', 'layered rings and bracelets'],
    },
    makeup: {
      dramatic: 'High Shade for impact, Emerald and Teal with Coral',
      everyday: 'Soft Roses and Creams',
    },
    designers: ['BlueMarine', 'Chloe', 'Ulla Johnson', 'Stella McCartney'],
    artists: ['Sargent', 'Manet'],
  },
  {
    id: 'summer-rose',
    name: 'Summer Rose',
    season: 'summer',
    beautyStatement: 'A Watercolor Palette in Blues, Greens and Purples. The Golden-Browns and Creams add warmth to the pastels. A Palette of a Rose Garden in late Summer',
    palette: {
      skinTones: ['Rose', 'Apricot', 'Cream', 'Dark Rose', 'Mauve Rose', 'Ballet Pink', 'Ivory'],
      romantic: ['Soft red', 'Rose Red', 'Blush'],
      formal: ['Navy Blue', 'Midnight Blue', 'Prussian Blue'],
      hairColor: ['Golden Brown', 'Cocoa', 'Mushroom', 'Amber'],
      eyeColor: ['Green', 'Blue Green', 'Aqua', 'Seafoam', 'Emerald'],
      neutral: ['Mushroom', 'Taupe', 'Slate Blue', 'Silver Grey', 'Dark plum', 'Dusty Purple'],
      metallics: ['Rose Gold', 'Silver', 'Gold'],
      enlivened: ['Aquamarine', 'Bright Seafoam'],
      highNote: ['Emerald', 'Sapphire'],
      pastels: ['Lavender', 'Violet', 'Chartreuse', 'Light Apricot', 'Sage'],
    },
    colorCombinations: [
      'Rose, Cream, Dusty Red',
      'Midnight Blue and Ivory',
      'Prussian Blue and Sky Blue',
      'Sky Blue, Aqua and Sage',
      'Golden Brown, Cream and Gold',
      'Emerald and Sage',
      'Slate Blue, Navy Blue and Ivory',
      'Cocoa, Soft Olive and Plum',
      'Plum, Lavender and Silver',
    ],
    paletteEffects: ['Summer Rose Garden', 'Lake with Water Lilies', 'Japanese Garden', 'Renaissance Princess'],
    fabrics: ['Eyelet', 'Lace', 'Crocheted Lace', 'Knitted Lace', 'Velvet', 'Crushed Velvet', 'Fine Corduroy', 'Chambray', 'Denim', 'Cotton-Linen', 'Organza', 'Chiffon', 'Tulle', 'Tweed', 'Boucle', 'Angora', 'Silk', 'Gauze Cotton', 'Jersey', 'Suede', 'Soft Leather', 'Fine Knits', 'Fisherman Knits', 'Irish Knits', 'Embroidered Cotton', 'Needlepoint/Tapestry'],
    prints: ['Flowers', 'Ribbons', 'Pearls', 'Birds', 'Bird Cages', 'Feathers', 'Butterflies', 'Deer', 'Diamond Prints', 'Vases', 'Fleur De Lis', 'Fine Stripes', 'Porcelain Prints', 'Plaid', 'Roses', 'Peonies', 'Tulips', 'Jasmine', 'Star Flowers', 'Lilacs', 'Hydrangeas', 'Hibiscus', 'Water Lilies', 'Lotus', 'Paisley', 'Hearts', 'Lockets', 'Bows', 'Cherry Blossoms', 'Magnolias', 'Gardenias'],
    style: {
      overview: 'Garden Fairy, Cowgirl Style, Milk Maiden, English Rose, Sailor Chic, Japanese Kimono Style, Riding Style',
      dresses: ['Shirtwaist Dress', 'Peasant Dress', 'Embroidered Dress', 'Jersey Dress', 'Denim Dress', 'A-Line Dress', 'Pleated Grecian Dress', 'Tulle Dress', 'Military Style Dress'],
      skirts: ['Tweed with shredded tulle hem', 'Tulle Skirt', 'Ballerina Skirt', 'Denim Skirt', 'Plaid Skirt', 'Wool Pencil Skirt'],
      tops: ['Ribbon tied tops', 'Angora Sweaters', 'Trompe L\'oeil Sweaters', 'Floral Cashmere', 'Lace Blouse', 'Peasant Top', 'Kimono Top'],
      shoes: ['Espadrilles', 'Ballet Flats', 'Suede Ankle Boots', 'Embroidered Loafers', 'Grecian Sandals', 'Riding Boots'],
      coats: ['Princess Style Coat', 'Suede Biker Jacket', 'Tweed Coat', 'Velvet Coat'],
      recommendations: ['Wear Something tailored with something romantic', 'Denim Skirt with Romantic Blouse', 'Create an hourglass or Oval Silhouette'],
    },
    jewelry: {
      stones: { perfect: ['Pearls', 'White Coral', 'Aquamarine', 'Jade', 'Blue Topaz', 'Garnet', 'Amethyst', 'Quartz'] },
      styles: ['Cameos', 'Enamel', 'Pave', 'Filigree', 'Ribbon earrings and Necklaces', 'Leaves and Flowers in Climbers', 'Birds', 'Butterflies', 'Bird Cages'],
    },
    makeup: {
      everyday: 'Pastels',
      evening: 'High shade/dramatic',
    },
    eras: ['Grecian', 'Ancient Chinese Prints', 'Ancient Japan', 'English Classic', '1940\'s and 1950\'s', 'Dutch and Flemish Antique Design'],
    artists: ['Monet', 'Vermeer'],
  },
  {
    id: 'sunset-summer',
    name: 'Sunset Summer',
    season: 'summer',
    palette: {
      colors: ['Cream', 'Rose', 'Deep Rose', 'Mauve', 'Sangria', 'Burgundy', 'Deep Purple', 'Violet', 'Chocolate', 'Green/Brown', 'Teal', 'Sea Green', 'Bottle Green', 'Silver', 'Amber', 'Silver Purple', 'Powder Blue', 'Slate Blue', 'Seafoam Green', 'Forest Green', 'Midnight Blue'],
    },
    colorCombinations: [
      'Cream and Chocolate',
      'Rose, Cream and Green',
      'Amber, Purple and Silver',
      'Forest Green and Soft Green',
      'Amber, Chocolate and Cream',
      'Seafoam Green and Silver',
      'Rose, Amber and Violet',
    ],
    fabrics: ['Jersey', 'Angora', 'Velvet', 'Chenille', 'Chiffon', 'Fine Cotton', 'Organza', 'Fine Corduroy', 'Mohair', 'Twill', 'Cotton/Linen mix'],
    paletteEffects: ['Grecian draped dresses', 'Edwardian Era', 'English 1800\'s', 'Riding Style', 'French Contemporary'],
    prints: [],
    style: {
      shoes: ['Cowboy Boots', 'Oval Toe', 'Espadrilles'],
      details: ['Criss cross Ribbons', 'Worn Leather', 'Leopard Print chiffon', 'Mermaid style', 'A line', 'Fine pleats', 'Soft waves', 'Side part', 'Net Lace', 'Crochet Lace', 'Paisley Prints', 'Silver and Gold woven into fabrics', 'Cowl neck', 'S shaped dresses', 'Jackets over flowy dresses', 'Romantic Ribbons', 'Bell shaped Sleeve', 'Small puff at shoulder'],
    },
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Silver'] },
      stones: { perfect: ['Aquamarine', 'Labradorite', 'Turquoise', 'Opals', 'Rose Quartz', 'Pink Pearls'] },
      styles: ['Delicate Florals and Leaves', 'Enameled Flowers'],
    },
    makeup: {
      lips: { perfect: ['Mauve', 'Sangria'] },
      cheeks: { perfect: ['Rose', 'Mauve'] },
      eyes: { perfect: ['Green and gold eyeliner/Shadow'] },
      looks: ['Soft look with shades of rose and strong brow', 'Smudged eyeliner/soft shadow'],
    },
  },
  {
    id: 'water-lily-summer',
    name: 'Water Lily Summer',
    season: 'summer',
    palette: {
      formal: ['Navy Blue', 'Dark Blue', 'Midnight'],
      neutral: ['Silver Grey', 'Mushroom', 'Light Taupe'],
      hairColor: ['Golden Brown', 'Amber', 'Cocoa'],
      skinTones: ['Rose', 'Peach-Rose', 'Apricot', 'Cream', 'Ivory'],
      romantic: ['Coral-Red', 'Soft Red', 'Rose-Coral'],
      eyeColor: ['Amber', 'Golden Brown'],
      enlivened: ['Green', 'Dark Emerald', 'Turquoise', 'Teal'],
      highShade: ['Sapphire', 'Dark Cobalt'],
      pastels: ['Pistachio green', 'Soft green', 'Apricot', 'Apricot Cream', 'Lemon Cream'],
      metals: ['Rose Gold', 'Silver'],
    },
    colorCombinations: [
      'Rose, Cream and Rose Gold',
      'Powder blue, Navy Blue and Pink',
      'Amber, Emerald and Seafoam',
      'Lavender and Emerald',
      'Light Purple and Rose Red',
      'Rose Red and Teal',
      'Taupe, Cream and Coral Red',
      'Sea Green and Bottle Green',
    ],
    paletteEffects: ['Summer Rose Garden', 'Gibson Girl', 'Edwardian Style', 'Renaissance Style', 'French Girl Fashion', '1920\'s Flapper Looks', 'Grecian drapes and fine pleats'],
    fabrics: ['Fine Corduroy', 'Velvet', 'Chenille', 'Crochet lace', 'Eyelet', 'Fine Lace', 'Mohair', 'Fine Tweed', 'Jersey wool', 'Satin', 'Boucle', 'Polished cotton', 'Chiffon', 'Organza', 'Denim', 'Chambray', 'Suede', 'Crushed Velvet', 'Crushed silk', 'China Silk', 'Trompe l\'oeil ribbons and lace'],
    prints: ['Fleur de lis', 'Roses prints', 'Watercolor Prints', 'Fine Stripes', 'Prince of Wales', 'Diamond prints (small)', 'Embroidered Flowers and Birds', 'Leaves and Branches', 'Bird and Butterfly print', 'Small polka dots', 'velvet polka dots', 'Feathers and Wings', 'Lilacs', 'Lavender', 'Dahlias', 'Peonies', 'Roses', 'Honeysuckle', 'Climbing Roses'],
    style: {
      overview: 'Gibson Girl Style, Safari Style, Military Braid and Buttons, 1920\'s Looks, hourglass and S shape lines, Sari inspired looks',
      dresses: ['A Line', 'Belted at waist', 'Flowy Fabric', 'Bell sleeve', 'Cape Dresses', 'Mandarin Collar', 'Kimono Dress', 'Wrap dresses'],
      skirts: ['A Line or Straight', 'Peasant style', 'Fine pleats'],
      hair: ['High Bun or on one side', 'Shoulder length hair', 'French bob', 'Side part or all back'],
      shoes: ['Rounded (oval) toe', 'Pointed toe', 'Soft rectangle', 'Ballerina style', 'Ankle boots in suede', 'Wrap straps', 'Riding boots'],
      coats: ['Princess style', 'Riding Style', 'Suede Jacket', 'Cape Coats'],
      accessories: ['Floral Gloves', 'Butterfly and Bird Pins', 'Wrap Belts', 'Corset belts', 'Velvet belts'],
    },
    jewelry: {
      stones: { perfect: ['Pink Coral', 'Pearls', 'Seashells', 'Sapphires', 'Emeralds', 'Rubies', 'Garnet', 'Labradorite', 'Amethyst'] },
      metals: { perfect: ['Rose Gold', 'Gold', 'Silver'] },
      styles: ['Delicate designs of leaves, trees, birds and Flowers', 'Hearts and Lockets', 'Filigree', 'scrollwork', 'Enamel'],
    },
    makeup: {
      soft: 'Skin tones with pastels',
      evening: 'High shade and romantic colors',
    },
    designers: ['Chloe', 'Louis Vuitton'],
    artists: ['Matisse', 'Rossetti'],
  },
];

// =============================================================================
// AUTUMN SUBTYPES
// =============================================================================

export const AUTUMN_SUBTYPES: Subtype[] = [
  {
    id: 'auburn-autumn',
    name: 'Auburn Autumn',
    season: 'autumn',
    palette: {
      colors: ['Prussian Blue', 'Blue-Green', 'Dark Emerald', 'Hunter', 'Bronze Green', 'Terra Cotta', 'Apricot', 'Apricot cream', 'Yellow-Cream', 'Amber', 'Topaz', 'Chocolate Brown'],
    },
    colorCombinations: ['Burnt Orange, Amber and Cream', 'Emerald and Cream', 'Prussian Blue and Terra Cotta', 'Forest Green, Cream and Slate Blue'],
    paletteEffects: ['Mid Autumn', 'Woods and Pine Trees', 'Knight\'s Armour', 'Persian Carpet'],
    fabrics: ['Velvet', 'Tweed', 'Herringbone', 'Blanket wool', 'Aran Knits', 'Irish tweed', 'Linen'],
    prints: ['Herringbone', 'American Indian designs', 'Geometric prints', 'Paisley', 'Hawks', 'Elephants', 'Tigers', 'Pine Trees'],
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Bronze', 'Pewter'] },
      stones: { perfect: ['Topaz', 'Emerald', 'Amber'] },
    },
  },
  {
    id: 'burnished-autumn',
    name: 'Burnished Autumn',
    season: 'autumn',
    palette: {
      skinTones: ['Terra Cotta', 'Apricot', 'Apricot Cream', 'Cream'],
      formal: ['Blue-Black', 'Midnight Blue', 'Prussian Blue', 'Chocolate'],
      hairColor: ['Amber', 'Topaz', 'Chocolate'],
      eyeColor: ['Amber', 'Gold'],
      highShade: ['Emerald Green', 'Prussian Blue'],
      neutrals: ['Grey', 'Grey Brown', 'Rust'],
      romantic: ['Burgundy', 'Maroon', 'Brick Red'],
    },
    colorCombinations: ['Terra Cotta and Cream', 'Emerald, Midnight and Copper', 'Copper, Olive Green and Cream', 'Prussian Blue and Copper'],
    paletteEffects: ['Mediterranean', 'Portuguese Mosaic', 'Spanish Desert', 'Italy 1800\'s', 'Moroccan Textiles'],
    fabrics: ['Shantung', 'Fine Lace', 'Satin', 'Linen', 'Wool/silk mix', 'Denim', 'Cashmere', 'Mohair', 'Fur'],
    prints: ['Sari Motifs', 'Indian prints', 'Paisley', 'Palm Trees', 'Fig Trees', 'Pomegranates', 'Grapes and Vines', 'Pucci Prints'],
    jewelry: {
      stones: { perfect: ['Emeralds', 'Jade', 'Labradorite', 'Pearls'] },
      metals: { perfect: ['Copper', 'Antique Gold', 'Bronze'] },
      styles: ['Rope chains', 'Asymmetrical', 'Branches and Leaves', 'Enamel', 'Mosaic'],
    },
    makeup: {
      dramatic: 'Emerald and Blue eye liner',
      soft: 'Coral/TerraCotta and Cream',
    },
    designers: ['Cavalli', 'Etro'],
    artists: ['Corot', 'Gauguin'],
  },
  {
    id: 'cloisonne-autumn',
    name: 'Cloisonne Autumn',
    season: 'autumn',
    palette: {
      formal: ['Midnight Blue', 'Navy Blue', 'Prussian Blue'],
      neutral: ['Olive', 'Black olive', 'Grey Olive', 'Moss'],
      hairColor: ['Chocolate Brown', 'Amber', 'Golden Brown'],
      skinTones: ['Rose', 'Rose-Peach', 'Apricot', 'Pink Terra Cotta', 'Ecru', 'Ivory'],
      romantic: ['Sangria', 'Soft Red', 'Blush Rose'],
      eyeColor: ['Blue-Green', 'Emerald', 'Seafoam'],
      enlivened: ['Bright Emerald', 'Dark Emerald'],
      highShade: ['Aquamarine', 'Tiffany blue', 'Prussian Blue'],
      metals: ['Antique Gold', 'Rose Gold', 'Pewter'],
    },
    colorCombinations: ['Midnight and Cream', 'Aqua and Peach', 'Sage, Cream and Apricot', 'Sapphire Blue and Tiffany Blue'],
    paletteEffects: ['Cloisonne and Chinoiserie', 'Japanese Garden', 'Kimono Palette', 'English Rose', 'French Girl Look'],
    fabrics: ['Silk Shantung', 'Brocade', 'Tweed', 'Velvet', 'Crocheted Lace', 'Fine Wool', 'Soft Satin', 'Denim', 'Tapestry'],
    prints: ['Soft Plaid', 'Fine Checks', 'Mosaic Prints', 'Porcelain Prints', 'Toile', 'Leaves and Ivy', 'Birds', 'Deer', 'Kimono Prints'],
    jewelry: {
      types: ['Cloisonne', 'Enamel', 'Multi Colored Stones'],
      stones: { perfect: ['Sapphires', 'Emeralds', 'Topaz', 'Jade', 'Opals'] },
      styles: ['Gold Filigree', 'Dangling earrings', 'Feathers and tassels', 'Cameos'],
    },
    designers: ['Chloe', 'Ralph Lauren', 'Ulla Johnson'],
    artists: ['Rossetti', 'Sargent'],
  },
  {
    id: 'grecian-autumn',
    name: 'Grecian Autumn',
    season: 'autumn',
    palette: {
      colors: ['Purple', 'Olive', 'Copper', 'Caramel', 'Terra-Cotta', 'Dark Brown', 'Indigo Blue', 'Sangria', 'Deep Purple'],
    },
    colorCombinations: ['Purple, Olive and Copper', 'Caramel, Terra-Cotta and Dark Brown', 'Indigo Blue and Copper', 'Olive, Sangria and Deep Purple'],
    paletteEffects: ['Grecian Style', 'Indo-Persian Style', 'Indian Sari Prints', 'Spanish Romantic', 'Italian Renaissance'],
    fabrics: ['Sari Fabric', 'Indo-Persian Embroidery', 'Shantung', 'Pleated Chiffon', 'Satin', 'Cashmere', 'Velvet', 'Dark Lace', 'Etro Prints'],
    prints: [],
    jewelry: {
      stones: { perfect: ['Emerald', 'Citrine', 'Topaz', 'Tourmaline', 'Yellow Diamonds'] },
      metals: { perfect: ['Copper', 'Gold', 'Antique Gold'] },
      styles: ['Pave Jewels', 'Moroccan Jewelry', 'Multi Stranded Gold'],
    },
    makeup: {
      lips: { perfect: ['Apricot', 'Terra-Cotta', 'Sangria'] },
      cheeks: { perfect: ['Burnt Orange', 'Lavender'] },
    },
  },
  {
    id: 'mellow-autumn',
    name: 'Mellow Autumn',
    season: 'autumn',
    palette: {
      skinTones: ['Terra Cotta', 'Apricot', 'Soft Coral', 'Cream', 'Peach-Rose'],
      romantic: ['Burgundy', 'Maroon', 'Dark Mauve', 'Coral Pink'],
      formal: ['Black', 'Blue Black', 'Prussian Blue', 'Midnight Blue'],
      hairColor: ['Chocolate', 'Amber', 'Topaz'],
      eyeColor: ['Golden Brown', 'Gold', 'Olive', 'Golden Green'],
      neutrals: ['Mushrooms', 'Charcoals', 'Olive', 'Deep Purple', 'Raisin'],
      metallics: ['Gold', 'Bronze', 'Copper', 'Pewter'],
      enlivened: ['Dark Teal', 'Grey Green', 'Blue Green'],
      highNote: ['Bright Teal', 'Prussian Blue', 'Emerald'],
    },
    colorCombinations: ['Teal, Apricot and Cream', 'Charcoal, Pewter and Cream', 'Terra Cotta, Olive and Teal', 'Gold and Dark Emerald'],
    paletteEffects: ['Grecian Princess', 'Mediterranean Palette', 'End of Autumn', 'Spanish Desert', 'Ancient Japan', 'Renaissance Italy'],
    fabrics: ['Denim', 'Fur', 'Mohair', 'Tweed', 'Leather', 'Suede', 'Shantung', 'Chiffon', 'Velvet', 'Brocade', 'Tapestry'],
    prints: ['Paisley', 'Herringbone', 'Houndstooth', 'Prince of Wales', 'Leaves', 'Branches', 'Moroccan Tile', 'Animal print', 'Feathers'],
    jewelry: {
      metals: { perfect: ['Copper', 'Antique Gold', 'Pewter', 'Yellow Gold'] },
      stones: { perfect: ['Topaz', 'Emerald', 'Amber', 'Citrine', 'Labradorite', 'Pearls', 'Coral', 'Jade', 'Ivory'] },
      styles: ['Braided gold', 'chain link', 'rope necklaces', 'Leaves, Coins, Feathers', 'Filigree', 'Enamel'],
    },
    eras: ['19th Century Morocco', '19th Century Spain and Italy', '1940\'s', '1920\'s Art Deco'],
    artists: ['Modigliani', 'Corot'],
    designers: ['Etro', 'Cuccinelli', 'Ralph Lauren'],
  },
  {
    id: 'multi-colored-autumn',
    name: 'Multi-Colored Autumn',
    season: 'autumn',
    palette: {
      colors: ['Putty', 'Ecru', 'Oyster-Shell', 'Soft Terra Cotta', 'Pink-Browns', 'Prussian Blue', 'Cobalt Blue', 'Olive Green', 'Sap Green', 'Black Green', 'Bright Coral Orange', 'Rust Red', 'Gold', 'Black Brown', 'Emerald', 'Raisin', 'Deep Purple'],
    },
    colorCombinations: ['Coral and Ecru', 'Black Brown, Gold and Ecru', 'Coral and Emerald', 'Cobalt Blue and Gold'],
    paletteEffects: ['Multicolored Gems and Tapestry', 'Queen Esther Palette', 'Coat of Many Colors', 'Persian Design', 'Spanish Renaissance'],
    fabrics: ['Chiffon', 'Black/Brown lace', 'Linen', 'Satin', 'Cashmere', 'Pashmina', 'Sari cloth', 'Suede', 'Velvet', 'Embossed leather'],
    prints: [],
    style: {
      recommendations: ['Mix fabrics and textures', 'Asymmetrical hemlines', 'Wrap dresses, V neckline', 'Renaissance details', 'Cape like wraps', 'Mandarin Collar'],
    },
    jewelry: {
      stones: { perfect: ['Jasper', 'Labradorite', 'Coral', 'Turquoise', 'Topaz', 'Amber', 'Green Onyx', 'Ivory', 'Yellow diamonds'] },
      styles: ['Braided chains', 'Links', 'Woven Gold', 'Ropes and Tassels', 'Crescent Shaped', 'Chandelier earrings', 'Animal shapes', 'Cloisonne', 'Enamel'],
    },
    makeup: {
      options: ['Orange lip with Neutral cheek', 'Kohl eyeliner with Nude lip', 'Rust Red lip with Smokey eye', 'Gold eyeshadow for evening'],
    },
    artists: ['El Greco', 'Corot', 'Modigliani'],
    designers: ['Cavalli', 'Missoni', 'Brunello Cuccinelli'],
  },
  {
    id: 'persian-autumn',
    name: 'Persian Autumn',
    season: 'autumn',
    palette: {
      formal: ['Midnight Blue', 'Black Lace', 'Midnight Green'],
      neutral: ['Olive', 'Black Olive', 'Burgundy', 'Deep Purple'],
      hairColor: ['Chocolate Brown', 'Golden Brown', 'Amber', 'Topaz'],
      skinTones: ['Terra Cotta', 'Soft Peach', 'Rose-Terra Cotta'],
      romantic: ['Coral', 'Red Coral', 'Orange', 'Rust', 'Wine Red'],
      eyeColor: ['Coffee', 'Caramel', 'Black Brown'],
      enlivened: ['Jade', 'Emerald'],
      highShade: ['Prussian Blue', 'Soft Turquoise'],
      metals: ['Copper', 'Antique Gold', 'Yellow Gold', 'Pewter'],
    },
    colorCombinations: ['Prussian Blue and Cream', 'Burgundy, Sage and Ecru', 'Turquoise and Silver', 'Purple, Coral and Ivory'],
    paletteEffects: ['Spanish Desert', 'Moroccan Tile', 'Italian Seaside', 'Japanese Garden'],
    fabrics: ['Metallic Chiffon', 'Lace', 'Wool Knit', 'Silk Shantung', 'Denim', 'Leather', 'Suede', 'Sari Fabric', 'Tweed'],
    prints: ['Birds, Tigers, Elephants and Leopards', 'Paisley', 'Geometric Shapes', 'Mosaic patterns', 'Kimono Prints', 'Pagodas', 'Missoni Stripe', 'Peacock feathers'],
    jewelry: {
      metals: { perfect: ['Gold', 'Antique gold', 'Copper', 'Pewter'] },
      stones: { perfect: ['Polished Jade', 'Amber', 'Pearls', 'Ivory'] },
      styles: ['Birds, Branches, Leaves and Feathers', 'Hammered gold', 'Mosaic and Enamel designs'],
    },
    designers: ['Etro', 'Dries Van Noten', 'Cavalli'],
    artists: ['Corot', 'Modigliani', 'Gauguin'],
  },
  {
    id: 'renaissance-autumn',
    name: 'Renaissance Autumn',
    season: 'autumn',
    palette: {
      formal: ['Midnight Blue', 'Navy Blue', 'Prussian Blue'],
      neutral: ['Charcoal', 'Pewter', 'Slate', 'Dove-Greys'],
      hairColor: ['Chocolate Brown', 'Amber', 'Golden Brown', 'Camel'],
      skinTones: ['Terra Cotta', 'Apricot', 'Pink Terra Cotta', 'Ecru', 'Ivory', 'Champagne'],
      romantic: ['Sangria', 'Coral', 'Coral Red'],
      eyeColor: ['Blue-Green', 'Emerald', 'Seafoam', 'Deep Green'],
      enlivened: ['Green', 'Teal', 'Dark Emeralds'],
      highShade: ['Aquamarine', 'Tiffany blue', 'Cobalt'],
      metals: ['Antique Gold', 'Pewter', 'Yellow Gold', 'Bronze', 'Copper'],
    },
    colorCombinations: ['Ivory, Sage Green, Maroon', 'Cobalt and Gold', 'Champagne and Chocolate', 'Midnight Blue and Dark Emerald'],
    paletteEffects: ['Renaissance Queen', 'Mediterranean Palette', 'Medieval Spanish and Italian', 'Persian and Moroccan', 'Guinevere'],
    fabrics: ['Silk shantung', 'Silk', 'Satin', 'Taffeta', 'Velvet', 'Corduroy', 'Denim', 'Cashmere', 'Pashmina', 'Lace', 'Sari silk', 'Tapestries', 'Tweed', 'Leather', 'Suede', 'Mohair', 'Etro Prints'],
    prints: ['Printed chiffon of houses, Trees, Water', 'Leaf and Branch prints', 'Paisley', 'Tiger, Zebra, leopard', 'Ostrich and Peacock feathers', 'Houndstooth', 'Burberry Plaid', 'Military braid and Gold buttons'],
    jewelry: {
      metals: { perfect: ['Gold', 'Pewter', 'Copper', 'Silver'] },
      stones: { perfect: ['Pearls', 'shells', 'amber', 'Topaz', 'Jade', 'Onyx', 'Opals', 'Blue Topaz'] },
      styles: ['Rope necklaces', 'Chain links', 'Indian and Persian designs', 'Grapes, wheat, leaves motifs'],
    },
    designers: ['Etro', 'Dries Van Noten'],
    artists: ['John Singer Sargent'],
  },
  {
    id: 'sunlit-autumn',
    name: 'Sunlit Autumn',
    season: 'autumn',
    beautyStatement: 'Like an Early September day. Leaves just changing, mix of flowers, fruits and leaves',
    palette: {
      skinTones: ['Terra Cotta', 'Rose Terra Cotta', 'Apricot', 'Apricot-cream', 'Ecru', 'Cream'],
      romantic: ['Sangria', 'Red Brown', 'Burgundy', 'Raisin'],
      formal: ['Black', 'Midnight Blue', 'Midnight Green', 'Black Brown'],
      hairColor: ['Walnut', 'Dark Brown', 'Golden Brown', 'Caramel'],
      eyeColor: ['Blue Green', 'Olive Green', 'Light Olive'],
      neutral: ['Plum', 'Deep purple', 'Olive'],
      metallics: ['Silver', 'Gold', 'Antique Silver', 'Burnished Silver'],
      enlivened: ['Sea Green', 'Emerald Green', 'Deep Green'],
      highNote: ['Bright blue', 'Midnight Blue', 'Aqua', 'Sea Green'],
    },
    colorCombinations: ['Ivory, Gold and Olive', 'Plum, Gold and Silver', 'Rose, Apricot and Cream', 'Midnight Blue, Chocolate Brown and Gold', 'Dark Brown, Caramel and Gold'],
    paletteEffects: ['Sunlight in Early Autumn', 'Mediterranean seaside', 'Boats and Sunset', 'Harvest'],
    fabrics: ['Heavy lace', 'Crocheted lace', 'Fine lace', 'Gold and Copper lace', 'Jersey wool', 'Boucle', 'Irish knits', 'Tweed', 'velvet', 'brocade', 'Denim', 'Leather', 'Suede', 'Feathers', 'Chambray', 'organza', 'linen', 'Cashmere', 'Angora', 'Mohair', 'Fur'],
    prints: ['Leaves and Flowers', 'Fan shaped flowers', 'Palm trees', 'Wheat', 'Plaid', 'Herringbone', 'Chevron', 'Missoni', 'Prince of Wales', 'Butterflies', 'exotic birds', 'tropical flowers', 'Leopards, Cheetah, Tiger', 'Paisley', 'Indian prints', 'Persian rug prints'],
    jewelry: {
      stones: { perfect: ['Emeralds', 'ivory', 'Jade', 'Blue Topaz', 'Topaz', 'Pearls', 'pink coral', 'white coral'] },
      metals: { perfect: ['Gold', 'antique gold', 'antique silver'] },
      styles: ['Links', 'ropes and chains', 'Birds, wings, feathers', 'Tassels', 'Egyptian motifs', 'Persian paisley', 'Seashell and fan earrings'],
    },
    eras: ['1970\'s', 'Classic Grecian', 'Mediterranean looks', 'Egyptian'],
    artists: ['Van Gogh', 'Da Vinci'],
    designers: ['Cavalli', 'Dries Van Noten', 'Brunello Cuccinelli'],
  },
  {
    id: 'tapestry-autumn',
    name: 'Tapestry Autumn',
    season: 'autumn',
    palette: {
      formal: ['Midnight Blue', 'Prussian Blue'],
      neutral: ['Olive', 'Black Olive', 'Burgundy', 'Maroon', 'Purple', 'Raisin'],
      hairColor: ['Golden Brown', 'Amber', 'Chocolate Brown'],
      skinTones: ['Terra Cotta', 'Soft Peach', 'Ivory', 'Cream'],
      romantic: ['Coral', 'Coral Pink', 'Soft Rust'],
      eyeColor: ['Green', 'Golden Green', 'Emerald', 'Aqua'],
      enlivened: ['Emerald Green-Bright', 'Blue-Green'],
      highShade: ['Cobalt Blue', 'Bright Prussian Blue'],
      metals: ['Copper', 'Bronze', 'Antique Gold', 'Pewter'],
    },
    colorCombinations: ['Midnight Blue and Cream', 'Terra Cotta, Coral and Cream', 'Emerald, Cobalt and Gold', 'Olive, Purple and Coral'],
    paletteEffects: ['Spanish Sunset', 'Mediterranean Seaside', 'Spanish Princess', 'French Girl Chic'],
    fabrics: ['Silk Shantung', 'Silk-Linen', 'Linen-Cotton', 'Denim', 'Fur', 'Suede', 'Velvet', 'Satin', 'Boucle', 'Tweed', 'Cashmere', 'Tapestry', 'Brocade'],
    prints: ['Paisley', 'Mosaic', 'Tile patterns', 'Spanish motifs', 'Mediterranean prints', 'Fruit and Vine', 'Leaves and Branches', 'Animal prints'],
    jewelry: {
      metals: { perfect: ['Copper', 'Bronze', 'Antique Gold', 'Pewter'] },
      stones: { perfect: ['Coral', 'Amber', 'Topaz', 'Jade', 'Turquoise'] },
      styles: ['Mosaic designs', 'Tapestry inspired', 'Ethnic patterns', 'Coins', 'Links'],
    },
    designers: ['Etro', 'Missoni'],
    artists: ['Corot'],
  },
  {
    id: 'topaz-autumn',
    name: 'Topaz Autumn',
    season: 'autumn',
    palette: {
      formal: ['Midnight Blue', 'Prussian Blue', 'Black Brown'],
      neutral: ['Olive', 'Brown Olive', 'Raisin', 'Deep Purple'],
      hairColor: ['Golden Brown', 'Amber', 'Chocolate', 'Topaz'],
      skinTones: ['Terra Cotta', 'Apricot', 'Soft Peach', 'Cream', 'Ecru'],
      romantic: ['Burgundy', 'Wine', 'Coral', 'Rust'],
      eyeColor: ['Topaz', 'Amber', 'Golden Brown', 'Olive'],
      enlivened: ['Emerald', 'Teal', 'Blue Green'],
      highShade: ['Cobalt', 'Sapphire', 'Bright Teal'],
      metals: ['Gold', 'Antique Gold', 'Copper', 'Bronze'],
    },
    colorCombinations: ['Amber, Cream and Olive', 'Emerald and Gold', 'Burgundy and Cream', 'Teal and Topaz'],
    paletteEffects: ['Autumn Jewels', 'Golden Harvest', 'Mediterranean Autumn', 'Spanish Gold'],
    fabrics: ['Silk Shantung', 'Velvet', 'Suede', 'Leather', 'Tweed', 'Cashmere', 'Wool', 'Brocade', 'Satin', 'Linen'],
    prints: ['Paisley', 'Leaves and Branches', 'Geometric', 'Animal prints', 'Ethnic patterns', 'Mosaic'],
    jewelry: {
      metals: { perfect: ['Gold', 'Antique Gold', 'Copper', 'Bronze'] },
      stones: { perfect: ['Topaz', 'Amber', 'Citrine', 'Yellow Sapphire', 'Emerald', 'Jade'] },
      styles: ['Links', 'Chains', 'Coins', 'Leaves and Branches', 'Ethnic designs'],
    },
    designers: ['Etro', 'Cavalli'],
    artists: ['Corot', 'Modigliani'],
  },
];

// =============================================================================
// WINTER SUBTYPES
// =============================================================================

export const WINTER_SUBTYPES: Subtype[] = [
  {
    id: 'burnished-winter',
    name: 'Burnished Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Blue-Black', 'Midnight Blue', 'Charcoal'],
      neutral: ['Pewter', 'Gunmetal', 'Grey', 'Brown-Grey'],
      hairColor: ['Black-Brown', 'Chocolate', 'Dark Amber'],
      skinTones: ['Rose Terra Cotta', 'Terra Cotta', 'Apricot', 'Cream', 'Ivory'],
      romantic: ['Burgundy', 'Wine', 'Sangria', 'Maroon'],
      eyeColor: ['Topaz', 'Amber', 'Golden Brown', 'Black Brown'],
      enlivened: ['Emerald', 'Teal', 'Blue Green'],
      highShade: ['Cobalt Blue', 'Sapphire', 'Bright Emerald'],
      pastels: ['Sage', 'Silver', 'Cream', 'Soft Apricot'],
      metals: ['Antique Gold', 'Pewter', 'Silver', 'Platinum'],
    },
    colorCombinations: [
      'Midnight Blue and Gold',
      'Burgundy, Cream and Emerald',
      'Charcoal, Silver and Cream',
      'Sapphire and Antique Gold',
      'Emerald, Burgundy and Ivory',
      'Pewter, Grey and Rose',
      'Black and Cream',
    ],
    paletteEffects: ['Winter Sunset', 'Medieval Knight', 'Spanish Renaissance', 'Antique Tapestry'],
    fabrics: ['Velvet', 'Brocade', 'Tapestry', 'Silk Shantung', 'Satin', 'Cashmere', 'Fine Wool', 'Leather', 'Suede', 'Tweed', 'Lace', 'Metallic Weave'],
    prints: ['Paisley', 'Brocade patterns', 'Tapestry designs', 'Herringbone', 'Houndstooth', 'Animal prints', 'Leopard', 'Mosaic', 'Tile prints', 'Medieval motifs'],
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Pewter', 'Silver', 'Platinum'] },
      stones: { perfect: ['Emeralds', 'Sapphires', 'Rubies', 'Topaz', 'Amber', 'Diamonds'] },
      styles: ['Links', 'Chains', 'Rope designs', 'Medieval inspired', 'Coins', 'Filigree'],
    },
    makeup: {
      dramatic: 'Deep reds with emerald or sapphire eye',
      soft: 'Skin tones with gold accents',
    },
  },
  {
    id: 'cameo-winter',
    name: 'Cameo Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Navy Blue', 'Midnight Blue', 'Charcoal'],
      neutral: ['Silver Grey', 'Pewter', 'Dove Grey', 'Taupe'],
      hairColor: ['Black-Brown', 'Chocolate', 'Dark Brown'],
      skinTones: ['Rose', 'Pink Rose', 'Cameo Pink', 'Cream', 'Porcelain'],
      romantic: ['Wine', 'Burgundy', 'Deep Rose', 'Claret'],
      eyeColor: ['Blue', 'Grey Blue', 'Violet', 'Deep Blue'],
      enlivened: ['Emerald', 'Teal', 'Deep Teal'],
      highShade: ['Sapphire', 'Cobalt', 'Royal Blue'],
      pastels: ['Lavender', 'Soft Pink', 'Silver', 'Ice Blue'],
      metals: ['Silver', 'White Gold', 'Platinum', 'Rose Gold'],
    },
    colorCombinations: [
      'Navy and Silver',
      'Wine and Cream',
      'Sapphire and Rose',
      'Black and Lavender',
      'Emerald and Silver',
      'Charcoal and Ice Blue',
      'Burgundy and Pewter',
    ],
    paletteEffects: ['Cameo Portrait', 'Victorian Rose', 'Winter Rose Garden', 'Edwardian Elegance'],
    fabrics: ['Velvet', 'Satin', 'Fine Lace', 'Chiffon', 'Silk', 'Cashmere', 'Fine Wool', 'Brocade', 'Organza'],
    prints: ['Cameos', 'Roses', 'Victorian florals', 'Lace patterns', 'Fine stripes', 'Delicate geometrics', 'Ribbons', 'Pearls'],
    jewelry: {
      metals: { perfect: ['Silver', 'White Gold', 'Platinum', 'Rose Gold'] },
      stones: { perfect: ['Cameos', 'Pearls', 'Sapphires', 'Diamonds', 'Amethyst', 'Blue Topaz'] },
      styles: ['Cameos', 'Filigree', 'Victorian designs', 'Delicate chains', 'Pearl strands', 'Lockets'],
    },
    makeup: {
      dramatic: 'Deep wine lip with sapphire eye',
      soft: 'Rose and cream with soft grey eye',
    },
  },
  {
    id: 'crystal-winter',
    name: 'Crystal Winter',
    season: 'winter',
    palette: {
      formal: ['Navy', 'Midnight Blue', 'Black'],
      neutral: ['Silver', 'Pewter', 'Grey', 'Charcoal'],
      hairColor: ['Chocolate Brown', 'Dark Brown', 'Black-Brown'],
      skinTones: ['Ice-Pink', 'Silver-Pink', 'Rose', 'Cream', 'Porcelain'],
      romantic: ['Deep Rose', 'Raspberry', 'Burgundy'],
      eyeColor: ['Bottle Green', 'Glass Green', 'Emerald', 'Blue-Green'],
      enlivened: ['Teal', 'Emerald', 'Purple'],
      highShade: ['Bright Emerald', 'Sapphire'],
      pastels: ['Violet', 'Mint', 'Silver', 'Sage', 'Ice Pink'],
      metals: ['White Gold', 'Silver', 'Rose Gold', 'Platinum'],
    },
    colorCombinations: [
      'Navy and Ice Pink',
      'Emerald and Silver',
      'Black and Mint',
      'Midnight Blue and Rose',
      'Purple and Silver',
      'Teal and Cream',
      'Raspberry and Grey',
    ],
    paletteEffects: ['Ice Crystal', 'Winter Forest', 'Frozen Lake', 'Crystal Palace'],
    fabrics: ['Fine Corduroy', 'Metallic fabrics', 'Velvet', 'Crystal embellished', 'Lace', 'Eyelet', 'Denim', 'Tulle', 'Satin', 'Silk'],
    prints: ['Paisley', 'Leopard with flowers', 'Geometric', 'Tropical flowers', 'Silver hearts', 'Lockets', 'William Morris designs', 'Stripes'],
    style: {
      looks: ['Safari', 'Striped resort', 'Chanel style', 'A-line', 'Pencil skirts', 'Puff sleeve', 'Princess cut'],
      shoes: ['Pointed toe', 'Ballet flats', 'Ankle boots'],
    },
    jewelry: {
      metals: { perfect: ['White Gold', 'Silver', 'Rose Gold', 'Platinum'] },
      stones: { perfect: ['Diamonds', 'Emeralds', 'Sapphires', 'Rubies', 'Green Glass'] },
      styles: ['Hearts', 'Lockets', 'Etched silver', 'Enamel', 'Pave', 'Floral motifs'],
    },
    makeup: {
      soft: 'Pink with bottle green soft liner',
      dramatic: 'Raspberry lip with emerald eye',
    },
    designers: ['Chanel', 'Bluemarine', 'Chloe'],
    artists: ['Matisse', 'Picasso'],
  },
  {
    id: 'exotic-winter',
    name: 'Exotic Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Blue-Black', 'Midnight Blue', 'Midnight Green'],
      neutral: ['Charcoal', 'Pewter', 'Deep Purple', 'Raisin'],
      hairColor: ['Black', 'Black-Brown', 'Dark Chocolate'],
      skinTones: ['Dark Terra Cotta', 'Bronze', 'Copper', 'Warm Brown', 'Cream'],
      romantic: ['Wine', 'Burgundy', 'Deep Red', 'Sangria'],
      eyeColor: ['Black Brown', 'Dark Amber', 'Onyx'],
      enlivened: ['Emerald', 'Teal', 'Peacock Blue'],
      highShade: ['Cobalt', 'Sapphire', 'Bright Teal'],
      pastels: ['Sage', 'Cream', 'Soft Gold'],
      metals: ['Gold', 'Antique Gold', 'Bronze', 'Copper'],
    },
    colorCombinations: [
      'Black and Gold',
      'Emerald and Burgundy',
      'Midnight Blue and Bronze',
      'Wine and Cream',
      'Peacock Blue and Gold',
      'Sapphire and Copper',
    ],
    paletteEffects: ['Exotic Princess', 'Persian Night', 'Moroccan Palace', 'Indian Empress'],
    fabrics: ['Silk Shantung', 'Brocade', 'Velvet', 'Satin', 'Metallic weave', 'Sari fabric', 'Lace', 'Embroidered silk', 'Jacquard'],
    prints: ['Paisley', 'Persian designs', 'Moroccan tile', 'Ethnic prints', 'Animal prints', 'Peacock feathers', 'Indian motifs', 'Abstract geometrics'],
    jewelry: {
      metals: { perfect: ['Gold', 'Antique Gold', 'Bronze', 'Copper'] },
      stones: { perfect: ['Emeralds', 'Rubies', 'Sapphires', 'Onyx', 'Tiger Eye', 'Amber'] },
      styles: ['Chandelier earrings', 'Layered chains', 'Cuffs', 'Indian inspired', 'Persian motifs', 'Coins'],
    },
    makeup: {
      dramatic: 'Kohl eyes with wine lip',
      soft: 'Bronze and gold tones',
    },
  },
  {
    id: 'fairy-tale-winter',
    name: 'Fairy Tale Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Midnight Blue', 'Midnight Green'],
      neutral: ['Mushroom', 'Taupe', 'Grey Olive', 'Black-Olive', 'Deep Purple'],
      hairColor: ['Black-Brown', 'Chocolate', 'Amber'],
      skinTones: ['Rose Terra Cotta', 'Rose-Mauve', 'Apricot', 'Dusty Apricot', 'Cream'],
      romantic: ['Wine', 'Deep Red', 'Purple Red', 'Plum'],
      eyeColor: ['Emerald Green', 'Blue Green', 'Teal'],
      enlivened: ['Emerald', 'Sapphire Blue'],
      highShade: ['Sapphire Blue', 'Prussian Blue'],
      pastels: ['Sage', 'Mauve', 'Cream', 'Soft Purple'],
      metals: ['White Gold', 'Yellow Gold', 'Copper-Gold'],
    },
    colorCombinations: [
      'Midnight Blue and Cream',
      'Emerald and Gold',
      'Wine and Ivory',
      'Purple and Sage',
      'Black and Rose',
      'Sapphire and Mauve',
    ],
    paletteEffects: ['Biblical', 'Edwardian', 'Renaissance', 'Grecian', 'Hungarian folk', 'Fairy tale', 'Riding costume', '1920\'s', '1960\'s'],
    fabrics: ['Silk', 'Satin', 'Fine Lace', 'Crocheted Lace', 'Wool Lace', 'Metallic threads (knights armor)', 'Tweed', 'Two-tone', 'Cashmere', 'Embossed leather', 'Suede', 'Fur', 'Denim', 'Chambray', 'Jersey', 'Damask', 'Tapestry', 'Brocade', 'Velvet', 'Cut Velvet'],
    prints: ['Swirls', 'Handwriting', 'Chinese script', 'Scallops', 'Fans', 'Tropical flowers-leaves', 'Roses', 'Lilies', 'Calla lilies', 'Grapes', 'Leaves', 'Branches', 'Trompe l\'oeil', 'Cameo-ribbon', 'Pearls', 'Paisley', 'Suit stripes', 'Braided/twisted rope', 'Tassels', 'Feathers', 'Wings', 'Birds', 'Leopard', 'Cheetah', 'Small forest animals', 'Deer', 'Ostrich feathers', 'Military buttons', 'Hungarian embroidery', 'Polka dots', 'Lace prints'],
    style: {
      looks: ['Safari', 'Sari', 'Grecian', 'Draped', 'Romanesque', 'Diagonal', 'Pleated', 'Column', 'Military'],
      dresses: ['Deep V back', 'Cape collar', 'A-line', 'Pencil skirts', 'Wrap', 'Side tied', 'Kaftan', 'Mandarin'],
      sleeves: ['Sharp puff', 'Pleated sleeve', 'Trumpet sleeve'],
      shoes: ['Grecian sandals', 'Brocade-suede espadrilles', 'Oval-pointed leather', 'Olive army boots', 'Wrap sandals', 'Side button ankle boots', 'Two-fabric shoes'],
      coats: ['Military coat', 'Side buttoned mohair-cashmere', 'Cape coat', 'Tweed', 'Belted trench', 'Leather flying jacket'],
    },
    jewelry: {
      metals: { perfect: ['White Gold', 'Yellow Gold', 'Copper-Gold'] },
      stones: { perfect: ['Garnet', 'Emeralds', 'Sapphires', 'Jade', 'Aquamarine', 'Coral roses', 'Carved ivory', 'Pearls', 'White Coral', 'Mother of Pearl'] },
      styles: ['Cameos', 'Ribbon necklaces', 'Suede necklaces', 'Gold chains', 'Links', 'Rope chains', 'Lockets', 'Birds', 'Wings', 'Feathers', 'Enamel', 'Filigree', 'Ribbons', 'Fans', 'Camelias'],
    },
    makeup: {
      evening: 'Red lip with blue green liner',
      everyday: 'Apricot/mauve/rose with olive liner',
    },
    artists: ['Vermeer', 'Leonardo Da Vinci'],
  },
  {
    id: 'gemstone-winter',
    name: 'Gemstone Winter',
    season: 'winter',
    beautyStatement: 'This Palette blends cool blues and purples along with warmer earth tones. Like a blue lake at sunset.',
    palette: {
      skinTones: ['Terra Cotta Rose', 'Apricot Rose', 'Mauve Rose', 'Mauve Terra Cotta', 'Cream', 'Ecru-Cream'],
      romantic: ['Sangria', 'Wine', 'Burgundy', 'Soft Red'],
      formal: ['Midnight Blue', 'Black', 'Sapphire Blue', 'Midnight Green'],
      hairColor: ['Chocolate', 'Black-Brown', 'Amber'],
      eyeColor: ['Golden Green', 'Green', 'Olive'],
      neutral: ['Slate Blue', 'Grey Blue', 'Confederate Blue'],
      metallics: ['Gold', 'Pewter', 'Silver', 'Rose Gold'],
      enlivened: ['Blue Green', 'Prussian Blue', 'Teal-Blue'],
      highNote: ['Electric Blue'],
      pastels: ['Seafoam Green', 'Aqua', 'Blue-Green'],
    },
    colorCombinations: [
      'Olive, Raisin, Midnight Blue',
      'Raisin, Deep Purple, Emerald',
      'Cream, Terra Cotta Rose and Red',
      'Sapphire Blue and Ivory',
      'Ivory, Bright Blue and Blue-Grey',
      'Amber Brown, Olive and Mushroom',
      'Taupe, Dark Mushroom and Ivory',
      'Mosaic Flowers and Leaves',
      'Fruit, Branches, Leaves and Vines',
    ],
    paletteEffects: ['Jewel Tone Palette', 'Bouquet of Roses', 'Blue Lake at sunset'],
    fabrics: ['Lace', 'Fine Lace', 'Linen', 'Linen Cotton', 'Denim', 'Chambray', 'Velvet', 'Cut Velvet', 'Fine tweed', 'Fur', 'Cashmere', 'Angora', 'Tulle', 'Toile', 'Sheep Boucle', 'Satin', 'Silk', 'Shantung'],
    prints: ['Houndstooth', 'Fine Stripe', 'Toile prints', 'Plaid', 'Roses and Branches', 'Hibiscus Flowers', 'Tropical Flowers and Leaves', 'Gardenias', 'Lotus Flowers', 'Grapes, Grape Leaves, Pomegranates, Apples', 'Small Diamonds', 'Chevron', 'Tweed', 'Missoni Prints', 'Paisley', 'Mosaic Prints', 'Fleur De Lis', 'Lace prints', 'Trompe L\'oeil', 'Birds, Deer and Elephants', 'Embossed leather', 'Peacock Feathers', 'Ostrich Feathers', 'Silk Tassels', 'Lilies', 'Water lilies', 'Calla Lilies'],
    style: {
      overview: 'Romantic and Elegant Style',
      dresses: ['Sari inspired', 'Wrap dresses', 'Safari Dress', 'A Line Dress', 'Grecian Draped Dress', 'Draped panels'],
      skirts: ['Wrap a line skirts', 'Diagonal sashes', 'Striped linen skirts'],
      tops: ['Wrap Top', 'V neck', 'Boat neck', 'oval neckline', 'Sweetheart neckline'],
      sleeves: ['Puffed sleeve tight at wrists', 'Bell sleeve', 'Butterfly sleeve', 'draped sleeve'],
      collars: ['V neck', 'oval neck', 'boat neck', 'mandarin Collar', 'Military Collar', 'Epaulettes'],
      shoes: ['Oval', 'Ballet flats', 'espadrilles', 'Riding boots', 'ankle boots'],
      coats: ['Cape coat', 'Military coat', 'Fur Collar coat', 'leather jacket with wide lapels'],
      recommendations: ['Mix streamlined dress with romantic element', 'Simple dresses with many delicate chains', 'Detailed dress with one statement piece'],
    },
    jewelry: {
      metals: { perfect: ['Rose Gold', 'Platinum', 'Silver', 'Gold'] },
      stones: { perfect: ['Pearls', 'Sapphires', 'Amethyst', 'Carnelian', 'Garnets', 'Rubies'] },
      styles: ['Filigree', 'Enamel', 'Pave', 'Links', 'Braided Chains', 'Floral Enamel', 'Birds', 'Feathers', 'Leaves', 'Water Lilies', 'Lotus flowers'],
    },
    makeup: {
      dramatic: 'Dramatic colors for evening',
      soft: 'Rose colored and seafoam for less formal look',
    },
    eras: ['Persian', 'Indian', 'Edwardian', 'Romanian peasant style'],
    artists: ['Modigliani', 'Da Vinci'],
  },
  {
    id: 'mediterranean-winter',
    name: 'Mediterranean Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Blue Black', 'Midnight Blue', 'Midnight Green', 'Charcoal'],
      neutral: ['Olives', 'Brown Olives', 'Dark Purples', 'Raisin', 'Maroon'],
      hairColor: ['Chocolate Brown', 'Black Brown'],
      skinTones: ['Dark Terra Cotta', 'Rose Terra Cotta', 'Dark Apricot', 'Apricot', 'Cream', 'Ecru', 'Ivory'],
      romantic: ['Burgundy', 'Sangria', 'Maroon'],
      eyeColor: ['Amber', 'Copper', 'Topaz'],
      enlivened: ['Dark Teal', 'Soft Teal', 'Blue Green'],
      highShade: ['Prussian Blue', 'Blue Green', 'Bright Teal'],
      pastels: ['Soft purples', 'Grey Purples', 'Sage', 'Light Olive', 'Moss', 'Cream', 'Yellow-Cream'],
      metals: ['Copper', 'Antique Gold', 'Yellow Gold', 'Pewter'],
    },
    colorCombinations: [
      'Olive, Terra Cotta and Ivory',
      'Midnight, Charcoal and Golden cream',
      'Gold and Prussian Blue',
      'Brown-Olive, Purple and Apricot',
      'Emerald Green and Cobalt Blue',
      'Soft Purple, Pastel Purple and Sage',
      'Emerald, Sage and Cream',
      'Teal, Olive and Dusty Peach',
    ],
    paletteEffects: ['Spanish Mountains', 'Mediterranean Palette', 'Queen Esther', 'Moroccan Mosaics', 'Spanish Tiles', 'Early Winter Sunset'],
    fabrics: ['Shantung', 'Jersey', 'Crushed Velvet', 'Cut Velvet', 'Corduroy', 'Suit Fabric', 'Fine wool', 'Tweed', 'Linen', 'Linen Cotton mix', 'Lace', 'Boucle', 'Polished Cotton', 'Brocade', 'Tapestry'],
    prints: ['Mosaic', 'Fine stripes', 'Geometric Patterns', 'Tile Prints', 'Leaves', 'Branches', 'Houses', 'Pitchers', 'Feathers', 'Trees', 'Leopard', 'Tiger', 'Zebra', 'Plaid', 'Missoni Prints', 'Pinstripes', 'Ombre Chiffon Prints', 'Mountain and Water prints', 'Indian and Persian Embroidery', 'Lilies', 'Parrot Flowers', 'Roses', 'Wheat', 'Grapes', 'Apples', 'Toile'],
    style: {
      looks: ['Diagonal Lines and A line', 'Safari Style', 'Indian Sari style', 'Grecian Style with pleats and drape'],
      details: ['Sharp tailoring combined with flowy effects', 'Sharp Bell sleeve', 'Handkerchief hem', 'Wrap dresses', 'Wrap tops and skirts pulled in at waist', 'Deep v neck with shell', 'boat neck', 'deep oval'],
      shoes: ['Small rectangular toe', 'oval toe', 'sharp point'],
    },
    jewelry: {
      metals: { perfect: ['Gold', 'Antique Gold', 'Copper', 'Pewter', 'Antique Silver'] },
      stones: { perfect: ['Amber', 'Topaz', 'Coral', 'Labradorite', 'Jade', 'Ivory', 'Agate', 'Onyx', 'Jasper'] },
      styles: ['Rope and Links for chains', 'Layered chains of different textures', 'Green and Coral beads', 'Large opaque stones', 'Irregular shaped stones', 'Beaded or Braided settings', 'Chandelier earrings', 'Leaf and Feather shaped earrings', 'Pear or rectangular earrings'],
    },
    makeup: {
      evening: 'High shades, blues and greens and deep reds. Satin lipstick',
      soft: 'Earth tones and terra cotta\'s',
    },
    designers: ['Etro', 'Brunello Cuccinelli', 'Missoni'],
    artists: ['Corot', 'Modigliani'],
  },
  {
    id: 'multi-colored-winter',
    name: 'Multi-Colored Winter',
    season: 'winter',
    palette: {
      skinTones: ['Coral-Terra Cotta', 'Rose Terra Cotta', 'Apricot', 'Soft Peach', 'Cream'],
      hairColor: ['Caramel', 'Dark Brown', 'Black Brown', 'Wheat', 'Golden Brown'],
      eyeColor: ['Blue-Green', 'Aquamarine', 'Emerald', 'Slate Blue'],
      formal: ['Black', 'Midnight Blue', 'Midnight Green', 'Grey Blue'],
      neutral: ['Black Olive', 'Grey-Green', 'Dark Blue Green', 'Plum', 'Raisin', 'Dark Purple'],
      romantic: ['Coral', 'Red Coral', 'Terra Cotta-Red', 'Scarlett', 'Vermillion'],
      highShade: ['Sapphire Blue'],
      metals: ['Pewter', 'Yellow Gold', 'Antique Gold', 'Old Silver', 'Platinum'],
    },
    colorCombinations: [
      'Coral and Black Olive',
      'Midnight Blue and Cream',
      'Emerald and Gold',
      'Sapphire and Terra Cotta',
      'Plum and Antique Gold',
      'Vermillion and Grey',
    ],
    paletteEffects: ['Silk Road', 'Persian Palace', 'Byzantine', 'Moroccan', 'Indian Empress'],
    fabrics: ['Silk Shantung', 'Two-tone silk', 'Basket weave silk', 'Sari', 'Fine tweed', 'Wool jersey', 'Cady', 'Boucle', 'Lambswool', 'Fur', 'Linen', 'Linen-silk', 'Linen-cotton', 'Lace', 'Fine lace', 'Chiffon', 'Net lace', 'Crushed velvet', 'Cut velvet', 'Silk velvet', 'Denim', 'Twill', 'Chambray', 'Jacquard', 'Brocade', 'Damask', 'Toile', 'Leather', 'Snakeskin print'],
    prints: ['Chevron', 'Prince of Wales', 'Tweed', 'Trompe l\'oeil houses-trees-boats', 'Pomegranates', 'Grapes-grape leaves', 'Orange-lemon trees', 'Olive-fig trees', 'Cedar', 'Cypress', 'Myrtle', 'Willows', 'Branches', 'Leaves', 'Leopard', 'Tropical birds', 'Deer', 'Tropical florals', 'Roses', 'Lilies', 'Calla lilies', 'Paisley', 'Tassels', 'Ropes', 'Braids', 'Feathers', 'Wings', 'Ribbons', 'Polka dots', 'Waves', 'Lines', 'Diamonds', 'Tile prints', 'Tile mosaic', 'Chinese script-scroll', 'Japanese blue ink paintings', 'Fine stripes', 'Missoni', 'Chinese porcelain', 'Enamel'],
    style: {
      overview: 'Classic streamlined, oval/diagonal/column lines',
      looks: ['Kimono', 'Sari', 'Safari', 'Asymmetrical', 'Wrap', 'Column', 'Cape', 'Kaftan', 'Pleated Grecian'],
      dresses: ['Pencil skirts', 'Lace-silk-satin-tweed', 'Layered', 'Crushed pleated', 'Kimono top', 'Mandarin blouse', 'Side buttoned', 'Wrap'],
      sleeves: ['Sharp puff shoulder', 'Flowy sleeve tight wrists', 'Batwing', 'Kimono sleeve'],
      collars: ['Cowl neck', 'Cape neck', 'Boat neck', 'Slit neck', 'Deep V', 'Asymmetrical', 'Oval'],
      shoes: ['Grecian sandal', 'Wrap sandal', 'Espadrilles', 'Velvet shoes', 'Oval slip-ons', 'Patent leather', 'Leather tassel ties', 'Embossed leather'],
      coats: ['Cape coat', 'Fur collar', 'Military', 'Riding jacket', 'Leather bomber', 'Printed silk scarves'],
      accessories: ['Versace scarves', 'Pashmina-cashmere shawls', 'Mosaic bags-belts', 'Woven-tassel belts'],
    },
    jewelry: {
      metals: { perfect: ['Gold', 'Platinum', 'Silver', 'Antique Gold'] },
      stones: { perfect: ['Diamonds', 'Emeralds', 'Sapphires', 'Coral', 'White Coral', 'Jade', 'Ivory', 'Blue Topaz', 'Tourmaline', 'Aquamarine', 'Opal', 'Topaz'] },
      styles: ['Braided gold', 'Ropes', 'Tassels', 'Feather-bird motifs enamel-mosaic', 'Pearls', 'Mother of pearl', 'Pearls with gold clasps', 'Enamel flowers-leaves-branches', 'Rectangular-tear-oval stones', 'Gold filigree', 'Layered gold bangles', 'Cuffs serpentine', 'S-shape earrings-necklaces', 'Coiled gold'],
    },
    makeup: {
      everyday: 'Soft skin tones-pastels-neutrals (sage-olive liner + terracotta lip)',
      evening: 'Red-coral with emerald-sapphire eye',
    },
    eras: ['Ancient Chinese-Japanese', 'Italian-Spanish classical', '1920\'s-1940\'s evening', 'Persian-Indian', 'Flemish'],
    artists: ['Vermeer', 'Sargent', 'Da Vinci'],
  },
  {
    id: 'ornamental-winter',
    name: 'Ornamental Winter',
    season: 'winter',
    beautyStatement: 'Soft and rich earth tones, deep greens and blues with bright high notes in blue and purple',
    palette: {
      skinTones: ['Rose-Terra Cotta', 'Dusty Peach', 'Dark Rose', 'Ivory-Cream', 'Apricot'],
      romantic: ['Burgundy', 'Soft Red', 'Sangria'],
      formal: ['Midnight Blue', 'Dark Blue', 'Blue-Black'],
      hairColor: ['Chocolate Brown', 'Copper Brown', 'Deep Amber', 'Gold', 'Topaz'],
      eyeColor: ['Golden-Green', 'Seafoam', 'Silver-Green', 'Black Olive', 'Forest Green'],
      neutral: ['Maroon', 'Purple-Brown', 'Raisin', 'Deep Purple'],
      metallics: ['Antique Gold', 'Woven Gold', 'Platinum', 'Silver'],
      enlivened: ['Deep Teal', 'Blue Green', 'Sea Green', 'Sapphire'],
      highNote: ['Peacock Blue', 'Prussian Blue', 'Royal Blue', 'Bright Purple'],
      pastels: ['Sage', 'Apricot', 'Cream'],
    },
    colorCombinations: [
      'Midnight Blue and Gold',
      'Amber, Cream and Apricot',
      'Purple, Emerald and Royal Blue',
      'Emerald Green, Chocolate and Ivory',
      'Deep Purple, Plum and Gold',
      'Wine, Ivory and Amber',
      'Charcoal Grey, Silver and Cream',
      'Sky Blue with Amber in Prints',
      'Forest Green and Midnight Blue',
      'Sky Blue and Cobalt',
    ],
    paletteEffects: ['Winter Sunset', 'Tapestry Palette', 'Antique', 'Golden Diadem', 'Girl with a Pitcher', 'Ornamental Designs'],
    fabrics: ['Silk', 'Satin', 'Velvet', 'Brocade', 'Silk weaves', 'Chiffon', 'Fine Lace', 'Wool Jersey', 'Cotton-Linen', 'Linen', 'Cashmere', 'Shantung Silk', 'Two Toned fabric', 'Soft Leather', 'Suede', 'Polished Cotton'],
    prints: ['Paisley', 'Houndstooth', 'Fine Check', 'Plaid', 'Black and White prints', 'Abstract oil painting or watercolor prints', 'Prints of houses, bridges, trees, branches, water', 'Coiled designs', 'Swirled seashell designs', 'Pitcher, waves and water prints', 'Toile with birds and water, leaves and trees', 'Animal Prints with Deer, Gazelle, Antelope and Birds', 'Narrow Stripe', 'Diamond prints', 'Small circles, rectangles or oval prints', 'Delicate lines or branch prints', 'Trompe L\'oeil prints', 'Watercolor Floral Prints', 'Chain and Locket prints', 'Rope Prints', 'Polka Dots', 'Date Palms', 'Fig Trees', 'Almond Trees', 'Roses', 'Lilies', 'Orchids', 'Alliums', 'Scabiosa', 'Purple Tulips', 'White Tulips', 'Lavender', 'Queen Anne\'s Lace'],
    style: {
      dresses: ['Grecian Pleats and drape', 'Wrap dresses', 'A line Dresses', 'Column Dress', 'Safari Dress', 'Sari', 'Kaftan', 'Shawl Collar', 'Kimono Dress'],
      skirts: ['Pencil Skirt', 'Pleated Skirt', 'A line Skirt', 'Draped Skirt', 'Side tied skirt', 'Wrap skirt', 'Asymmetrical hem'],
      sleeves: ['Puffed Sleeve', 'Butterfly Sleeve', 'Trumpet Sleeve', 'Pleated Sleeve', 'Sleeves trimmed with lace, brocade or embroidery'],
      collars: ['Mandarin', 'Deep V', 'Shawl Collar', 'Pointed Collar'],
      shoes: ['Espadrilles', 'Suede shoes', 'Soft rectangular or oval', 'pointed oval toe', 'Grecian Sandal', 'Pointed Toes boots', 'Embossed leathers', 'alligator', 'snakeskin prints', 'Patent Leather'],
      recommendations: ['Wear delicate prints in small to medium', 'Wear sharply etched designs or painting effects', 'Wear high notes alone in satin or velvet', 'Mix satin with denim, lace with leather', 'Short jacket with longer skirt/dress', 'Long jacket with short skirt', 'Bring colors together in prints like paisley, florals or toile'],
    },
    jewelry: {
      stones: { perfect: ['Diamonds', 'Amber', 'Topaz', 'Emeralds', 'Sapphires', 'Jade', 'Turquoise', 'Aventurine'] },
      metals: { perfect: ['Gold', 'Silver', 'Platinum', 'Antique Gold'] },
      styles: ['Links', 'Chains', 'Narrow bands', 'Multiple strands', 'Filigree', 'Chinese Lacquer', 'Enamel', 'Beaded Indian designs', 'Delicate Branch earrings', 'Leaves', 'Branches', 'Winter Florals'],
    },
    makeup: {
      eyes: { perfect: ['Blues', 'Greens', 'Purples'] },
      lips: { perfect: ['Mauves', 'Reds'] },
      cheeks: { perfect: ['Mauves', 'Rose'] },
      looks: ['Dramatic Kohl on eyes with soft lip', 'Red lip with soft green/gold liner'],
    },
    eras: ['1800\'s Italian', '1800\'s Moroccan', 'Ancient Chinese', 'Ancient Grecian Design'],
    artists: ['Modigliani', 'Da Vinci', 'Corot'],
  },
  {
    id: 'silk-road-winter',
    name: 'Silk Road Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Midnight Blue', 'Midnight Green'],
      neutral: ['Charcoal', 'Pewter', 'Olive', 'Black Olive', 'Deep Purple', 'Raisin'],
      hairColor: ['Black-Brown', 'Chocolate', 'Dark Amber'],
      skinTones: ['Rose Terra Cotta', 'Terra Cotta', 'Apricot', 'Cream', 'Ivory'],
      romantic: ['Wine', 'Burgundy', 'Deep Red', 'Coral Red'],
      eyeColor: ['Emerald', 'Blue-Green', 'Teal', 'Golden Green'],
      enlivened: ['Emerald', 'Teal', 'Peacock Blue'],
      highShade: ['Cobalt', 'Sapphire', 'Bright Teal'],
      pastels: ['Sage', 'Cream', 'Soft Gold', 'Apricot'],
      metals: ['Antique Gold', 'Gold', 'Copper', 'Bronze'],
    },
    colorCombinations: [
      'Midnight and Gold',
      'Emerald and Burgundy',
      'Sapphire and Cream',
      'Wine and Sage',
      'Cobalt and Copper',
      'Peacock Blue and Antique Gold',
    ],
    paletteEffects: ['Silk Road Traveler', 'Persian Palace', 'Chinese Dynasty', 'Moroccan Night', 'Byzantine Empress'],
    fabrics: ['Silk Shantung', 'Brocade', 'Damask', 'Velvet', 'Satin', 'Metallic weave', 'Sari silk', 'Embroidered silk', 'Jacquard', 'Tapestry', 'Fine wool', 'Cashmere', 'Pashmina'],
    prints: ['Paisley', 'Persian designs', 'Chinese motifs', 'Silk Road patterns', 'Ethnic prints', 'Tile patterns', 'Mosaic', 'Pagodas', 'Dragons', 'Phoenixes', 'Peacocks', 'Geometric borders'],
    style: {
      looks: ['Kaftan', 'Sari inspired', 'Kimono', 'Column dress', 'Wrap dress', 'Draped silhouettes'],
      details: ['Embroidered edges', 'Metallic trim', 'Tassel details', 'Braided closures'],
    },
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Gold', 'Copper', 'Bronze'] },
      stones: { perfect: ['Jade', 'Lapis Lazuli', 'Turquoise', 'Coral', 'Amber', 'Emeralds', 'Rubies'] },
      styles: ['Layered chains', 'Coin necklaces', 'Chandelier earrings', 'Cuffs', 'Statement rings', 'Ethnic inspired designs'],
    },
    makeup: {
      dramatic: 'Kohl eyes with wine lip',
      soft: 'Gold and bronze tones',
    },
  },
  {
    id: 'tapestry-winter',
    name: 'Tapestry Winter',
    season: 'winter',
    palette: {
      formal: ['Black', 'Blue-Black', 'Midnight Blue', 'Midnight Green'],
      neutral: ['Charcoal Grey', 'Brown-Grey', 'Grey Purple'],
      hairColor: ['Chocolate Brown', 'Dark Amber', 'Burnt Sienna', 'Golden Brown'],
      skinTones: ['Brown-Mauve', 'Pink-Mauve', 'Brown Champagne', 'Dark Apricot', 'Light Apricot', 'Ivory'],
      romantic: ['Maroon', 'Burgundy', 'Mauve-Red', 'Purple', 'Grape'],
      eyeColor: ['Golden Green', 'Topaz', 'Olive', 'Black Olive', 'Grey-Green'],
      enlivened: ['Green', 'Prussian Blue', 'Teal'],
      highShade: ['Emerald Green', 'Peacock Blue', 'Cobalt Blue'],
      pastels: ['Soft Purple', 'Sage Green', 'Ivory', 'Light Apricot'],
      metals: ['Antique Gold', 'Silver', 'Platinum', 'Bronze', 'Green Copper (oxidized)'],
    },
    colorCombinations: [
      'Olive, Deep Purple, Midnight Blue',
      'Black and Ivory',
      'Midnight Blue, Mauve and Ivory',
      'Champagne and Olive',
      'Pewter and Grey',
      'Chocolate, Amber and Ivory',
      'Maroon, Apricot and Mauve',
      'Sage Green, Apricot and Emerald Green',
      'Emerald and Prussian Blue',
    ],
    paletteEffects: ['Italian Renaissance', 'Spanish Renaissance', 'Antique Chinese design', 'Mediterranean Princess', 'Biblical Designs', 'Mediterranean Seaside and Desert', 'Moroccan design'],
    fabrics: ['Silk shantung', 'Silk wool blend', 'Velvet', 'Cut velvet', 'Lace', 'Jersey', 'Cashmere', 'Fine knits', 'Ribbed knits', 'Leather', 'Suede', 'Satin', 'Denim', 'Corduroy', 'Linen', 'Chiffon', 'Brocade', 'Tapestry', 'Black lace with Color underneath or vice versa'],
    prints: ['Missoni Prints', 'Cheetah', 'Leopard', 'Alligator', 'Ostrich', 'Snakeskin', 'Stripes', 'Small Checks', 'Fine Plaid', 'Fine Tweed', 'Houndstooth', 'Paisley', 'Polka Dots', 'Geometric prints', 'Leaves', 'Branches', 'Chinese Pagodas', 'Jasmine', 'Lilies', 'Roses', 'Anemones', 'Orchids', 'Coils', 'Gold Coins', 'Braided Gold', 'Sari Prints', 'Chinese Watercolor prints', 'Blue or Black ink painting on Chiffon', 'Delicate feathers', 'Ropes and Chain prints'],
    style: {
      silhouettes: ['Hourglass shape', 'Romantic and Tailored'],
      dresses: ['Trapeze dresses', 'Fine pleats', 'Accordion pleats', 'Slightly puffed sleeve or bell sleeve', 'Accordion sleeve from elbow', 'A line Wrap dresses in small geometric prints'],
      details: ['Smooth lines with small prints', 'Pointed, soft rectangle or oval toed shoes', 'Gold Buckle', 'Deep V neckline', 'deep oval neckline', 'boatneck'],
    },
    jewelry: {
      metals: { perfect: ['Antique Gold', 'Silver', 'Platinum', 'Bronze'] },
      stones: { perfect: ['Emeralds', 'Diamonds', 'Sapphires', 'Topaz', 'Labradorite', 'Agate', 'Jade', 'Ivory'] },
      styles: ['Gold Coins', 'Ropes', 'Chains', 'Links'],
    },
    makeup: {
      lips: { perfect: ['Skin tones', 'Romantic Colors'] },
      cheeks: { perfect: ['Skin tones', 'Romantic Colors'] },
      dramatic: 'Blues, greens and purples for eyes',
    },
    designers: ['Missoni', 'Brunello Cuccinelli', 'Chloe'],
    artists: ['Modigliani', 'Da Vinci'],
  },
  {
    id: 'winter-rose',
    name: 'Winter Rose',
    season: 'winter',
    palette: {
      formal: ['Black', 'Navy Blue', 'Midnight Blue', 'Charcoal'],
      neutral: ['Silver Grey', 'Pewter', 'Dove Grey', 'Slate'],
      hairColor: ['Black-Brown', 'Chocolate', 'Dark Brown'],
      skinTones: ['Rose', 'Pink Rose', 'Cream', 'Porcelain', 'Ivory'],
      romantic: ['Wine', 'Burgundy', 'Deep Rose', 'Claret', 'Raspberry'],
      eyeColor: ['Blue', 'Grey Blue', 'Violet', 'Sapphire'],
      enlivened: ['Emerald', 'Teal', 'Deep Teal'],
      highShade: ['Sapphire', 'Cobalt', 'Royal Blue', 'Bright Emerald'],
      pastels: ['Lavender', 'Soft Pink', 'Silver', 'Ice Blue', 'Mint'],
      metals: ['Silver', 'White Gold', 'Platinum', 'Rose Gold'],
    },
    colorCombinations: [
      'Navy and Rose',
      'Wine and Silver',
      'Sapphire and Cream',
      'Black and Lavender',
      'Emerald and Ice Pink',
      'Charcoal and Mint',
      'Burgundy and Pewter',
    ],
    paletteEffects: ['Winter Rose Garden', 'Snow Queen', 'Ice Princess', 'Victorian Winter', 'Romantic Winter'],
    fabrics: ['Velvet', 'Satin', 'Fine Lace', 'Chiffon', 'Silk', 'Cashmere', 'Fine Wool', 'Brocade', 'Organza', 'Tulle', 'Fur'],
    prints: ['Roses', 'Victorian florals', 'Lace patterns', 'Fine stripes', 'Delicate geometrics', 'Snowflakes', 'Ribbons', 'Pearls', 'Cameos'],
    style: {
      looks: ['Princess style', 'Victorian romantic', 'Ice princess', 'Elegant evening'],
      details: ['Lace trim', 'Fur accents', 'Crystal embellishments', 'Velvet ribbons'],
    },
    jewelry: {
      metals: { perfect: ['Silver', 'White Gold', 'Platinum', 'Rose Gold'] },
      stones: { perfect: ['Diamonds', 'Sapphires', 'Pearls', 'Amethyst', 'Blue Topaz', 'Rose Quartz'] },
      styles: ['Filigree', 'Victorian designs', 'Delicate chains', 'Pearl strands', 'Lockets', 'Cameos', 'Snowflake motifs'],
    },
    makeup: {
      dramatic: 'Deep wine lip with sapphire or emerald eye',
      soft: 'Rose and cream with soft grey eye',
    },
  },
];

// =============================================================================
// COMBINED DATA
// =============================================================================

export const ALL_SUBTYPES: Subtype[] = [
  ...SPRING_SUBTYPES,
  ...SUMMER_SUBTYPES,
  ...AUTUMN_SUBTYPES,
  ...WINTER_SUBTYPES,
];

export const getSubtypesBySeason = (season: Season): Subtype[] => {
  return ALL_SUBTYPES.filter(s => s.season === season);
};

export const getSubtypeById = (id: string): Subtype | undefined => {
  return ALL_SUBTYPES.find(s => s.id === id);
};

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

// For backward compatibility
export const SAMPLE_SUBTYPES = ALL_SUBTYPES;
