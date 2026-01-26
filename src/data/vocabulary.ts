/**
 * Nechama's Vocabulary - Shared terminology for the Streams of Color system
 * Used by both Photo Training and Painting Library
 * Expanded with complete data from methodology files
 */

export const VOCABULARY = {
  fabrics: [
    // Natural Fibers
    'Silk', 'Cotton', 'Fine Cotton', 'Linen', 'Wool', 'Cashmere', 'Mohair', 'Alpaca', 'Angora',
    // Textured
    'Velvet', 'Crushed Velvet', 'Cut Velvet', 'Suede', 'Leather', 'Soft Leather', 'Embossed Leather',
    'Corduroy', 'Fine Corduroy', 'Tweed', 'Fine Tweed', 'Bouclé', 'Chenille',
    // Sheer & Delicate
    'Chiffon', 'Georgette', 'Organza', 'Tulle', 'Lace', 'Fine Lace', 'Crocheted Lace', 'Eyelet',
    // Satins & Sheens
    'Satin', 'Charmeuse', 'Taffeta', 'Silk Shantung', 'Moiré',
    // Knits
    'Jersey', 'Wool Jersey', 'Fine Knit', 'Irish Knit', 'Fisherman Knit',
    // Denim & Casual
    'Denim', 'Chambray', 'Canvas', 'Cotton-Linen', 'Gauze Cotton',
    // Decorative
    'Brocade', 'Damask', 'Jacquard', 'Tapestry', 'Embroidered', 'Needlepoint', 'Sequined', 'Beaded',
    // Other
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
  colorMoods: [
    'Formal/Dark', 'Romantic/Rich', 'Neutral/Earth', 'Enlivened/Bright',
    'Pastel/Soft', 'Jewel Tones', 'Metallics', 'Monochromatic', 'Muted/Dusty',
    'Iridescent', 'High Contrast', 'Low Contrast', 'Warm', 'Cool'
  ],
  paletteEffects: [
    // Spring Effects
    'Girl with a Pearl Earring', 'Fawn in a Field of Wildflowers', 'Bouquet of Flowers in a Vase',
    'Milk Maiden', 'Gardenia Summer', 'Southern Belle', 'Gibson Girl', 'Cherry Blossoms',
    // Summer Effects
    'Princess', 'Rose Garden', 'Ballerina', 'Peasant Girl', 'English Roses', 'Romantic French Design',
    'Fleur de Lis', 'Trompe L\'oeil', 'Summer Princess', 'Guinevere', 'Summer Woods',
    'Renaissance Princess', 'Grecian Effects', 'Japanese Garden', 'Chinoiserie Effect',
    'Cloisonné Effect', 'Porcelain Effect', 'Venice Watercolors', 'Watercolor Painting',
    'Summer Lake at Dawn', 'Opal and Moonstone Palette', 'Peacock-Pheasant Palette',
    'Tea Rose Palette', 'Summer Sunset', 'Edwardian Style', 'French Girl Fashion',
    // Autumn Effects
    'Renaissance Style', 'Romantic and Woodsy', 'Knight\'s Costume', 'Autumn Foliage',
    'Grecian Princess', 'Mediterranean Palette', 'Spanish Desert', 'Fruit Harvest',
    'Mid Autumn', 'Woods and Pine Trees', 'Persian Carpet', 'Mediterranean Vineyard',
    'Rembrandt Palette', 'Coat of Many Colors', 'Queen Esther Palette',
    'Sunlight in Early Autumn', 'Boats and Sunset', 'Harvest', 'Spanish Sunset',
    // Winter Effects
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
    // Historical Periods
    'Medieval', 'Renaissance', 'Baroque', 'Rococo', 'Neoclassical', 'Regency',
    'Romantic Era', 'Victorian', 'Belle Époque', 'Edwardian', 'Gibson Girl Era',
    'Art Nouveau', 'Art Deco', '1920s Flapper', '1930s Europe', '1940s Fashion',
    '1950s', '1960s', '1970s', 'Mid-Century', 'Contemporary',
    // Regional Styles
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
  undertones: ['Warm', 'Cool', 'Neutral', 'Warm-Neutral', 'Cool-Neutral'],
  depths: ['Light', 'Medium', 'Medium-Deep', 'Deep', 'Very Deep'],
  contrasts: ['Low', 'Medium', 'Medium-High', 'High', 'Very High'],
  jewelryMetals: [
    'Yellow Gold', 'Rose Gold', 'White Gold', 'Antique Gold', 'Woven Gold',
    'Silver', 'Antique Silver', 'Burnished Silver', 'Platinum', 'Pewter',
    'Copper', 'Bronze', 'Mixed Metals'
  ],
  jewelryStones: [
    // Precious
    'Diamond', 'Ruby', 'Sapphire', 'Emerald',
    // Semi-precious
    'Amethyst', 'Blue Topaz', 'Topaz', 'Aquamarine', 'Garnet', 'Peridot',
    'Turquoise', 'Jade', 'Opal', 'Green Opal', 'Labradorite', 'Moonstone',
    'Tourmaline', 'Carnelian', 'Onyx', 'Tiger Eye', 'Agate', 'Jasper', 'Aventurine',
    // Organic
    'Pearl', 'Pink Pearl', 'White Coral', 'Pink Coral', 'Amber', 'Ivory', 'Mother of Pearl',
    // Other
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
    // Impressionists
    'Monet', 'Manet', 'Renoir', 'Degas', 'Cassatt',
    // Pre-Raphaelites
    'Rossetti', 'Dante Gabriel Rossetti', 'John Singer Sargent',
    // Dutch Masters
    'Vermeer', 'Rembrandt',
    // Renaissance
    'Leonardo Da Vinci', 'Botticelli',
    // Other Masters
    'Van Gogh', 'Klimt', 'Matisse', 'Picasso', 'Modigliani', 'Caravaggio',
    'El Greco', 'Corot', 'Gauguin', 'Ingres', 'Odilon Redon'
  ],
  designers: [
    'Chanel', 'Dior', 'Valentino', 'Oscar de la Renta',
    'BlueMarine', 'Bluemarine', 'Chloe', 'Chloé', 'Alberta Ferretti',
    'Etro', 'Dries Van Noten', 'Brunello Cucinelli', 'Brunello Cuccinelli',
    'Ralph Lauren', 'Ulla Johnson', 'Stella McCartney',
    'Cavalli', 'Roberto Cavalli', 'Missoni', 'Costume National',
    'Miu Miu', 'Marni', 'Louis Vuitton'
  ],
  prints: [
    // Florals
    'Roses', 'Peonies', 'Tulips', 'Lilies', 'Calla Lilies', 'Water Lilies',
    'Hydrangeas', 'Jasmine', 'Hibiscus', 'Cherry Blossoms', 'Magnolias',
    'Gardenias', 'Dogwood', 'Wisteria', 'Camellias', 'Lotus',
    // Nature
    'Butterflies', 'Birds', 'Peacock Feathers', 'Feathers', 'Leaves', 'Branches',
    'Deer', 'Seashells', 'Dragonflies', 'Tropical Flowers',
    // Geometric
    'Stripes', 'Fine Stripes', 'Polka Dots', 'Diamonds', 'Chevron',
    'Windowpane', 'Plaid', 'Houndstooth', 'Paisley',
    // Cultural
    'Toile', 'Fleur de Lis', 'Chinoiserie', 'Kimono Prints', 'Mosaic',
    'Tile Prints', 'Persian Designs', 'Moroccan Tile', 'Indian Motifs',
    // Other
    'Trompe L\'oeil', 'Leopard', 'Animal Print', 'Hearts', 'Ribbons'
  ]
} as const;

export type VocabularyKey = keyof typeof VOCABULARY;

// Helper to get all vocabulary items as a flat array
export function getAllVocabularyItems(): string[] {
  return Object.values(VOCABULARY).flat();
}

// Helper to search vocabulary
export function searchVocabulary(query: string): { category: VocabularyKey; items: string[] }[] {
  const normalizedQuery = query.toLowerCase();
  const results: { category: VocabularyKey; items: string[] }[] = [];
  
  for (const [category, items] of Object.entries(VOCABULARY)) {
    const matchedItems = items.filter(item => 
      item.toLowerCase().includes(normalizedQuery)
    );
    if (matchedItems.length > 0) {
      results.push({ category: category as VocabularyKey, items: matchedItems });
    }
  }
  
  return results;
}
