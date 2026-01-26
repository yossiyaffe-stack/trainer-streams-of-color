export interface PaintingAnalysis {
  title_suggestion?: string;
  artist_detected?: string;
  era_detected?: string;
  fabrics?: {
    primary?: string[];
    secondary?: string[];
    texture_notes?: string;
  };
  silhouette?: {
    primary?: string;
    details?: string[];
    notes?: string;
  };
  neckline?: string;
  sleeves?: string;
  colors?: {
    dominant?: string[];
    accent?: string[];
    color_mood?: string;
    palette_warmth?: string;
  };
  palette_effect?: string;
  prints_patterns?: string[];
  jewelry_accessories?: {
    items?: string[];
    metals?: string[];
    style?: string;
  };
  mood?: {
    primary?: string;
    secondary?: string[];
    feeling?: string;
  };
  suggested_seasons?: {
    primary?: string;
    reasoning?: string;
  };
  best_for?: string[];
  client_talking_points?: string[];
}

export interface Painting {
  id: string;
  image_url: string;
  thumbnail_url?: string | null;
  original_filename?: string | null;
  title: string | null;
  artist: string | null;
  era: string | null;
  year_approximate?: string | null;
  ai_analysis: PaintingAnalysis | null;
  corrections?: Record<string, unknown> | null;
  fabrics: string[] | null;
  silhouette: string | null;
  neckline?: string | null;
  sleeves?: string | null;
  color_mood?: string | null;
  palette_effect: string | null;
  prints_patterns?: string[] | null;
  jewelry_types?: string[] | null;
  mood_primary: string | null;
  mood_secondary?: string[] | null;
  suggested_season: string | null;
  tags?: string[] | null;
  best_for?: string[] | null;
  client_talking_points?: string[] | null;
  notes?: string | null;
  status?: string;
  created_at?: string;
  analyzed_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}