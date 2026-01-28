import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Complete subtype data extracted from src/data/subtypes.ts
// This is the SINGLE SOURCE OF TRUTH for the methodology
const SUBTYPE_DATA: Record<string, {
  beautyStatement?: string;
  paletteEffects?: string[];
  fabrics?: string[];
  prints?: string[];
  eras?: string[];
  artists?: string[];
  designers?: string[];
  keyColors?: string[];
  avoidColors?: string[];
  jewelryMetals?: string[];
  jewelryStones?: string[];
  jewelryStyles?: string[];
}> = {
  // ============ SPRING SUBTYPES ============
  "wildflower-spring": {
    beautyStatement: "Delicate, romantic, whimsical Spring with Dutch master sensibility",
    paletteEffects: ["Girl with a Pearl Earring", "Fawn in a Field of Wildflowers", "Bouquet of Flowers in a Vase", "Milk Maiden"],
    fabrics: ["Tulle Trim", "Ruched Fabric", "Embroidery", "Appliqué", "Floral Print", "Crocheted Lace", "Eyelet", "Paisley", "Suede", "Velvet", "Small Tweeds", "Gingham", "Patchwork"],
    prints: ["Florals", "Butterflies", "Whimsical Prints", "Dutch Knits", "Trompe L'oeil", "Purple/Blue/Green Plaid"],
    eras: ["1600s Dutch", "Rembrandt and Vermeer", "1700s French Romantic", "1930s Europe", "Milk Maiden"],
    artists: ["Vermeer", "Rembrandt", "Van Gogh", "Degas"],
    designers: ["Miu Miu", "Marni", "Chanel"],
    jewelryStyles: ["Enamel", "Cloisonné", "Wildflowers", "Whimsical Charms", "Clover", "Celtic Knots", "Pearls", "Fleur-de-lis"],
    jewelryMetals: ["Gold", "Silver"],
    jewelryStones: ["Pearl", "Blue Topaz", "Amethyst"],
  },
  "french-spring": {
    paletteEffects: ["Gardenia Summer", "Southern Belle", "Milk Maiden", "Gibson Girl"],
    fabrics: ["Organza", "Muslin", "Cotton", "Taffeta", "Fine Tweed", "Velvet", "Grosgrain Ribbons", "Linen/Cotton", "Cotton lace", "Fine Lace", "Denim", "Chambray", "Wool Jersey", "Angora", "White or Chocolate Fur", "Suede"],
    prints: ["Gardenias", "Dogwood", "Jasmine", "Small Roses", "Butterflies", "Birds", "Fleur De Lis", "Small Diamonds", "Rectangles", "Blue and White Stripes", "Paisley", "Florals", "Polka dots", "Whimsical Prints", "Delftware", "Delft Blue and White", "Porcelain Tiles", "Camelias"],
    eras: ["1800's French Dress", "1800's Dutch", "Gibson Girl", "Turn of the century American Fashion", "Japanese Kimono"],
    artists: ["Mary Cassatt", "Renoir", "Odilon Redon"],
    jewelryStyles: ["Enameled Jewelry", "Floral Jewels", "Clusters of Stones", "Velvet Ribbons for Necklaces"],
    jewelryMetals: ["Rose Gold", "Silver"],
    jewelryStones: ["Green Glass", "Blue Topaz", "Sapphire", "Pink Coral", "White Coral", "Amethyst"],
  },
  "early-spring": {
    beautyStatement: "The first delicate touches of Spring - soft, fresh, awakening",
    paletteEffects: ["Cherry Blossoms", "First Flowers", "Morning Dew", "New Growth"],
    fabrics: ["Silk", "Fine Cotton", "Chiffon", "Cashmere", "Fine Knit", "Crêpe", "Eyelet"],
    prints: ["Cherry Blossoms", "Seashells", "Butterflies", "Delicate Florals", "Birds", "First Flowers"],
    eras: ["Edwardian", "Early 1900s", "French Romantic"],
    jewelryMetals: ["Rose Gold", "Silver"],
    jewelryStones: ["Aquamarine", "Rose Quartz", "Pearl", "Blue Topaz"],
    jewelryStyles: ["Delicate chains", "Floral motifs", "Spring-inspired"],
  },
  // ============ SUMMER SUBTYPES ============
  "ballerina-summer": {
    paletteEffects: ["Princess", "Rose Garden", "Ballerina", "Peasant Girl- Eastern Europe", "Milk Maiden"],
    fabrics: ["Lace", "Eyelet", "White Fur", "Fine Cotton", "Organza", "Chiffon", "Embroidery", "Needlepoint", "Fine wool", "Wool Jersey", "Velvet", "Fine Corduroy"],
    prints: ["Florals", "Roses", "Hydrangeas", "Tulips", "Violets", "Paisley", "Polka Dots", "Fleur De Lis", "Hearts", "Lockets", "Ribbons", "Birds", "Butterflies", "Fountains", "Windowpane", "Diamonds", "Ovals", "Delicate Branches with Flowers"],
    eras: ["Gibson Girl", "England 1800's", "France 1800's", "Hungarian Costume 19th century"],
    artists: ["Monet", "Cassatt"],
    jewelryStyles: ["Colored stones", "Enamel Flowers", "Hanging beaded earrings", "Cameo Flowers", "Flower and bird designs"],
    jewelryMetals: ["Rose Gold", "Silver"],
    jewelryStones: ["Amethyst", "Blue topaz", "Green opals", "Blue Glass", "Pearls", "Quartz", "Pink Coral", "White Coral"],
  },
  "cameo-summer": {
    paletteEffects: ["English Roses", "Romantic French Design", "Fleur de Lis", "Trompe L'oeil", "Iridescent Embroidered Cloth"],
    fabrics: ["Toile", "Embroidered Cotton", "Velvet", "Chiffon", "Smooth Satin", "Micro Tweeds", "Fine Wool", "Cotton Linen Mix", "Suede", "Jersey", "Satin Jersey", "Polished Cotton"],
    jewelryStyles: ["Dangling Earrings", "Teardrop earrings", "Pear Cut Pink Diamond"],
    jewelryMetals: ["Rose Gold", "Silver"],
    jewelryStones: ["Cameos", "Pink Quartz", "Pearls", "Rubies", "Sapphires", "Labradorite", "Green Stones"],
  },
  "chinoiserie-summer": {
    paletteEffects: ["Summer Princess", "Guinevere", "Summer Woods", "Summer Rose Garden", "Renaissance Princess", "Grecian Effects", "Japanese Garden", "Chinoiserie Effect", "Cloisonne Effect"],
    fabrics: ["Lace", "Crocheted lace", "Eyelet", "Velvet", "Crushed Velvet", "Corduroy", "Chambray", "Denim", "Soft Leather", "Suede", "Embossed Leather", "Fine Tweed", "Brocade", "Tapestry", "Organza", "Pleated Cotton", "Cotton Linen", "Silk", "Woven Silk", "Polished Cotton", "Jersey", "Fine Wool", "Mohair", "Angora", "Melange", "Needle point"],
    prints: ["Roses", "Myrtle", "Clematis", "Wisteria", "Wild Rose", "Camelias", "Almond Blossoms", "Star Flowers", "Hibiscus", "Jasmine", "Fine Ombre Stripe", "Ombre", "Iridescent fabrics", "Climbing Flowers", "Trees and Flowers", "Orchard prints", "Prince of Wales plaid", "Small Scottish Plaid", "Painted Pagodas and Houses", "Birds", "Butterflies", "Dragonflies", "Feathers", "Wings", "Hearts", "Pearls", "Seashells", "Trompe L'oeil Ribbons and Lace"],
    designers: ["Bluemarine", "Chloe"],
    artists: ["Sargent", "Degas"],
    jewelryStyles: ["Embossed Gold", "Filigree", "Engraved gold", "Cameos in Roses and Leaves", "Gold chains of Leaves, Branches and Flowers", "Birds and Feathers"],
    jewelryMetals: ["Rose Gold", "Gold", "Silver"],
    jewelryStones: ["Blue Topaz", "Aquamarine", "Labradorite", "Pink Quartz", "Opals", "White Coral", "Amethyst", "Garnet"],
  },
  "degas-summer": {
    paletteEffects: ["1800's Indian and Persian design (soft)", "1600's Dutch", "Mid 1800's France", "English Rose", "Ballerina", "Summer Lake at Dawn", "Opal and Moonstone Palette", "Softly Iridescent Colors", "Peacock-Pheasant Palette"],
    fabrics: ["Velvet", "Soft knits", "Chanel Tweed", "Fine corduroy", "Jersey", "Silk", "Tulle", "Eyelet", "Crocheted Lace", "Angora", "Mohair", "Scottish Lace", "Colored Denim", "Iridescent leather", "Soft Leather", "Suede", "Cotton", "Cotton-Linen"],
    prints: ["Small flowers", "Stripes", "Animal print", "Tulips", "Peonies", "Bluebells", "Hibiscus", "Jasmine", "Daisies", "Bamboo prints", "Soft tropical flowers"],
    artists: ["Ingres", "Vermeer"],
    designers: ["Marni", "Bluemarine", "Chloe"],
    jewelryStyles: ["Beaded Chandelier Earrings", "Tear Drop shapes", "Oval cut gems", "Multi colored gemstones in shapes of flowers and birds", "Ivory enamel flowers"],
    jewelryMetals: ["Rose Gold", "Silver"],
    jewelryStones: ["Garnet", "Rhodonite", "Quartz", "Moonstone", "Opal", "Blue Topaz", "Agate", "Tourmaline"],
  },
  "dusky-summer": {
    paletteEffects: ["Gibson Girl", "Cowgirl", "Grecian", "Edwardian Era", "English 1800's", "American Pioneer", "Patchwork"],
    fabrics: ["Jersey", "Angora", "Velvet", "Chenille", "Chiffon", "Fine Cotton", "Organza", "Fine Corduroy", "Mohair", "Colored Denim"],
    jewelryStyles: ["Small Charms", "Hearts and Flowers", "Enameled Flowers"],
    jewelryMetals: ["Antique Gold", "Silver"],
    jewelryStones: ["Aquamarine", "Labradorite", "Turquoise", "Opals", "Rose Quartz", "Pink Pearls"],
  },
  "emerald-summer": {
    paletteEffects: ["Rose Garden", "Renaissance Princess", "Tea Rose Palette", "Summer Sunset", "Summer Woods"],
    fabrics: ["Crocheted Lace", "Fine Lace", "Velvet", "Corduroy", "Striped Denim", "Fine Wool", "Fine Tweed", "Embossed Floral Leather", "Suede", "Jersey wool", "Fine Cotton", "Cotton/Linen Blend", "Burlap", "Colored Denim", "Silk", "Organza", "Chiffon", "Applique"],
    prints: ["Antique Roses", "Tea Roses", "Stone Garden Bench", "Marbled Stone", "Birds", "Flowers", "Butterflies", "Hearts", "Lockets", "Fleur De Lis", "Cameos", "Trompe L'oeil Lace and Ribbons", "Small geometric shapes", "Polka dots", "Paisley", "Tile Mosaic", "Climbing florals", "Floral embroidery", "Vases with Flowers"],
    eras: ["English Renaissance", "French 1800's", "England 1800's", "Gibson Girl", "1940's fashion"],
    artists: ["John Singer Sargent", "Dante Gabriel Rossetti"],
    jewelryStyles: ["Cameos", "Enamel flowers and leaves", "Floral filigree", "Marble or Mother of Pearl", "Pearls"],
    jewelryMetals: ["Copper", "Rose Gold", "White Gold"],
    jewelryStones: ["Emeralds", "Small diamonds", "Topaz", "Blue Topaz"],
  },
  "english-summer": {
    paletteEffects: ["Sunlight shining through the woods", "Late English Summer", "English Rose Garden", "Garden with hanging Flowers"],
    fabrics: ["Embroidered Chiffon", "Applique", "Jacquard", "Tapestry", "Fine Lace", "Embroidery on Cotton", "Fine tweed", "Fine Wool knit", "Linen Cotton", "Cotton Organza", "Chenille", "Stretch velvet", "Matte Velvet", "Fine ribbons"],
    prints: ["Pearls", "Seashells", "Roses", "Lilies", "Lilacs", "Tulips", "Lavender", "Small ovals, squares or diamonds", "Narrow stripe or lines", "Delicate flowers and branches", "Birds and Flowering trees", "Dogwood", "Ribbon Prints", "Lace Trompe L'oeil", "Watercolor Prints"],
    eras: ["English 1800's", "Art Deco", "French 1700's"],
    artists: ["Monet", "Manet"],
    jewelryStyles: ["Delicate colored beads", "Glass beads", "Dangling pearls", "Clusters of stones", "Enamel Designs", "Pear shaped pendant", "Chandelier earrings in Filigree"],
    jewelryMetals: ["Rose Gold", "Gold", "Silver"],
    jewelryStones: ["Green Glass", "Labradorite", "Pearls", "Topaz", "Green Opal", "Agate", "Aquamarine", "Aventurine"],
  },
  "porcelain-summer": {
    beautyStatement: "Deep Sapphire Blues and Glass Greens. Light pinks and blues of flowers grounded with Golden Browns. A pure and iridescent Palette",
    paletteEffects: ["Ballerina", "Porcelain effect", "Summer Rose Garden", "Venice Watercolors", "Watercolor painting", "Cloisonne", "French and English designs"],
    fabrics: ["Fine Lace", "Eyelet", "Crocheted Lace", "Net", "Chiffon", "Tulle", "Tweed", "Velvet", "Crushed velvet", "Corduroy", "Chambray", "Denim", "Fine wool", "Boucle", "Jersey", "Gauze", "Polished Cotton", "Silk", "Iridescent fabric", "Mohair", "Angora"],
    prints: ["Roses", "Daisies", "Anemones", "Peonies", "Hydrangeas", "Dogwood", "Water Lilies", "Lotus Flowers", "Jasmine", "Lace Prints", "Trompe L'oeil", "Swans", "Birds and Feathers", "Deer", "Porcelain designs", "Blue and White China", "Windowpane", "Bouquets of Flowers", "Vases", "Green Glass", "Fine stripes", "Climbing Florals", "Kimono Prints", "Cherry Blossoms", "Polka dots", "Paisley-delicate", "Toile Prints", "Musical instruments", "Musical Notes"],
    eras: ["Edwardian", "French 1700's", "Russian Princess 1800's"],
    artists: ["Degas", "Sargent"],
    jewelryStyles: ["Enamel designs", "Cameos", "Cloisonne", "Jeweled flowers", "Bird Pendants", "Delicate dangling bird earrings", "feather earrings", "Climbing flowers", "Filigree", "Whimsical designs with birds, trees and houses"],
    jewelryMetals: ["Gold", "Silver"],
    jewelryStones: ["Amethyst", "Blue topaz", "Topaz", "Garnet", "Quartz", "Pearls", "Sapphires", "Green Glass", "Tourmaline", "Aventurine"],
  },
  "rose-gold-summer": {
    paletteEffects: ["English Rose Garden", "Renaissance Princess", "Gibson Girl", "French 1700's", "English 1800's", "Ancient Greece", "Edwardian Costume", "Ballerina Costume"],
    fabrics: ["Fine Velvet", "Crushed Velvet", "Velour", "Jersey", "Fine Tweed", "Tulle", "Chiffon", "Lace", "Crocheted Lace", "Gauze Cotton", "Silk", "Denim", "Fine Corduroy", "Chambray", "Shredded Tulle", "Brocade-Soft"],
    prints: ["Hearts", "Fleur De Lis", "Ribbons", "Toile in Roses, Leaves and Fountain", "Peonies", "Tulips", "Hollyhocks", "Larkspur", "Dogwood", "Hydrangeas", "Daisies", "Paisley", "Window Panes", "Fine Stripe", "Seashells", "Pearls", "Sea Glass", "Watercolor Prints", "Polka Dots", "Small Diamonds", "Ovals", "Leopard Prints", "Birds", "Deer"],
    designers: ["BlueMarine", "Chloe", "Ulla Johnson", "Stella McCartney"],
    artists: ["Sargent", "Manet"],
    jewelryStyles: ["Hearts", "Lockets", "Ribbons", "Delicate chains", "layered rings and bracelets"],
    jewelryMetals: ["Rose Gold", "Woven Gold", "Silver"],
    jewelryStones: ["White Coral", "Pearls", "Pink Coral", "Sea Glass", "Aventurine", "Topaz", "Blue Topaz", "Quartz", "Marble", "Opals"],
  },
  "summer-rose": {
    beautyStatement: "A Watercolor Palette in Blues, Greens and Purples. The Golden-Browns and Creams add warmth to the pastels. A Palette of a Rose Garden in late Summer",
    paletteEffects: ["Summer Rose Garden", "Lake with Water Lilies", "Japanese Garden", "Renaissance Princess"],
    fabrics: ["Eyelet", "Lace", "Crocheted Lace", "Knitted Lace", "Velvet", "Crushed Velvet", "Fine Corduroy", "Chambray", "Denim", "Cotton-Linen", "Organza", "Chiffon", "Tulle", "Tweed", "Boucle", "Angora", "Silk", "Gauze Cotton", "Jersey", "Suede", "Soft Leather", "Fine Knits", "Fisherman Knits", "Irish Knits", "Embroidered Cotton", "Needlepoint/Tapestry"],
    prints: ["Flowers", "Ribbons", "Pearls", "Birds", "Bird Cages", "Feathers", "Butterflies", "Deer", "Diamond Prints", "Vases", "Fleur De Lis", "Fine Stripes", "Porcelain Prints", "Plaid", "Roses", "Peonies", "Tulips", "Jasmine", "Star Flowers", "Lilacs", "Hydrangeas", "Hibiscus", "Water Lilies", "Lotus", "Paisley", "Hearts", "Lockets", "Bows", "Cherry Blossoms", "Magnolias", "Gardenias"],
  },
  // ============ AUTUMN SUBTYPES ============
  "auburn-autumn": {
    paletteEffects: ["Celtic Fire", "Autumn Leaves", "Irish Countryside", "Renaissance"],
    fabrics: ["Tweed", "Wool", "Cashmere", "Velvet", "Corduroy", "Suede", "Leather", "Denim", "Linen", "Cotton"],
    prints: ["Paisley", "Plaid", "Herringbone", "Houndstooth", "Celtic patterns", "Leaves", "Branches"],
    eras: ["Celtic", "Irish", "Scottish", "Renaissance"],
    jewelryStyles: ["Celtic knots", "Filigree", "Enamel", "Nature motifs"],
    jewelryMetals: ["Copper", "Antique Gold", "Bronze"],
    jewelryStones: ["Amber", "Topaz", "Citrine", "Tiger's Eye", "Garnet"],
  },
  "burnished-autumn": {
    paletteEffects: ["Gilded Bronze", "Antique Gold", "Harvest", "Medieval"],
    fabrics: ["Brocade", "Velvet", "Satin", "Silk", "Tweed", "Leather", "Suede"],
    prints: ["Damask", "Brocade patterns", "Paisley", "Medieval motifs"],
    eras: ["Medieval", "Renaissance", "Byzantine"],
    jewelryStyles: ["Links", "Chains", "Coins", "Filigree"],
    jewelryMetals: ["Antique Gold", "Copper", "Bronze"],
    jewelryStones: ["Topaz", "Amber", "Citrine", "Garnet", "Tiger's Eye"],
  },
  "cloisonne-autumn": {
    paletteEffects: ["Byzantine Enamel", "Chinese Cloisonné", "Persian Design"],
    fabrics: ["Silk", "Brocade", "Velvet", "Satin", "Fine wool"],
    prints: ["Cloisonné patterns", "Persian designs", "Geometric", "Ethnic"],
    eras: ["Byzantine", "Persian", "Chinese Dynasty"],
    jewelryStyles: ["Cloisonné", "Enamel", "Mosaic", "Ethnic designs"],
    jewelryMetals: ["Gold", "Copper", "Bronze"],
    jewelryStones: ["Jade", "Coral", "Turquoise", "Lapis Lazuli"],
  },
  "grecian-autumn": {
    paletteEffects: ["Athenian Gold", "Mediterranean", "Classical Greece"],
    fabrics: ["Silk", "Cotton", "Linen", "Chiffon", "Jersey"],
    prints: ["Greek key", "Meander", "Classical motifs", "Olives", "Laurel"],
    eras: ["Ancient Greece", "Classical", "Mediterranean"],
    jewelryStyles: ["Greek key", "Laurel wreaths", "Coins", "Filigree"],
    jewelryMetals: ["Gold", "Antique Gold"],
    jewelryStones: ["Pearls", "Coral", "Jade", "Olive Green stones"],
  },
  "mellow-autumn": {
    paletteEffects: ["Tuscan Afternoon", "Grecian Princess", "Mediterranean Palette", "End of Autumn", "Spanish Desert", "Ancient Japan", "Renaissance Italy"],
    fabrics: ["Denim", "Fur", "Mohair", "Tweed", "Leather", "Suede", "Shantung", "Chiffon", "Velvet", "Brocade", "Tapestry"],
    prints: ["Paisley", "Herringbone", "Houndstooth", "Prince of Wales", "Leaves", "Branches", "Moroccan Tile", "Animal print", "Feathers"],
    eras: ["19th Century Morocco", "19th Century Spain and Italy", "1940's", "1920's Art Deco"],
    artists: ["Modigliani", "Corot"],
    designers: ["Etro", "Cuccinelli", "Ralph Lauren"],
    jewelryStyles: ["Braided gold", "chain link", "rope necklaces", "Leaves, Coins, Feathers", "Filigree", "Enamel"],
    jewelryMetals: ["Copper", "Antique Gold", "Pewter", "Yellow Gold"],
    jewelryStones: ["Topaz", "Emerald", "Amber", "Citrine", "Labradorite", "Pearls", "Coral", "Jade", "Ivory"],
  },
  "multi-colored-autumn": {
    paletteEffects: ["Multicolored Gems and Tapestry", "Queen Esther Palette", "Coat of Many Colors", "Persian Design", "Spanish Renaissance"],
    fabrics: ["Chiffon", "Black/Brown lace", "Linen", "Satin", "Cashmere", "Pashmina", "Sari cloth", "Suede", "Velvet", "Embossed leather"],
    artists: ["El Greco", "Corot", "Modigliani"],
    designers: ["Cavalli", "Missoni", "Brunello Cuccinelli"],
    jewelryStyles: ["Braided chains", "Links", "Woven Gold", "Ropes and Tassels", "Crescent Shaped", "Chandelier earrings", "Animal shapes", "Cloisonne", "Enamel"],
    jewelryStones: ["Jasper", "Labradorite", "Coral", "Turquoise", "Topaz", "Amber", "Green Onyx", "Ivory", "Yellow diamonds"],
  },
  "persian-autumn": {
    paletteEffects: ["Spanish Desert", "Moroccan Tile", "Italian Seaside", "Japanese Garden"],
    fabrics: ["Metallic Chiffon", "Lace", "Wool Knit", "Silk Shantung", "Denim", "Leather", "Suede", "Sari Fabric", "Tweed"],
    prints: ["Birds, Tigers, Elephants and Leopards", "Paisley", "Geometric Shapes", "Mosaic patterns", "Kimono Prints", "Pagodas", "Missoni Stripe", "Peacock feathers"],
    designers: ["Etro", "Dries Van Noten", "Cavalli"],
    artists: ["Corot", "Modigliani", "Gauguin"],
    jewelryStyles: ["Birds, Branches, Leaves and Feathers", "Hammered gold", "Mosaic and Enamel designs"],
    jewelryMetals: ["Gold", "Antique gold", "Copper", "Pewter"],
    jewelryStones: ["Polished Jade", "Amber", "Pearls", "Ivory"],
  },
  "renaissance-autumn": {
    paletteEffects: ["Renaissance Queen", "Mediterranean Palette", "Medieval Spanish and Italian", "Persian and Moroccan", "Guinevere"],
    fabrics: ["Silk shantung", "Silk", "Satin", "Taffeta", "Velvet", "Corduroy", "Denim", "Cashmere", "Pashmina", "Lace", "Sari silk", "Tapestries", "Tweed", "Leather", "Suede", "Mohair", "Etro Prints"],
    prints: ["Printed chiffon of houses, Trees, Water", "Leaf and Branch prints", "Paisley", "Tiger, Zebra, leopard", "Ostrich and Peacock feathers", "Houndstooth", "Burberry Plaid", "Military braid and Gold buttons"],
    designers: ["Etro", "Dries Van Noten"],
    artists: ["John Singer Sargent"],
    jewelryStyles: ["Rope necklaces", "Chain links", "Indian and Persian designs", "Grapes, wheat, leaves motifs"],
    jewelryMetals: ["Gold", "Pewter", "Copper", "Silver"],
    jewelryStones: ["Pearls", "shells", "amber", "Topaz", "Jade", "Onyx", "Opals", "Blue Topaz"],
  },
  "sunlit-autumn": {
    beautyStatement: "Like an Early September day. Leaves just changing, mix of flowers, fruits and leaves",
    paletteEffects: ["Sunlight in Early Autumn", "Mediterranean seaside", "Boats and Sunset", "Harvest"],
    fabrics: ["Heavy lace", "Crocheted lace", "Fine lace", "Gold and Copper lace", "Jersey wool", "Boucle", "Irish knits", "Tweed", "velvet", "brocade", "Denim", "Leather", "Suede", "Feathers", "Chambray", "organza", "linen", "Cashmere", "Angora", "Mohair", "Fur"],
    prints: ["Leaves and Flowers", "Fan shaped flowers", "Palm trees", "Wheat", "Plaid", "Herringbone", "Chevron", "Missoni", "Prince of Wales", "Butterflies", "exotic birds", "tropical flowers", "Leopards, Cheetah, Tiger", "Paisley", "Indian prints", "Persian rug prints"],
    eras: ["1970's", "Classic Grecian", "Mediterranean looks", "Egyptian"],
    artists: ["Van Gogh", "Da Vinci"],
    designers: ["Cavalli", "Dries Van Noten", "Brunello Cuccinelli"],
    jewelryStyles: ["Links", "ropes and chains", "Birds, wings, feathers", "Tassels", "Egyptian motifs", "Persian paisley", "Seashell and fan earrings"],
    jewelryMetals: ["Gold", "antique gold", "antique silver"],
    jewelryStones: ["Emeralds", "ivory", "Jade", "Blue Topaz", "Topaz", "Pearls", "pink coral", "white coral"],
  },
  "tapestry-autumn": {
    paletteEffects: ["Spanish Sunset", "Mediterranean Seaside", "Spanish Princess", "French Girl Chic"],
    fabrics: ["Silk Shantung", "Silk-Linen", "Linen-Cotton", "Denim", "Fur", "Suede", "Velvet", "Satin", "Boucle", "Tweed", "Cashmere", "Tapestry", "Brocade"],
    prints: ["Paisley", "Mosaic", "Tile patterns", "Spanish motifs", "Mediterranean prints", "Fruit and Vine", "Leaves and Branches", "Animal prints"],
    designers: ["Etro", "Missoni"],
    artists: ["Corot"],
    jewelryStyles: ["Mosaic designs", "Tapestry inspired", "Ethnic patterns", "Coins", "Links"],
    jewelryMetals: ["Copper", "Bronze", "Antique Gold", "Pewter"],
    jewelryStones: ["Coral", "Amber", "Topaz", "Jade", "Turquoise"],
  },
  "topaz-autumn": {
    paletteEffects: ["Autumn Jewels", "Golden Harvest", "Mediterranean Autumn", "Spanish Gold"],
    fabrics: ["Silk Shantung", "Velvet", "Suede", "Leather", "Tweed", "Cashmere", "Wool", "Brocade", "Satin", "Linen"],
    prints: ["Paisley", "Leaves and Branches", "Geometric", "Animal prints", "Ethnic patterns", "Mosaic"],
    designers: ["Etro", "Cavalli"],
    artists: ["Corot", "Modigliani"],
    jewelryStyles: ["Links", "Chains", "Coins", "Leaves and Branches", "Ethnic designs"],
    jewelryMetals: ["Gold", "Antique Gold", "Copper", "Bronze"],
    jewelryStones: ["Topaz", "Amber", "Citrine", "Yellow Sapphire", "Emerald", "Jade"],
  },
  // ============ WINTER SUBTYPES ============
  "burnished-winter": {
    paletteEffects: ["Winter Sunset", "Medieval Knight", "Spanish Renaissance", "Antique Tapestry"],
    fabrics: ["Velvet", "Brocade", "Tapestry", "Silk Shantung", "Satin", "Cashmere", "Fine Wool", "Leather", "Suede", "Tweed", "Lace", "Metallic Weave"],
    prints: ["Paisley", "Brocade patterns", "Tapestry designs", "Herringbone", "Houndstooth", "Animal prints", "Leopard", "Mosaic", "Tile prints", "Medieval motifs"],
    jewelryStyles: ["Links", "Chains", "Rope designs", "Medieval inspired", "Coins", "Filigree"],
    jewelryMetals: ["Antique Gold", "Pewter", "Silver", "Platinum"],
    jewelryStones: ["Emeralds", "Sapphires", "Rubies", "Topaz", "Amber", "Diamonds"],
  },
  "cameo-winter": {
    paletteEffects: ["Cameo Portrait", "Victorian Rose", "Winter Rose Garden", "Edwardian Elegance"],
    fabrics: ["Velvet", "Satin", "Fine Lace", "Chiffon", "Silk", "Cashmere", "Fine Wool", "Brocade", "Organza"],
    prints: ["Cameos", "Roses", "Victorian florals", "Lace patterns", "Fine stripes", "Delicate geometrics", "Ribbons", "Pearls"],
    jewelryStyles: ["Cameos", "Filigree", "Victorian designs", "Delicate chains", "Pearl strands", "Lockets"],
    jewelryMetals: ["Silver", "White Gold", "Platinum", "Rose Gold"],
    jewelryStones: ["Cameos", "Pearls", "Sapphires", "Diamonds", "Amethyst", "Blue Topaz"],
  },
  "crystal-winter": {
    paletteEffects: ["Ice Crystal", "Winter Forest", "Frozen Lake", "Crystal Palace"],
    fabrics: ["Fine Corduroy", "Metallic fabrics", "Velvet", "Crystal embellished", "Lace", "Eyelet", "Denim", "Tulle", "Satin", "Silk"],
    prints: ["Paisley", "Leopard with flowers", "Geometric", "Tropical flowers", "Silver hearts", "Lockets", "William Morris designs", "Stripes"],
    designers: ["Chanel", "Bluemarine", "Chloe"],
    artists: ["Matisse", "Picasso"],
    jewelryStyles: ["Hearts", "Lockets", "Etched silver", "Enamel", "Pave", "Floral motifs"],
    jewelryMetals: ["White Gold", "Silver", "Rose Gold", "Platinum"],
    jewelryStones: ["Diamonds", "Emeralds", "Sapphires", "Rubies", "Green Glass"],
  },
  "exotic-winter": {
    paletteEffects: ["Exotic Night", "Tropical Paradise", "Jungle Luxe", "Safari Glamour"],
    fabrics: ["Silk", "Satin", "Velvet", "Chiffon", "Leather", "Snakeskin", "Brocade"],
    prints: ["Animal prints", "Tropical", "Exotic florals", "Jungle motifs"],
    jewelryStyles: ["Exotic designs", "Animal motifs", "Bold pieces"],
    jewelryMetals: ["Gold", "Antique Gold", "Bronze"],
    jewelryStones: ["Emeralds", "Rubies", "Jade", "Coral", "Tiger's Eye"],
  },
  "gemstone-winter": {
    beautyStatement: "This Palette blends cool blues and purples along with warmer earth tones. Like a blue lake at sunset.",
    paletteEffects: ["Jewel Tone Palette", "Bouquet of Roses", "Blue Lake at sunset"],
    fabrics: ["Lace", "Fine Lace", "Linen", "Linen Cotton", "Denim", "Chambray", "Velvet", "Cut Velvet", "Fine tweed", "Fur", "Cashmere", "Angora", "Tulle", "Toile", "Sheep Boucle", "Satin", "Silk", "Shantung"],
    prints: ["Houndstooth", "Fine Stripe", "Toile prints", "Plaid", "Roses and Branches", "Hibiscus Flowers", "Tropical Flowers and Leaves", "Gardenias", "Lotus Flowers", "Grapes, Grape Leaves, Pomegranates, Apples", "Small Diamonds", "Chevron", "Tweed", "Missoni Prints", "Paisley", "Mosaic Prints", "Fleur De Lis", "Lace prints", "Trompe L'oeil", "Birds, Deer and Elephants", "Embossed leather", "Peacock Feathers", "Ostrich Feathers", "Silk Tassels", "Lilies", "Water lilies", "Calla Lilies"],
    eras: ["Persian", "Indian", "Edwardian", "Romanian peasant style"],
    artists: ["Modigliani", "Da Vinci"],
    jewelryStyles: ["Filigree", "Enamel", "Pave", "Links", "Braided Chains", "Floral Enamel", "Birds", "Feathers", "Leaves", "Water Lilies", "Lotus flowers"],
    jewelryMetals: ["Rose Gold", "Platinum", "Silver", "Gold"],
    jewelryStones: ["Pearls", "Sapphires", "Amethyst", "Carnelian", "Garnets", "Rubies"],
  },
  "mediterranean-winter": {
    paletteEffects: ["Spanish Mountains", "Mediterranean Palette", "Queen Esther", "Moroccan Mosaics", "Spanish Tiles", "Early Winter Sunset"],
    fabrics: ["Shantung", "Jersey", "Crushed Velvet", "Cut Velvet", "Corduroy", "Suit Fabric", "Fine wool", "Tweed", "Linen", "Linen Cotton mix", "Lace", "Boucle", "Polished Cotton", "Brocade", "Tapestry"],
    prints: ["Mosaic", "Fine stripes", "Geometric Patterns", "Tile Prints", "Leaves", "Branches", "Houses", "Pitchers", "Feathers", "Trees", "Leopard", "Tiger", "Zebra", "Plaid", "Missoni Prints", "Pinstripes", "Ombre Chiffon Prints", "Mountain and Water prints", "Indian and Persian Embroidery", "Lilies", "Parrot Flowers", "Roses", "Wheat", "Grapes", "Apples", "Toile"],
    eras: ["Mediterranean Classical", "Moorish", "Spanish Colonial"],
    designers: ["Etro", "Brunello Cuccinelli", "Missoni"],
    artists: ["Corot", "Modigliani"],
    jewelryStyles: ["Rope and Links for chains", "Layered chains of different textures", "Green and Coral beads", "Large opaque stones", "Irregular shaped stones", "Beaded or Braided settings", "Chandelier earrings", "Leaf and Feather shaped earrings", "Pear or rectangular earrings"],
    jewelryMetals: ["Gold", "Antique Gold", "Copper", "Pewter", "Antique Silver"],
    jewelryStones: ["Amber", "Topaz", "Coral", "Labradorite", "Jade", "Ivory", "Agate", "Onyx", "Jasper"],
  },
  "multi-colored-winter": {
    paletteEffects: ["Silk Road", "Persian Palace", "Byzantine", "Moroccan", "Indian Empress"],
    fabrics: ["Silk Shantung", "Two-tone silk", "Basket weave silk", "Sari", "Fine tweed", "Wool jersey", "Cady", "Boucle", "Lambswool", "Fur", "Linen", "Linen-silk", "Linen-cotton", "Lace", "Fine lace", "Chiffon", "Net lace", "Crushed velvet", "Cut velvet", "Silk velvet", "Denim", "Twill", "Chambray", "Jacquard", "Brocade", "Damask", "Toile", "Leather", "Snakeskin print"],
    prints: ["Chevron", "Prince of Wales", "Tweed", "Trompe l'oeil houses-trees-boats", "Pomegranates", "Grapes-grape leaves", "Orange-lemon trees", "Olive-fig trees", "Cedar", "Cypress", "Myrtle", "Willows", "Branches", "Leaves", "Leopard", "Tropical birds", "Deer", "Tropical florals", "Roses", "Lilies", "Calla lilies", "Paisley", "Tassels", "Ropes", "Braids", "Feathers", "Wings", "Ribbons", "Polka dots", "Waves", "Lines", "Diamonds", "Tile prints", "Tile mosaic", "Chinese script-scroll", "Japanese blue ink paintings", "Fine stripes", "Missoni", "Chinese porcelain", "Enamel"],
    eras: ["Ancient Chinese-Japanese", "Italian-Spanish classical", "1920's-1940's evening", "Persian-Indian", "Flemish"],
    artists: ["Vermeer", "Sargent", "Da Vinci"],
    jewelryStyles: ["Braided gold", "Ropes", "Tassels", "Feather-bird motifs enamel-mosaic", "Pearls", "Mother of pearl", "Pearls with gold clasps", "Enamel flowers-leaves-branches", "Rectangular-tear-oval stones", "Gold filigree", "Layered gold bangles", "Cuffs serpentine", "S-shape earrings-necklaces", "Coiled gold"],
    jewelryMetals: ["Gold", "Platinum", "Silver", "Antique Gold"],
    jewelryStones: ["Diamonds", "Emeralds", "Sapphires", "Coral", "White Coral", "Jade", "Ivory", "Blue Topaz", "Tourmaline", "Aquamarine", "Opal", "Topaz"],
  },
  "ornamental-winter": {
    beautyStatement: "Soft and rich earth tones, deep greens and blues with bright high notes in blue and purple",
    paletteEffects: ["Winter Sunset", "Tapestry Palette", "Antique", "Golden Diadem", "Girl with a Pitcher", "Ornamental Designs"],
    fabrics: ["Silk", "Satin", "Velvet", "Brocade", "Silk weaves", "Chiffon", "Fine Lace", "Wool Jersey", "Cotton-Linen", "Linen", "Cashmere", "Shantung Silk", "Two Toned fabric", "Soft Leather", "Suede", "Polished Cotton"],
    prints: ["Paisley", "Houndstooth", "Fine Check", "Plaid", "Black and White prints", "Abstract oil painting or watercolor prints", "Prints of houses, bridges, trees, branches, water", "Coiled designs", "Swirled seashell designs", "Pitcher, waves and water prints", "Toile with birds and water, leaves and trees", "Animal Prints with Deer, Gazelle, Antelope and Birds", "Narrow Stripe", "Diamond prints", "Small circles, rectangles or oval prints", "Delicate lines or branch prints", "Trompe L'oeil prints", "Watercolor Floral Prints", "Chain and Locket prints", "Rope Prints", "Polka Dots", "Date Palms", "Fig Trees", "Almond Trees", "Roses", "Lilies", "Orchids", "Alliums", "Scabiosa", "Purple Tulips", "White Tulips", "Lavender", "Queen Anne's Lace"],
    eras: ["1800's Italian", "1800's Moroccan", "Ancient Chinese", "Ancient Grecian Design"],
    artists: ["Modigliani", "Da Vinci", "Corot"],
    jewelryStyles: ["Links", "Chains", "Narrow bands", "Multiple strands", "Filigree", "Chinese Lacquer", "Enamel", "Beaded Indian designs", "Delicate Branch earrings", "Leaves", "Branches", "Winter Florals"],
    jewelryMetals: ["Gold", "Silver", "Platinum", "Antique Gold"],
    jewelryStones: ["Diamonds", "Amber", "Topaz", "Emeralds", "Sapphires", "Jade", "Turquoise", "Aventurine"],
  },
  "silk-road-winter": {
    paletteEffects: ["Silk Road Traveler", "Persian Palace", "Chinese Dynasty", "Moroccan Night", "Byzantine Empress"],
    fabrics: ["Silk Shantung", "Brocade", "Damask", "Velvet", "Satin", "Metallic weave", "Sari silk", "Embroidered silk", "Jacquard", "Tapestry", "Fine wool", "Cashmere", "Pashmina"],
    prints: ["Paisley", "Persian designs", "Chinese motifs", "Silk Road patterns", "Ethnic prints", "Tile patterns", "Mosaic", "Pagodas", "Dragons", "Phoenixes", "Peacocks", "Geometric borders"],
    jewelryStyles: ["Layered chains", "Coin necklaces", "Chandelier earrings", "Cuffs", "Statement rings", "Ethnic inspired designs"],
    jewelryMetals: ["Antique Gold", "Gold", "Copper", "Bronze"],
    jewelryStones: ["Jade", "Lapis Lazuli", "Turquoise", "Coral", "Amber", "Emeralds", "Rubies"],
  },
  "tapestry-winter": {
    paletteEffects: ["Italian Renaissance", "Spanish Renaissance", "Antique Chinese design", "Mediterranean Princess", "Biblical Designs", "Mediterranean Seaside and Desert", "Moroccan design"],
    fabrics: ["Silk shantung", "Silk wool blend", "Velvet", "Cut velvet", "Lace", "Jersey", "Cashmere", "Fine knits", "Ribbed knits", "Leather", "Suede", "Satin", "Denim", "Corduroy", "Linen", "Chiffon", "Brocade", "Tapestry", "Black lace with Color underneath or vice versa"],
    prints: ["Missoni Prints", "Cheetah", "Leopard", "Alligator", "Ostrich", "Snakeskin", "Stripes", "Small Checks", "Fine Plaid", "Fine Tweed", "Houndstooth", "Paisley", "Polka Dots", "Geometric prints", "Leaves", "Branches", "Chinese Pagodas", "Jasmine", "Lilies", "Roses", "Anemones", "Orchids", "Coils", "Gold Coins", "Braided Gold", "Sari Prints", "Chinese Watercolor prints", "Blue or Black ink painting on Chiffon", "Delicate feathers", "Ropes and Chain prints"],
    designers: ["Missoni", "Brunello Cuccinelli", "Chloe"],
    artists: ["Modigliani", "Da Vinci"],
    jewelryStyles: ["Gold Coins", "Ropes", "Chains", "Links"],
    jewelryMetals: ["Antique Gold", "Silver", "Platinum", "Bronze"],
    jewelryStones: ["Emeralds", "Diamonds", "Sapphires", "Topaz", "Labradorite", "Agate", "Jade", "Ivory"],
  },
  "winter-rose": {
    paletteEffects: ["Winter Rose Garden", "Snow Queen", "Ice Princess", "Victorian Winter", "Romantic Winter"],
    fabrics: ["Velvet", "Satin", "Fine Lace", "Chiffon", "Silk", "Cashmere", "Fine Wool", "Brocade", "Organza", "Tulle", "Fur"],
    prints: ["Roses", "Victorian florals", "Lace patterns", "Fine stripes", "Delicate geometrics", "Snowflakes", "Ribbons", "Pearls", "Cameos"],
    jewelryStyles: ["Filigree", "Victorian designs", "Delicate chains", "Pearl strands", "Lockets", "Cameos", "Snowflake motifs"],
    jewelryMetals: ["Silver", "White Gold", "Platinum", "Rose Gold"],
    jewelryStones: ["Diamonds", "Sapphires", "Pearls", "Amethyst", "Blue Topaz", "Rose Quartz"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let updatedCount = 0;
    const updates: string[] = [];

    // Get all subtypes from DB
    const { data: subtypes, error: fetchError } = await supabase
      .from("subtypes")
      .select("id, slug, name, description, palette_effect, fabrics_perfect, prints, eras, artists, designers, jewelry_metals, jewelry_stones, jewelry_styles");

    if (fetchError) throw fetchError;

    console.log(`Found ${subtypes?.length || 0} subtypes in database`);
    console.log(`Have data for ${Object.keys(SUBTYPE_DATA).length} subtypes in algorithm`);

    for (const subtype of subtypes || []) {
      // Try matching by slug first, then by name-derived slug
      const nameSlug = subtype.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const localData = SUBTYPE_DATA[subtype.slug] || SUBTYPE_DATA[nameSlug];
      
      if (!localData) {
        continue;
      }

      // Build update object - ALWAYS update fields from local data (overwrite existing)
      const updateData: Record<string, unknown> = {};
      let hasUpdates = false;

      // Description from beautyStatement, or generate from paletteEffects
      if (!subtype.description || subtype.description.trim() === '') {
        if (localData.beautyStatement) {
          updateData.description = localData.beautyStatement;
          hasUpdates = true;
        } else if (localData.paletteEffects?.length) {
          // Generate description from palette effects
          const effectsList = localData.paletteEffects.slice(0, 3).join(', ');
          updateData.description = `A ${subtype.name} palette with effects of ${effectsList}. ${localData.paletteEffects.length > 3 ? `Also includes ${localData.paletteEffects.slice(3).join(', ')}.` : ''}`.trim();
          hasUpdates = true;
        }
      }

      // Palette effect from first paletteEffects - always update if we have data
      if (localData.paletteEffects?.length) {
        updateData.palette_effect = localData.paletteEffects[0];
        hasUpdates = true;
      }

      // Fabrics - always update
      if (localData.fabrics?.length) {
        updateData.fabrics_perfect = localData.fabrics;
        hasUpdates = true;
      }

      // Prints - always update
      if (localData.prints?.length) {
        updateData.prints = localData.prints;
        hasUpdates = true;
      }

      // Eras - always update
      if (localData.eras?.length) {
        updateData.eras = localData.eras;
        hasUpdates = true;
      }

      // Artists - always update
      if (localData.artists?.length) {
        updateData.artists = localData.artists;
        hasUpdates = true;
      }

      // Designers - always update
      if (localData.designers?.length) {
        updateData.designers = localData.designers;
        hasUpdates = true;
      }

      // Jewelry - always update
      if (localData.jewelryMetals?.length) {
        updateData.jewelry_metals = localData.jewelryMetals;
        hasUpdates = true;
      }
      if (localData.jewelryStones?.length) {
        updateData.jewelry_stones = localData.jewelryStones;
        hasUpdates = true;
      }
      if (localData.jewelryStyles?.length) {
        updateData.jewelry_styles = localData.jewelryStyles;
        hasUpdates = true;
      }

      if (hasUpdates) {
        const { error: updateError } = await supabase
          .from("subtypes")
          .update(updateData)
          .eq("id", subtype.id);

        if (updateError) {
          console.error(`Failed to update ${subtype.name}:`, updateError);
        } else {
          updatedCount++;
          updates.push(subtype.name);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated_count: updatedCount,
        updated_subtypes: updates,
        total_algorithm_subtypes: Object.keys(SUBTYPE_DATA).length,
        message: `Updated ${updatedCount} subtypes with descriptions and attributes from the algorithm file`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Populate error:", err);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
