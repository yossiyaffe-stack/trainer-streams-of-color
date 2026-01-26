/**
 * Nechama's Vocabulary - Shared terminology for the Streams of Color system
 * Used by both Photo Training and Painting Library
 */

export const VOCABULARY = {
  fabrics: [
    'Velvet', 'Silk', 'Satin', 'Brocade', 'Damask', 'Silk Shantung', 'Moiré',
    'Lace', 'Chiffon', 'Organza', 'Tulle', 'Taffeta', 'Jacquard', 'Tapestry',
    'Embroidered', 'Beaded', 'Sequined', 'Cashmere', 'Wool', 'Tweed'
  ],
  silhouettes: [
    'Empire Waist', 'A-Line', 'Fitted/Sheath', 'Ball Gown', 'Column',
    'Princess Line', 'Dropped Waist', 'Wrap', 'Draped', 'Flowing',
    'Structured', 'Layered', 'Tiered', 'Mermaid', 'Trumpet'
  ],
  necklines: [
    'Portrait', 'Off-Shoulder', 'Square', 'Sweetheart', 'V-Neck', 'Scoop',
    'Boat/Bateau', 'High Neck', 'Jewel', 'Cowl', 'One-Shoulder', 'Halter'
  ],
  sleeves: [
    'Sleeveless', 'Cap', 'Short', 'Three-Quarter', 'Long', 'Bell',
    'Bishop', 'Juliet', 'Puff', 'Leg of Mutton', 'Poet', 'Fitted'
  ],
  colorMoods: [
    'Formal/Dark', 'Romantic/Rich', 'Neutral/Earth', 'Enlivened/Bright',
    'Pastel/Soft', 'Jewel Tones', 'Metallics', 'Monochromatic', 'Muted/Dusty'
  ],
  paletteEffects: [
    'Renaissance Queen', 'Mediterranean Palace', 'Venetian Splendor', 'French Court',
    'English Garden', 'Oriental Mystery', 'Art Nouveau', 'Bohemian Romance',
    'Baroque Opulence', 'Pre-Raphaelite', 'Impressionist Light', 'Edwardian Grace',
    'Victorian Richness', 'Gilded Age', 'Byzantine Mosaic', 'Dutch Golden Age'
  ],
  eras: [
    'Renaissance', 'Baroque', 'Rococo', 'Neoclassical', 'Regency',
    'Romantic Era', 'Victorian', 'Belle Époque', 'Edwardian',
    'Art Nouveau', 'Art Deco', 'Mid-Century', 'Contemporary'
  ],
  moods: [
    'Elegant', 'Romantic', 'Dramatic', 'Soft', 'Bold', 'Mysterious',
    'Regal', 'Delicate', 'Opulent', 'Serene', 'Powerful', 'Ethereal'
  ],
  undertones: ['Warm', 'Cool', 'Neutral'],
  depths: ['Light', 'Medium', 'Deep'],
  contrasts: ['Low', 'Medium', 'Medium-High', 'High']
} as const;

export type VocabularyKey = keyof typeof VOCABULARY;
