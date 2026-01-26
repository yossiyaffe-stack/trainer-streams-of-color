/**
 * STREAMS OF COLOR - MASTER COLOR DATABASE
 * =========================================
 * Complete color library with hex codes for:
 * - Visual swatches in reports
 * - "Is This My Color?" matching tool
 * - Shopping product matching
 * - UI theming
 * 
 * 200+ colors organized by category
 */

export interface Color {
  name: string;
  hex: string;
  hsl: { h: number; s: number; l: number };
}

export type ColorCategory = 'skinTones' | 'romantic' | 'formal' | 'browns' | 'greens' | 'blues' | 'purples' | 'metallics' | 'neutrals';

// =============================================================================
// SKIN TONES / CREAMS / IVORIES
// =============================================================================

export const SKIN_TONES: Record<string, Color> = {
  // Pure Whites & Ivories
  ivory: { name: "Ivory", hex: "#FFFFF0", hsl: { h: 60, s: 100, l: 97 } },
  winterWhite: { name: "Winter White", hex: "#F8F8F8", hsl: { h: 0, s: 0, l: 97 } },
  cream: { name: "Cream", hex: "#FFFDD0", hsl: { h: 54, s: 100, l: 91 } },
  ecru: { name: "Ecru", hex: "#C2B280", hsl: { h: 47, s: 35, l: 63 } },
  ecruCream: { name: "Ecru Cream", hex: "#F5F0DC", hsl: { h: 48, s: 56, l: 91 } },
  linen: { name: "Linen", hex: "#FAF0E6", hsl: { h: 30, s: 67, l: 94 } },
  
  // Yellow-Based Creams
  yellowCream: { name: "Yellow Cream", hex: "#FFF8DC", hsl: { h: 48, s: 100, l: 93 } },
  butter: { name: "Butter", hex: "#FFFF99", hsl: { h: 60, s: 100, l: 80 } },
  buttercream: { name: "Buttercream", hex: "#FFF5BA", hsl: { h: 50, s: 100, l: 86 } },
  lemonYellow: { name: "Lemon Yellow", hex: "#FFF44F", hsl: { h: 56, s: 100, l: 65 } },
  lemonCream: { name: "Lemon Cream", hex: "#FFFACD", hsl: { h: 54, s: 100, l: 90 } },
  vanilla: { name: "Vanilla", hex: "#F3E5AB", hsl: { h: 47, s: 67, l: 81 } },
  champagne: { name: "Champagne", hex: "#F7E7CE", hsl: { h: 36, s: 66, l: 89 } },
  
  // Pink-Based Creams
  pinkCream: { name: "Pink Cream", hex: "#FFF0F5", hsl: { h: 340, s: 100, l: 97 } },
  shellPink: { name: "Shell Pink", hex: "#FFE4E1", hsl: { h: 6, s: 100, l: 94 } },
  softRosePink: { name: "Soft Rose-Pink", hex: "#FFCCCB", hsl: { h: 1, s: 100, l: 90 } },
  icePink: { name: "Ice-Pink", hex: "#F5E6EA", hsl: { h: 340, s: 35, l: 93 } },
  silverPink: { name: "Silver-Pink", hex: "#E8D0D0", hsl: { h: 0, s: 27, l: 86 } },
  
  // Rose Tones
  rose: { name: "Rose", hex: "#E8ADAA", hsl: { h: 3, s: 50, l: 79 } },
  dustyRose: { name: "Dusty Rose", hex: "#DCAE96", hsl: { h: 23, s: 44, l: 73 } },
  blush: { name: "Blush", hex: "#DE5D83", hsl: { h: 342, s: 65, l: 62 } },
  softBlush: { name: "Soft Blush", hex: "#F4C2C2", hsl: { h: 0, s: 60, l: 86 } },
  antiqueRose: { name: "Antique Rose", hex: "#C08081", hsl: { h: 0, s: 34, l: 63 } },
  oldRose: { name: "Old Rose", hex: "#C08081", hsl: { h: 0, s: 34, l: 63 } },
  roseMauve: { name: "Rose-Mauve", hex: "#C9A9A6", hsl: { h: 5, s: 22, l: 72 } },
  mauvePink: { name: "Mauve-Pink", hex: "#D8A9C4", hsl: { h: 320, s: 33, l: 75 } },
  mauveRose: { name: "Mauve Rose", hex: "#C9A0B0", hsl: { h: 340, s: 27, l: 71 } },
  velvetRose: { name: "Velvet Rose", hex: "#9E4244", hsl: { h: 358, s: 41, l: 44 } },
  
  // Peach & Apricot
  peach: { name: "Peach", hex: "#FFCBA4", hsl: { h: 27, s: 100, l: 82 } },
  peachRose: { name: "Peach-Rose", hex: "#F5C0A8", hsl: { h: 19, s: 75, l: 81 } },
  apricot: { name: "Apricot", hex: "#FBCEB1", hsl: { h: 28, s: 91, l: 84 } },
  dustyApricot: { name: "Dusty Apricot", hex: "#E8C4A8", hsl: { h: 28, s: 49, l: 78 } },
  paleApricot: { name: "Pale Apricot", hex: "#FDDCB1", hsl: { h: 35, s: 91, l: 84 } },
  apricotCream: { name: "Apricot Cream", hex: "#F8DFC4", hsl: { h: 30, s: 70, l: 87 } },
  apricotRose: { name: "Apricot Rose", hex: "#E5B39B", hsl: { h: 22, s: 52, l: 75 } },
  coral: { name: "Coral", hex: "#FF7F50", hsl: { h: 16, s: 100, l: 66 } },
  pinkCoral: { name: "Pink Coral", hex: "#E8A798", hsl: { h: 12, s: 55, l: 75 } },
  
  // Terra Cotta Family
  terraCotta: { name: "Terra Cotta", hex: "#E2725B", hsl: { h: 12, s: 69, l: 62 } },
  roseTerraCotta: { name: "Rose Terra Cotta", hex: "#C4A484", hsl: { h: 30, s: 33, l: 64 } },
  pinkTerraCotta: { name: "Pink Terra Cotta", hex: "#D4A49A", hsl: { h: 12, s: 37, l: 72 } },
  darkTerraCotta: { name: "Dark Terra Cotta", hex: "#B85C38", hsl: { h: 18, s: 52, l: 47 } },
  softTerraCotta: { name: "Soft Terra Cotta", hex: "#D9A99A", hsl: { h: 14, s: 40, l: 73 } },
  
  // Beige & Taupe
  roseBeige: { name: "Rose Beige", hex: "#D4B5A0", hsl: { h: 25, s: 35, l: 73 } },
  cameo: { name: "Cameo", hex: "#EFBBCC", hsl: { h: 340, s: 60, l: 83 } },
  roseGold: { name: "Rose Gold", hex: "#B76E79", hsl: { h: 351, s: 34, l: 57 } },
};

// =============================================================================
// ROMANTIC / REDS / WINES
// =============================================================================

export const ROMANTIC: Record<string, Color> = {
  // True Reds
  red: { name: "Red", hex: "#FF0000", hsl: { h: 0, s: 100, l: 50 } },
  softRed: { name: "Soft Red", hex: "#D64545", hsl: { h: 0, s: 62, l: 56 } },
  deepRed: { name: "Deep Red", hex: "#850101", hsl: { h: 0, s: 99, l: 26 } },
  dustyRed: { name: "Dusty Red", hex: "#B55D5D", hsl: { h: 0, s: 37, l: 54 } },
  brickRed: { name: "Brick Red", hex: "#CB4154", hsl: { h: 352, s: 54, l: 53 } },
  rustRed: { name: "Rust Red", hex: "#8B4513", hsl: { h: 25, s: 76, l: 31 } },
  roseRed: { name: "Rose Red", hex: "#C21E56", hsl: { h: 337, s: 74, l: 44 } },
  
  // Coral Reds
  coralRed: { name: "Coral Red", hex: "#FF4040", hsl: { h: 0, s: 100, l: 63 } },
  coralRose: { name: "Coral Rose", hex: "#E57373", hsl: { h: 0, s: 68, l: 67 } },
  coralPink: { name: "Coral Pink", hex: "#F88379", hsl: { h: 5, s: 90, l: 72 } },
  
  // Wines & Burgundy
  wine: { name: "Wine", hex: "#722F37", hsl: { h: 353, s: 42, l: 32 } },
  softWine: { name: "Soft Wine", hex: "#8E4A52", hsl: { h: 352, s: 32, l: 43 } },
  burgundy: { name: "Burgundy", hex: "#800020", hsl: { h: 345, s: 100, l: 25 } },
  claret: { name: "Claret", hex: "#7F1734", hsl: { h: 345, s: 69, l: 30 } },
  maroon: { name: "Maroon", hex: "#800000", hsl: { h: 0, s: 100, l: 25 } },
  sangria: { name: "Sangria", hex: "#92000A", hsl: { h: 356, s: 100, l: 29 } },
  
  // Mauve Reds
  mauveRed: { name: "Mauve-Red", hex: "#993366", hsl: { h: 330, s: 50, l: 40 } },
  purpleRed: { name: "Purple Red", hex: "#953553", hsl: { h: 340, s: 48, l: 40 } },
  darkMauve: { name: "Dark Mauve", hex: "#915F6D", hsl: { h: 345, s: 23, l: 47 } },
  
  // Plums
  plum: { name: "Plum", hex: "#8E4585", hsl: { h: 307, s: 34, l: 41 } },
  lightPlum: { name: "Light Plum", hex: "#A87CA0", hsl: { h: 310, s: 20, l: 58 } },
  darkPlum: { name: "Dark Plum", hex: "#5C3A6E", hsl: { h: 280, s: 31, l: 33 } },
  
  // Pinks
  raspberry: { name: "Raspberry", hex: "#E30B5C", hsl: { h: 337, s: 87, l: 47 } },
  blushRose: { name: "Blush Rose", hex: "#E8A0A0", hsl: { h: 0, s: 53, l: 77 } },
  
  // Rusty Tones
  rust: { name: "Rust", hex: "#B7410E", hsl: { h: 20, s: 85, l: 39 } },
  softRust: { name: "Soft Rust", hex: "#C67552", hsl: { h: 18, s: 51, l: 55 } },
  redBrown: { name: "Red Brown", hex: "#A52A2A", hsl: { h: 0, s: 59, l: 41 } },
  
  // Orange Tones
  orange: { name: "Orange", hex: "#FF8C00", hsl: { h: 33, s: 100, l: 50 } },
  brightCoralOrange: { name: "Bright Coral Orange", hex: "#FF6B4A", hsl: { h: 11, s: 100, l: 65 } },
};

// =============================================================================
// FORMAL / BLACKS / DARKS
// =============================================================================

export const FORMAL: Record<string, Color> = {
  // Blacks
  black: { name: "Black", hex: "#000000", hsl: { h: 0, s: 0, l: 0 } },
  blueBlack: { name: "Blue-Black", hex: "#0D0D1A", hsl: { h: 240, s: 33, l: 8 } },
  blackBrown: { name: "Black-Brown", hex: "#1C1008", hsl: { h: 24, s: 54, l: 7 } },
  
  // Navy & Midnight Blues
  navy: { name: "Navy", hex: "#000080", hsl: { h: 240, s: 100, l: 25 } },
  navyBlue: { name: "Navy Blue", hex: "#000080", hsl: { h: 240, s: 100, l: 25 } },
  midnightBlue: { name: "Midnight Blue", hex: "#191970", hsl: { h: 240, s: 64, l: 27 } },
  midnight: { name: "Midnight", hex: "#191970", hsl: { h: 240, s: 64, l: 27 } },
  prussianBlue: { name: "Prussian Blue", hex: "#003153", hsl: { h: 201, s: 100, l: 16 } },
  
  // Dark Greens
  midnightGreen: { name: "Midnight Green", hex: "#004953", hsl: { h: 187, s: 100, l: 16 } },
  hunterGreen: { name: "Hunter Green", hex: "#355E3B", hsl: { h: 133, s: 27, l: 29 } },
  forestGreen: { name: "Forest Green", hex: "#228B22", hsl: { h: 120, s: 61, l: 34 } },
  blackGreen: { name: "Black Green", hex: "#1A2E1A", hsl: { h: 120, s: 27, l: 14 } },
  
  // Grays
  charcoal: { name: "Charcoal", hex: "#36454F", hsl: { h: 204, s: 18, l: 26 } },
  charcoalGray: { name: "Charcoal Gray", hex: "#36454F", hsl: { h: 204, s: 18, l: 26 } },
  
  // Dark Purples in Formal
  raisin: { name: "Raisin", hex: "#59323C", hsl: { h: 342, s: 28, l: 27 } },
  deepPurple: { name: "Deep Purple", hex: "#3B2047", hsl: { h: 285, s: 38, l: 20 } },
};

// =============================================================================
// BROWNS / HAIR COLORS
// =============================================================================

export const BROWNS: Record<string, Color> = {
  // Dark Browns
  chocolate: { name: "Chocolate", hex: "#7B3F00", hsl: { h: 31, s: 100, l: 24 } },
  chocolateBrown: { name: "Chocolate Brown", hex: "#4E3524", hsl: { h: 24, s: 36, l: 22 } },
  darkBrown: { name: "Dark Brown", hex: "#5C4033", hsl: { h: 20, s: 30, l: 28 } },
  coffee: { name: "Coffee", hex: "#6F4E37", hsl: { h: 25, s: 35, l: 33 } },
  walnut: { name: "Walnut", hex: "#773F1A", hsl: { h: 24, s: 65, l: 29 } },
  cocoa: { name: "Cocoa", hex: "#875F3F", hsl: { h: 27, s: 38, l: 39 } },
  
  // Medium Browns
  goldenBrown: { name: "Golden Brown", hex: "#996515", hsl: { h: 38, s: 75, l: 34 } },
  softBrown: { name: "Soft Brown", hex: "#8B7355", hsl: { h: 30, s: 25, l: 44 } },
  chestnut: { name: "Chestnut", hex: "#954535", hsl: { h: 10, s: 47, l: 40 } },
  
  // Light Browns
  amber: { name: "Amber", hex: "#FFBF00", hsl: { h: 45, s: 100, l: 50 } },
  topaz: { name: "Topaz", hex: "#FFC87C", hsl: { h: 36, s: 100, l: 74 } },
  caramel: { name: "Caramel", hex: "#FFD59A", hsl: { h: 36, s: 100, l: 80 } },
  camel: { name: "Camel", hex: "#C19A6B", hsl: { h: 32, s: 40, l: 59 } },
  tan: { name: "Tan", hex: "#D2B48C", hsl: { h: 34, s: 44, l: 69 } },
  fawn: { name: "Fawn", hex: "#E5AA70", hsl: { h: 31, s: 66, l: 67 } },
  cordovan: { name: "Cordovan", hex: "#893F45", hsl: { h: 355, s: 38, l: 39 } },
  
  // Special Browns
  greenBrown: { name: "Green/Brown", hex: "#6B5344", hsl: { h: 23, s: 23, l: 34 } },
  brownPurple: { name: "Brown-Purple", hex: "#5C4A4A", hsl: { h: 0, s: 11, l: 33 } },
  pinkBrown: { name: "Pink-Brown", hex: "#9E7B6B", hsl: { h: 18, s: 21, l: 52 } },
  greyBrown: { name: "Grey Brown", hex: "#7A6A5B", hsl: { h: 28, s: 15, l: 42 } },
  copper: { name: "Copper", hex: "#B87333", hsl: { h: 29, s: 56, l: 46 } },
};

// =============================================================================
// GREENS
// =============================================================================

export const GREENS: Record<string, Color> = {
  // Emeralds
  emerald: { name: "Emerald", hex: "#50C878", hsl: { h: 140, s: 52, l: 55 } },
  brightEmerald: { name: "Bright Emerald", hex: "#39FF14", hsl: { h: 110, s: 100, l: 54 } },
  darkEmerald: { name: "Dark Emerald", hex: "#046307", hsl: { h: 122, s: 94, l: 20 } },
  paleEmerald: { name: "Pale Emerald", hex: "#7DC383", hsl: { h: 127, s: 37, l: 63 } },
  softEmerald: { name: "Soft Emerald", hex: "#6DAF7A", hsl: { h: 133, s: 30, l: 55 } },
  
  // Teals & Blue-Greens
  teal: { name: "Teal", hex: "#008080", hsl: { h: 180, s: 100, l: 25 } },
  darkTeal: { name: "Dark Teal", hex: "#004D4D", hsl: { h: 180, s: 100, l: 15 } },
  softTeal: { name: "Soft Teal", hex: "#4CA3A3", hsl: { h: 180, s: 41, l: 47 } },
  brightTeal: { name: "Bright Teal", hex: "#00CED1", hsl: { h: 181, s: 100, l: 41 } },
  blueGreen: { name: "Blue Green", hex: "#0D98BA", hsl: { h: 191, s: 87, l: 39 } },
  deepBlueGreen: { name: "Deep Blue-Green", hex: "#0B6659", hsl: { h: 168, s: 83, l: 22 } },
  
  // Jades & Sea Greens
  jade: { name: "Jade", hex: "#00A86B", hsl: { h: 158, s: 100, l: 33 } },
  brightJade: { name: "Bright Jade", hex: "#00D67E", hsl: { h: 155, s: 100, l: 42 } },
  seaGreen: { name: "Sea Green", hex: "#2E8B57", hsl: { h: 146, s: 50, l: 36 } },
  seafoam: { name: "Seafoam", hex: "#71EEB8", hsl: { h: 149, s: 73, l: 69 } },
  seafoamGreen: { name: "Seafoam Green", hex: "#93E9BE", hsl: { h: 149, s: 62, l: 74 } },
  
  // Olives
  olive: { name: "Olive", hex: "#808000", hsl: { h: 60, s: 100, l: 25 } },
  blackOlive: { name: "Black Olive", hex: "#3B3C36", hsl: { h: 70, s: 5, l: 22 } },
  brownOlive: { name: "Brown Olive", hex: "#6B5B3E", hsl: { h: 38, s: 27, l: 33 } },
  greyOlive: { name: "Grey Olive", hex: "#6B6B4B", hsl: { h: 60, s: 18, l: 36 } },
  softOlive: { name: "Soft Olive", hex: "#8B8B6B", hsl: { h: 60, s: 14, l: 48 } },
  lightOlive: { name: "Light Olive", hex: "#A5A56B", hsl: { h: 60, s: 26, l: 53 } },
  
  // Sages & Muted Greens
  sage: { name: "Sage", hex: "#BCB88A", hsl: { h: 55, s: 31, l: 64 } },
  sageGreen: { name: "Sage Green", hex: "#9CAF88", hsl: { h: 96, s: 21, l: 61 } },
  moss: { name: "Moss", hex: "#8A9A5B", hsl: { h: 75, s: 27, l: 48 } },
  greyGreen: { name: "Grey Green", hex: "#8B9A82", hsl: { h: 107, s: 11, l: 56 } },
  silverGreen: { name: "Silver-Green", hex: "#A8C3A8", hsl: { h: 120, s: 21, l: 71 } },
  
  // Special Greens
  kellyGreen: { name: "Kelly Green", hex: "#4CBB17", hsl: { h: 104, s: 79, l: 41 } },
  bottleGreen: { name: "Bottle Green", hex: "#006A4E", hsl: { h: 163, s: 100, l: 21 } },
  glassGreen: { name: "Glass Green", hex: "#5E8C6A", hsl: { h: 137, s: 22, l: 46 } },
  mint: { name: "Mint", hex: "#98FF98", hsl: { h: 120, s: 100, l: 80 } },
  chartreuse: { name: "Chartreuse", hex: "#7FFF00", hsl: { h: 90, s: 100, l: 50 } },
  pistachio: { name: "Pistachio Green", hex: "#93C572", hsl: { h: 94, s: 44, l: 61 } },
  goldenGreen: { name: "Golden Green", hex: "#9B9B4B", hsl: { h: 60, s: 34, l: 45 } },
  sapGreen: { name: "Sap Green", hex: "#507D2A", hsl: { h: 90, s: 50, l: 33 } },
};

// =============================================================================
// BLUES
// =============================================================================

export const BLUES: Record<string, Color> = {
  // Sapphires & Deep Blues
  sapphire: { name: "Sapphire", hex: "#0F52BA", hsl: { h: 216, s: 85, l: 39 } },
  sapphireBlue: { name: "Sapphire Blue", hex: "#0F52BA", hsl: { h: 216, s: 85, l: 39 } },
  cobalt: { name: "Cobalt", hex: "#0047AB", hsl: { h: 216, s: 100, l: 34 } },
  cobaltBlue: { name: "Cobalt Blue", hex: "#0047AB", hsl: { h: 216, s: 100, l: 34 } },
  darkCobalt: { name: "Dark Cobalt", hex: "#003366", hsl: { h: 210, s: 100, l: 20 } },
  indigo: { name: "Indigo", hex: "#4B0082", hsl: { h: 275, s: 100, l: 25 } },
  
  // Bright Blues
  electricBlue: { name: "Electric Blue", hex: "#7DF9FF", hsl: { h: 183, s: 100, l: 75 } },
  brightBlue: { name: "Bright Blue", hex: "#0096FF", hsl: { h: 205, s: 100, l: 50 } },
  cerulean: { name: "Cerulean", hex: "#007BA7", hsl: { h: 196, s: 100, l: 33 } },
  
  // Aquas & Turquoise
  aqua: { name: "Aqua", hex: "#00FFFF", hsl: { h: 180, s: 100, l: 50 } },
  aquamarine: { name: "Aquamarine", hex: "#7FFFD4", hsl: { h: 160, s: 100, l: 75 } },
  turquoise: { name: "Turquoise", hex: "#40E0D0", hsl: { h: 174, s: 72, l: 56 } },
  softTurquoise: { name: "Soft Turquoise", hex: "#7ED4C9", hsl: { h: 170, s: 46, l: 66 } },
  tiffanyBlue: { name: "Tiffany Blue", hex: "#0ABAB5", hsl: { h: 178, s: 91, l: 36 } },
  robinsEggBlue: { name: "Robin's Egg Blue", hex: "#00CCCC", hsl: { h: 180, s: 100, l: 40 } },
  blueTopaz: { name: "Blue Topaz", hex: "#00A5CF", hsl: { h: 193, s: 100, l: 41 } },
  
  // Light Blues
  skyBlue: { name: "Sky Blue", hex: "#87CEEB", hsl: { h: 197, s: 71, l: 73 } },
  babyBlue: { name: "Baby Blue", hex: "#89CFF0", hsl: { h: 199, s: 76, l: 74 } },
  powderBlue: { name: "Powder Blue", hex: "#B0E0E6", hsl: { h: 187, s: 52, l: 80 } },
  lightBlue: { name: "Light Blue", hex: "#ADD8E6", hsl: { h: 195, s: 53, l: 79 } },
  
  // Muted Blues
  slateBlue: { name: "Slate Blue", hex: "#6A5ACD", hsl: { h: 248, s: 53, l: 58 } },
  slate: { name: "Slate", hex: "#708090", hsl: { h: 210, s: 13, l: 50 } },
  greyBlue: { name: "Grey Blue", hex: "#6C7A89", hsl: { h: 210, s: 12, l: 48 } },
  blueGrey: { name: "Blue Grey", hex: "#6699CC", hsl: { h: 210, s: 50, l: 60 } },
  silverBlue: { name: "Silver Blue", hex: "#B0C4DE", hsl: { h: 214, s: 41, l: 78 } },
  dustyBlue: { name: "Dusty Blue", hex: "#7A9EB8", hsl: { h: 204, s: 30, l: 60 } },
  cadetBlue: { name: "Cadet Blue", hex: "#5F9EA0", hsl: { h: 182, s: 26, l: 50 } },
  confederateBlue: { name: "Confederate Blue", hex: "#7C8FB0", hsl: { h: 218, s: 25, l: 59 } },
  
  // Denim & Everyday Blues
  denim: { name: "Denim", hex: "#1560BD", hsl: { h: 213, s: 80, l: 41 } },
  chambray: { name: "Chambray", hex: "#A4B8C4", hsl: { h: 200, s: 21, l: 71 } },
  blueberry: { name: "Blueberry", hex: "#4F86F7", hsl: { h: 221, s: 90, l: 64 } },
  
  // Periwinkle & Lavender Blues
  periwinkle: { name: "Periwinkle", hex: "#CCCCFF", hsl: { h: 240, s: 100, l: 90 } },
  lavenderBlue: { name: "Lavender Blue", hex: "#CCCCFF", hsl: { h: 240, s: 100, l: 90 } },
};

// =============================================================================
// PURPLES
// =============================================================================

export const PURPLES: Record<string, Color> = {
  purple: { name: "Purple", hex: "#800080", hsl: { h: 300, s: 100, l: 25 } },
  darkPurple: { name: "Dark Purple", hex: "#4B0082", hsl: { h: 275, s: 100, l: 25 } },
  softPurple: { name: "Soft Purple", hex: "#B19CD9", hsl: { h: 270, s: 47, l: 73 } },
  greyPurple: { name: "Grey Purple", hex: "#8B7D9B", hsl: { h: 270, s: 15, l: 55 } },
  violet: { name: "Violet", hex: "#EE82EE", hsl: { h: 300, s: 76, l: 72 } },
  lavender: { name: "Lavender", hex: "#E6E6FA", hsl: { h: 240, s: 67, l: 94 } },
  lilac: { name: "Lilac", hex: "#C8A2C8", hsl: { h: 300, s: 28, l: 71 } },
  mauve: { name: "Mauve", hex: "#E0B0FF", hsl: { h: 283, s: 100, l: 85 } },
  iris: { name: "Iris", hex: "#5A4FCF", hsl: { h: 245, s: 56, l: 56 } },
  amethyst: { name: "Amethyst", hex: "#9966CC", hsl: { h: 270, s: 50, l: 60 } },
  dustyLavender: { name: "Dusty Lavender", hex: "#B4A7D6", hsl: { h: 255, s: 37, l: 75 } },
  greyLavender: { name: "Grey-Lavender", hex: "#A7A6BA", hsl: { h: 243, s: 12, l: 69 } },
};

// =============================================================================
// METALLICS
// =============================================================================

export const METALLICS: Record<string, Color> = {
  gold: { name: "Gold", hex: "#FFD700", hsl: { h: 51, s: 100, l: 50 } },
  antiqueGold: { name: "Antique Gold", hex: "#B99553", hsl: { h: 38, s: 44, l: 53 } },
  yellowGold: { name: "Yellow Gold", hex: "#E6BE8A", hsl: { h: 40, s: 60, l: 72 } },
  wovenGold: { name: "Woven Gold", hex: "#D4AF37", hsl: { h: 46, s: 63, l: 52 } },
  roseGold: { name: "Rose Gold", hex: "#B76E79", hsl: { h: 351, s: 34, l: 57 } },
  copperGold: { name: "Copper-Gold", hex: "#C97E4B", hsl: { h: 25, s: 52, l: 54 } },
  silver: { name: "Silver", hex: "#C0C0C0", hsl: { h: 0, s: 0, l: 75 } },
  antiqueSilver: { name: "Antique Silver", hex: "#848789", hsl: { h: 204, s: 2, l: 52 } },
  burnishedSilver: { name: "Burnished Silver", hex: "#9E9E9E", hsl: { h: 0, s: 0, l: 62 } },
  whiteGold: { name: "White Gold", hex: "#E8E8E3", hsl: { h: 60, s: 9, l: 90 } },
  platinum: { name: "Platinum", hex: "#E5E4E2", hsl: { h: 40, s: 6, l: 89 } },
  copper: { name: "Copper", hex: "#B87333", hsl: { h: 29, s: 56, l: 46 } },
  bronze: { name: "Bronze", hex: "#CD7F32", hsl: { h: 30, s: 60, l: 50 } },
  pewter: { name: "Pewter", hex: "#8BA8B7", hsl: { h: 196, s: 22, l: 63 } },
};

// =============================================================================
// NEUTRALS & GREYS
// =============================================================================

export const NEUTRALS: Record<string, Color> = {
  white: { name: "White", hex: "#FFFFFF", hsl: { h: 0, s: 0, l: 100 } },
  offWhite: { name: "Off White", hex: "#FAF9F6", hsl: { h: 45, s: 33, l: 97 } },
  grey: { name: "Grey", hex: "#808080", hsl: { h: 0, s: 0, l: 50 } },
  silverGrey: { name: "Silver Grey", hex: "#C0C0C0", hsl: { h: 0, s: 0, l: 75 } },
  doveGrey: { name: "Dove Grey", hex: "#969696", hsl: { h: 0, s: 0, l: 59 } },
  mushroom: { name: "Mushroom", hex: "#CEB9A8", hsl: { h: 28, s: 27, l: 74 } },
  taupe: { name: "Taupe", hex: "#483C32", hsl: { h: 30, s: 18, l: 24 } },
  lightTaupe: { name: "Light Taupe", hex: "#B38B6D", hsl: { h: 28, s: 34, l: 56 } },
  putty: { name: "Putty", hex: "#E6D5B8", hsl: { h: 38, s: 45, l: 81 } },
  oysterShell: { name: "Oyster-Shell", hex: "#DCD5CC", hsl: { h: 35, s: 17, l: 83 } },
};

// =============================================================================
// ALL COLORS - Combined export for easy access
// =============================================================================

export const ALL_COLORS = {
  skinTones: SKIN_TONES,
  romantic: ROMANTIC,
  formal: FORMAL,
  browns: BROWNS,
  greens: GREENS,
  blues: BLUES,
  purples: PURPLES,
  metallics: METALLICS,
  neutrals: NEUTRALS,
};

// Helper function to find a color by name across all categories
export function findColorByName(name: string): Color | undefined {
  const normalizedName = name.toLowerCase().replace(/[- ]/g, '');
  
  for (const category of Object.values(ALL_COLORS)) {
    for (const [key, color] of Object.entries(category)) {
      if (key.toLowerCase() === normalizedName || 
          color.name.toLowerCase().replace(/[- ]/g, '') === normalizedName) {
        return color;
      }
    }
  }
  return undefined;
}

// Get color hex by name
export function getColorHex(name: string): string | undefined {
  return findColorByName(name)?.hex;
}
