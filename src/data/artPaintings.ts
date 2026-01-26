/**
 * ART PAINTINGS DATABASE
 * Famous paintings matched to body types and color seasons
 * "Your Portrait in the Masters" - Find your artistic twin!
 */

export interface Museum {
  id: string;
  name: string;
  location: string;
  baseUrl: string;
}

export interface Painting {
  title: string;
  artist: string;
  year: string;
  museum: string;
  url: string;
  whyItMatches: string;
  colorSeasonAffinity: string[];
  notableColors: string[];
  bodyType?: string;
  hairDescription?: string;
  faceSwapDifficulty?: "easy" | "medium" | "hard";
  highResUrl?: string;
}

export interface BodyTypeCollection {
  description: string;
  kibbeTypes?: string[];
  paintings: Painting[];
}

export interface SeasonCollection {
  description: string;
  subSeasons: string[];
  paintings: Painting[];
}

// =============================================================================
// MUSEUMS
// =============================================================================

export const MUSEUMS: Record<string, Museum> = {
  met: {
    id: "met",
    name: "The Metropolitan Museum of Art",
    location: "New York, USA",
    baseUrl: "https://www.metmuseum.org/art/collection/search/"
  },
  louvre: {
    id: "louvre",
    name: "Musée du Louvre",
    location: "Paris, France",
    baseUrl: "https://collections.louvre.fr/en/ark:/53355/"
  },
  nationalGalleryLondon: {
    id: "nationalGalleryLondon",
    name: "The National Gallery",
    location: "London, UK",
    baseUrl: "https://www.nationalgallery.org.uk/paintings/"
  },
  uffizi: {
    id: "uffizi",
    name: "Galleria degli Uffizi",
    location: "Florence, Italy",
    baseUrl: "https://www.uffizi.it/en/artworks/"
  },
  prado: {
    id: "prado",
    name: "Museo del Prado",
    location: "Madrid, Spain",
    baseUrl: "https://www.museodelprado.es/en/the-collection/art-work/"
  },
  rijksmuseum: {
    id: "rijksmuseum",
    name: "Rijksmuseum",
    location: "Amsterdam, Netherlands",
    baseUrl: "https://www.rijksmuseum.nl/en/collection/"
  },
  mauritshuis: {
    id: "mauritshuis",
    name: "Mauritshuis",
    location: "The Hague, Netherlands",
    baseUrl: "https://www.mauritshuis.nl/en/our-collection/artworks/"
  },
  ngaWashington: {
    id: "ngaWashington",
    name: "National Gallery of Art",
    location: "Washington DC, USA",
    baseUrl: "https://www.nga.gov/collection/art-object-page."
  }
};

// =============================================================================
// PAINTINGS BY BODY TYPE
// =============================================================================

export const PAINTINGS_BY_BODY_TYPE: Record<string, BodyTypeCollection> = {
  hourglass: {
    description: "Balanced curves, defined waist - celebrated throughout art history",
    paintings: [
      {
        title: "The Birth of Venus",
        artist: "Sandro Botticelli",
        year: "c. 1485",
        museum: "Galleria degli Uffizi",
        url: "https://www.uffizi.it/en/artworks/birth-of-venus",
        whyItMatches: "Venus represents the ideal feminine form with balanced proportions and graceful curves",
        colorSeasonAffinity: ["Spring", "Light Summer"],
        notableColors: ["Soft pink", "Seafoam", "Golden blonde", "Pale blue"],
        faceSwapDifficulty: "medium",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg"
      },
      {
        title: "Grande Odalisque",
        artist: "Jean-Auguste-Dominique Ingres",
        year: "1814",
        museum: "Musée du Louvre",
        url: "https://collections.louvre.fr/en/ark:/53355/cl010062370",
        whyItMatches: "Elongated but curvaceous form celebrating the female silhouette",
        colorSeasonAffinity: ["Soft Autumn", "Soft Summer"],
        notableColors: ["Turquoise", "Gold", "Warm ivory", "Deep blue"]
      },
      {
        title: "Madame X (Madame Pierre Gautreau)",
        artist: "John Singer Sargent",
        year: "1884",
        museum: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/12127",
        whyItMatches: "Elegant hourglass silhouette, dramatic sophistication",
        colorSeasonAffinity: ["Winter", "Deep Winter"],
        notableColors: ["Black", "Porcelain white", "Pink undertones"],
        faceSwapDifficulty: "hard",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Madame_X_%28Madame_Pierre_Gautreau%29%2C_John_Singer_Sargent%2C_1884_%28unfree_frame_crop%29.jpg/800px-Madame_X_%28Madame_Pierre_Gautreau%29%2C_John_Singer_Sargent%2C_1884_%28unfree_frame_crop%29.jpg"
      }
    ]
  },
  softRomanticCurves: {
    description: "Full, soft curves - the Rubenesque ideal",
    kibbeTypes: ["Romantic", "Soft Dramatic", "Soft Natural"],
    paintings: [
      {
        title: "The Three Graces",
        artist: "Peter Paul Rubens",
        year: "c. 1630-1635",
        museum: "Museo del Prado",
        url: "https://www.museodelprado.es/en/the-collection/art-work/the-three-graces/145eadd9-0b54-4b2d-affe-09af370b6932",
        whyItMatches: "Celebration of soft, full feminine curves - the original 'Rubenesque'",
        colorSeasonAffinity: ["Soft Autumn", "Warm Spring"],
        notableColors: ["Peachy flesh tones", "Warm gold", "Rose"]
      },
      {
        title: "Bathsheba at Her Bath",
        artist: "Rembrandt van Rijn",
        year: "1654",
        museum: "Musée du Louvre",
        url: "https://collections.louvre.fr/en/ark:/53355/cl010066427",
        whyItMatches: "Soft, natural female form with warm golden light",
        colorSeasonAffinity: ["Soft Autumn", "Warm Autumn"],
        notableColors: ["Golden light", "Warm flesh", "Rich browns"]
      }
    ]
  },
  slenderElongated: {
    description: "Long, lean lines - elegant and statuesque",
    kibbeTypes: ["Dramatic", "Flamboyant Natural", "Flamboyant Gamine"],
    paintings: [
      {
        title: "Jeanne Hébuterne",
        artist: "Amedeo Modigliani",
        year: "1919",
        museum: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/488903",
        whyItMatches: "Modigliani's signature elongated elegance",
        colorSeasonAffinity: ["Soft Autumn", "True Autumn"],
        notableColors: ["Auburn hair", "Blue eyes", "Muted earth tones"]
      },
      {
        title: "Portrait of Adele Bloch-Bauer I",
        artist: "Gustav Klimt",
        year: "1907",
        museum: "Neue Galerie, New York",
        url: "https://www.neuegalerie.org/collection/artist/klimt",
        whyItMatches: "Slender, elegant figure draped in gold",
        colorSeasonAffinity: ["Warm Autumn", "Deep Autumn"],
        notableColors: ["Gold", "Black", "Copper", "Emerald"],
        faceSwapDifficulty: "easy",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Gustav_Klimt_046.jpg/800px-Gustav_Klimt_046.jpg"
      },
      {
        title: "Symphony in White, No. 1: The White Girl",
        artist: "James Abbott McNeill Whistler",
        year: "1862",
        museum: "National Gallery of Art, Washington",
        url: "https://www.nga.gov/collection/art-object-page.1027.html",
        whyItMatches: "Tall, willowy figure in ethereal white",
        colorSeasonAffinity: ["Light Summer", "Light Spring"],
        notableColors: ["Pure white", "Auburn hair", "Pale complexion"]
      }
    ]
  },
  petiteDelicate: {
    description: "Small-boned, delicate features",
    kibbeTypes: ["Gamine", "Soft Gamine", "Theatrical Romantic"],
    paintings: [
      {
        title: "Girl with a Pearl Earring",
        artist: "Johannes Vermeer",
        year: "c. 1665",
        museum: "Mauritshuis",
        url: "https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/",
        whyItMatches: "Delicate features, youthful charm",
        colorSeasonAffinity: ["True Summer", "Soft Summer"],
        notableColors: ["Blue turban", "Yellow", "Pearl", "Soft skin tones"],
        faceSwapDifficulty: "medium",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg"
      },
      {
        title: "The Lacemaker",
        artist: "Johannes Vermeer",
        year: "c. 1669-1670",
        museum: "Musée du Louvre",
        url: "https://collections.louvre.fr/en/ark:/53355/cl010065949",
        whyItMatches: "Small, concentrated figure with delicate hands",
        colorSeasonAffinity: ["Soft Autumn", "Warm Autumn"],
        notableColors: ["Yellow bodice", "Blue cushion", "White lace"],
        faceSwapDifficulty: "hard",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg/800px-Johannes_Vermeer_-_The_lacemaker_%28c.1669-1671%29.jpg"
      }
    ]
  },
  athleticNatural: {
    description: "Strong, healthy, natural beauty",
    kibbeTypes: ["Natural", "Soft Natural", "Flamboyant Natural"],
    paintings: [
      {
        title: "Diana and Her Companions",
        artist: "Johannes Vermeer",
        year: "c. 1653-1654",
        museum: "Mauritshuis",
        url: "https://www.mauritshuis.nl/en/our-collection/artworks/406-diana-and-her-companions/",
        whyItMatches: "Goddess Diana represents athletic, natural feminine strength",
        colorSeasonAffinity: ["Soft Autumn", "Soft Summer"],
        notableColors: ["Earthy tones", "Yellow", "Deep blue", "Natural skin"]
      },
      {
        title: "Atalanta and Hippomenes",
        artist: "Guido Reni",
        year: "c. 1618-1619",
        museum: "Museo del Prado",
        url: "https://www.museodelprado.es/en/the-collection/art-work/atalanta-and-hippomenes/42108a05-ac51-4a2b-b12d-7f3bc7e92e1e",
        whyItMatches: "Athletic female form in motion - the runner Atalanta",
        colorSeasonAffinity: ["Soft Summer", "Cool Summer"],
        notableColors: ["Pale flesh", "Flowing fabric", "Dramatic sky"]
      }
    ]
  }
};

// =============================================================================
// PAINTINGS BY COLOR SEASON
// =============================================================================

export const PAINTINGS_BY_SEASON: Record<string, SeasonCollection> = {
  spring: {
    description: "Warm, clear, bright colors - golden undertones",
    subSeasons: ["Light Spring", "Warm Spring", "Clear Spring"],
    paintings: [
      {
        title: "The Birth of Venus",
        artist: "Sandro Botticelli",
        year: "c. 1485",
        museum: "Galleria degli Uffizi",
        url: "https://www.uffizi.it/en/artworks/birth-of-venus",
        whyItMatches: "Light, warm colors with golden hair and peachy skin",
        colorSeasonAffinity: ["Light Spring", "Clear Spring"],
        notableColors: ["Soft coral", "Seafoam green", "Golden blonde", "Warm ivory"]
      },
      {
        title: "Primavera",
        artist: "Sandro Botticelli",
        year: "c. 1477-1482",
        museum: "Galleria degli Uffizi",
        url: "https://www.uffizi.it/en/artworks/primavera-702d9ba0-f7b9-407b-bd9a-3364bc868d5a",
        whyItMatches: "Spring itself! Warm florals, fresh greens, peachy tones",
        colorSeasonAffinity: ["Warm Spring", "Light Spring"],
        notableColors: ["Orange", "Coral", "Fresh green", "Golden"]
      },
      {
        title: "Woman with a Parasol",
        artist: "Claude Monet",
        year: "1875",
        museum: "National Gallery of Art, Washington",
        url: "https://www.nga.gov/collection/art-object-page.61379.html",
        whyItMatches: "Light, bright, airy colors with warm undertones",
        colorSeasonAffinity: ["Light Spring", "Clear Spring"],
        notableColors: ["Sky blue", "Warm white", "Spring green", "Golden light"]
      },
      {
        title: "The Swing",
        artist: "Jean-Honoré Fragonard",
        year: "1767",
        museum: "Wallace Collection, London",
        url: "https://wallacelive.wallacecollection.org/eMP/eMuseumPlus?service=ExternalInterface&module=collection&objectId=65364",
        whyItMatches: "Playful, warm pink dress, fresh garden setting",
        colorSeasonAffinity: ["Light Spring", "Warm Spring"],
        notableColors: ["Coral pink", "Mint green", "Cream", "Warm rose"]
      }
    ]
  },
  summer: {
    description: "Cool, soft, muted colors - rose or blue undertones",
    subSeasons: ["Light Summer", "True Summer", "Soft Summer"],
    paintings: [
      {
        title: "Girl with a Pearl Earring",
        artist: "Johannes Vermeer",
        year: "c. 1665",
        museum: "Mauritshuis",
        url: "https://www.mauritshuis.nl/en/our-collection/artworks/670-girl-with-a-pearl-earring/",
        whyItMatches: "Soft blue turban, muted background, cool skin tones",
        colorSeasonAffinity: ["True Summer", "Soft Summer"],
        notableColors: ["Soft blue", "Dusty yellow", "Cool pearl", "Muted brown"]
      },
      {
        title: "Young Woman with a Water Pitcher",
        artist: "Johannes Vermeer",
        year: "c. 1662",
        museum: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/437881",
        whyItMatches: "Soft, cool light; muted blue and white palette",
        colorSeasonAffinity: ["Light Summer", "True Summer"],
        notableColors: ["Soft blue", "Cool white", "Muted gold", "Dusty rose"]
      },
      {
        title: "The Lacemaker",
        artist: "Johannes Vermeer",
        year: "c. 1669-1670",
        museum: "Musée du Louvre",
        url: "https://collections.louvre.fr/en/ark:/53355/cl010065949",
        whyItMatches: "Soft, muted colors with cool undertones",
        colorSeasonAffinity: ["Soft Summer", "True Summer"],
        notableColors: ["Soft yellow", "Dusty blue", "Cool white", "Muted red"]
      },
      {
        title: "Madame Moitessier",
        artist: "Jean-Auguste-Dominique Ingres",
        year: "1856",
        museum: "National Gallery, London",
        url: "https://www.nationalgallery.org.uk/paintings/jean-auguste-dominique-ingres-madame-moitessier",
        whyItMatches: "Soft rose, cool jewelry, muted elegance",
        colorSeasonAffinity: ["Soft Summer", "Cool Summer"],
        notableColors: ["Soft rose", "Gold", "Cool black", "Pearl"]
      }
    ]
  },
  autumn: {
    description: "Warm, rich, muted colors - golden undertones",
    subSeasons: ["Soft Autumn", "Warm Autumn", "Deep Autumn"],
    paintings: [
      {
        title: "Portrait of Adele Bloch-Bauer I",
        artist: "Gustav Klimt",
        year: "1907",
        museum: "Neue Galerie, New York",
        url: "https://www.neuegalerie.org/collection/artist/klimt",
        whyItMatches: "Rich golds, deep browns, warm metallic tones",
        colorSeasonAffinity: ["Warm Autumn", "Deep Autumn"],
        notableColors: ["Gold", "Bronze", "Deep brown", "Copper", "Forest green"]
      },
      {
        title: "Lady with an Ermine",
        artist: "Leonardo da Vinci",
        year: "c. 1489-1490",
        museum: "Czartoryski Museum, Krakow",
        url: "https://mnk.pl/branch/the-czartoryski-museum",
        whyItMatches: "Rich, warm tones with deep blue and golden highlights",
        colorSeasonAffinity: ["Deep Autumn", "Warm Autumn"],
        notableColors: ["Deep blue", "Gold necklace", "Warm brown hair", "Ivory skin"],
        faceSwapDifficulty: "medium",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg/800px-Lady_with_an_Ermine_-_Leonardo_da_Vinci_-_Google_Art_Project.jpg"
      },
      {
        title: "The Milkmaid",
        artist: "Johannes Vermeer",
        year: "c. 1658-1660",
        museum: "Rijksmuseum",
        url: "https://www.rijksmuseum.nl/en/collection/SK-A-2344",
        whyItMatches: "Warm yellows, rich blues, earthy bread tones",
        colorSeasonAffinity: ["Warm Autumn", "True Autumn"],
        notableColors: ["Ochre yellow", "Deep blue", "Warm brown", "Cream"],
        faceSwapDifficulty: "medium",
        highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/800px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg"
      },
      {
        title: "Flaming June",
        artist: "Frederic Leighton",
        year: "1895",
        museum: "Museo de Arte de Ponce, Puerto Rico",
        url: "https://www.museoarteponce.org/",
        whyItMatches: "Rich, warm orange against deep blue sea",
        colorSeasonAffinity: ["Warm Autumn", "Deep Autumn"],
        notableColors: ["Burnt orange", "Deep teal", "Warm gold", "Rich amber"]
      },
      {
        title: "Portrait of Hendrickje Stoffels",
        artist: "Rembrandt van Rijn",
        year: "c. 1654-1656",
        museum: "National Gallery, London",
        url: "https://www.nationalgallery.org.uk/paintings/rembrandt-portrait-of-hendrickje-stoffels",
        whyItMatches: "Deep red velvet, golden skin, warm brown background",
        colorSeasonAffinity: ["Soft Autumn", "Warm Autumn"],
        notableColors: ["Deep burgundy", "Gold", "Warm brown", "Rich amber"]
      }
    ]
  },
  winter: {
    description: "Cool, clear, bright or deep colors - blue undertones",
    subSeasons: ["Deep Winter", "True Winter", "Clear Winter"],
    paintings: [
      {
        title: "Madame X (Madame Pierre Gautreau)",
        artist: "John Singer Sargent",
        year: "1884",
        museum: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/12127",
        whyItMatches: "Dramatic black against porcelain white skin - high contrast",
        colorSeasonAffinity: ["Deep Winter", "Clear Winter"],
        notableColors: ["Pure black", "Porcelain white", "Cool pink undertones"]
      },
      {
        title: "Symphony in White",
        artist: "James Abbott McNeill Whistler",
        year: "1862",
        museum: "National Gallery of Art, Washington",
        url: "https://www.nga.gov/collection/art-object-page.1027.html",
        whyItMatches: "Pure white, cool undertones, dramatic contrast with hair",
        colorSeasonAffinity: ["Clear Winter", "True Winter"],
        notableColors: ["Pure white", "Auburn", "Cool gray", "Pale pink"]
      },
      {
        title: "Portrait of Giovanna Tornabuoni",
        artist: "Domenico Ghirlandaio",
        year: "1490",
        museum: "Museo Thyssen-Bornemisza, Madrid",
        url: "https://www.museothyssen.org/en/collection/artists/ghirlandaio-domenico/portrait-giovanna-tornabuoni",
        whyItMatches: "Cool red against pale skin, clear jewel tones",
        colorSeasonAffinity: ["Clear Winter", "True Winter"],
        notableColors: ["Ruby red", "Gold", "Cool white", "Clear blue"]
      }
    ]
  }
};

// =============================================================================
// PAINTINGS BY HAIR COLOR
// =============================================================================

export const PAINTINGS_BY_HAIR_COLOR: Record<string, Painting[]> = {
  blonde: [
    {
      title: "The Birth of Venus",
      artist: "Sandro Botticelli",
      year: "c. 1485",
      museum: "Galleria degli Uffizi",
      url: "https://www.uffizi.it/en/artworks/birth-of-venus",
      whyItMatches: "Long, flowing golden blonde hair",
      colorSeasonAffinity: ["Spring", "Light Summer"],
      notableColors: ["Golden blonde", "Seafoam", "Soft pink"],
      hairDescription: "Long, flowing golden blonde"
    }
  ],
  brunette: [
    {
      title: "Mona Lisa",
      artist: "Leonardo da Vinci",
      year: "c. 1503-1519",
      museum: "Musée du Louvre",
      url: "https://collections.louvre.fr/en/ark:/53355/cl010062370",
      whyItMatches: "Dark brown hair with enigmatic beauty",
      colorSeasonAffinity: ["Soft Autumn", "Deep Autumn"],
      notableColors: ["Deep brown", "Earth tones", "Olive"],
      hairDescription: "Dark brown, parted center",
      faceSwapDifficulty: "easy",
      highResUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg"
    },
    {
      title: "Madame X",
      artist: "John Singer Sargent",
      year: "1884",
      museum: "The Metropolitan Museum of Art",
      url: "https://www.metmuseum.org/art/collection/search/12127",
      whyItMatches: "Dark hair swept up elegantly",
      colorSeasonAffinity: ["Deep Winter", "Clear Winter"],
      notableColors: ["Black", "Porcelain white"],
      hairDescription: "Dark, swept up elegantly"
    }
  ],
  redAuburn: [
    {
      title: "Jeanne Hébuterne",
      artist: "Amedeo Modigliani",
      year: "1919",
      museum: "The Metropolitan Museum of Art",
      url: "https://www.metmuseum.org/art/collection/search/488903",
      whyItMatches: "Auburn, warm chestnut hair",
      colorSeasonAffinity: ["Soft Autumn", "True Autumn"],
      notableColors: ["Auburn", "Blue eyes", "Earth tones"],
      hairDescription: "Auburn, warm chestnut"
    },
    {
      title: "Lady Lilith",
      artist: "Dante Gabriel Rossetti",
      year: "1866-1868",
      museum: "Delaware Art Museum",
      url: "https://www.delawareart.org/",
      whyItMatches: "Flowing red-gold hair",
      colorSeasonAffinity: ["Autumn"],
      notableColors: ["Red-gold", "White", "Roses"],
      hairDescription: "Flowing red-gold"
    }
  ],
  black: [
    {
      title: "Portrait of Giovanna Tornabuoni",
      artist: "Domenico Ghirlandaio",
      year: "1490",
      museum: "Museo Thyssen-Bornemisza",
      url: "https://www.museothyssen.org/en/collection/artists/ghirlandaio-domenico/portrait-giovanna-tornabuoni",
      whyItMatches: "Deep black hair, elegantly styled",
      colorSeasonAffinity: ["Clear Winter", "True Winter"],
      notableColors: ["Black hair", "Ruby red", "Gold"],
      hairDescription: "Deep black, elegantly styled"
    }
  ]
};

// =============================================================================
// CURATED COLLECTIONS
// =============================================================================

export interface CuratedCollection {
  title: string;
  description: string;
  paintings: string[];
}

export const CURATED_COLLECTIONS: Record<string, CuratedCollection> = {
  elegantSophistication: {
    title: "Elegant Sophistication",
    description: "For the refined, classic beauty",
    paintings: [
      "Madame X - Sargent",
      "Portrait of Giovanna Tornabuoni - Ghirlandaio",
      "Madame Moitessier - Ingres",
      "Portrait of a Lady - van der Weyden"
    ]
  },
  romanticSoftness: {
    title: "Romantic Softness",
    description: "For soft, feminine, romantic types",
    paintings: [
      "The Birth of Venus - Botticelli",
      "The Three Graces - Rubens",
      "Girl with a Pearl Earring - Vermeer",
      "The Swing - Fragonard"
    ]
  },
  dramaticPower: {
    title: "Dramatic Power",
    description: "For bold, striking presences",
    paintings: [
      "Madame X - Sargent",
      "Portrait of Adele Bloch-Bauer I - Klimt",
      "Liberty Leading the People - Delacroix",
      "Judith Beheading Holofernes - Artemisia Gentileschi"
    ]
  },
  naturalWarmth: {
    title: "Natural Warmth",
    description: "For approachable, natural beauty",
    paintings: [
      "The Milkmaid - Vermeer",
      "Woman with a Parasol - Monet",
      "Portrait of Hendrickje Stoffels - Rembrandt",
      "The Lacemaker - Vermeer"
    ]
  },
  youthfulCharm: {
    title: "Youthful Charm",
    description: "For playful, gamine types",
    paintings: [
      "Girl with a Pearl Earring - Vermeer",
      "The Swing - Fragonard",
      "Young Woman with a Water Pitcher - Vermeer",
      "The Lacemaker - Vermeer"
    ]
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getPaintingsForSeason(season: string): Painting[] {
  const seasonKey = season.toLowerCase();
  return PAINTINGS_BY_SEASON[seasonKey]?.paintings || [];
}

export function getPaintingsForBodyType(bodyType: string): Painting[] {
  return PAINTINGS_BY_BODY_TYPE[bodyType]?.paintings || [];
}

export function getAllPaintings(): Painting[] {
  const allPaintings: Painting[] = [];
  
  Object.values(PAINTINGS_BY_BODY_TYPE).forEach(collection => {
    allPaintings.push(...collection.paintings);
  });
  
  // Remove duplicates by title
  const seen = new Set<string>();
  return allPaintings.filter(painting => {
    if (seen.has(painting.title)) return false;
    seen.add(painting.title);
    return true;
  });
}

export function searchPaintings(query: string): Painting[] {
  const normalizedQuery = query.toLowerCase();
  return getAllPaintings().filter(painting => 
    painting.title.toLowerCase().includes(normalizedQuery) ||
    painting.artist.toLowerCase().includes(normalizedQuery) ||
    painting.colorSeasonAffinity.some(s => s.toLowerCase().includes(normalizedQuery))
  );
}
