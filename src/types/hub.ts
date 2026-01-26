import type { Subtype } from '@/data/subtypes';

// Hub mode type
export type HubMode = 'photos' | 'paintings';

// Photo types
export type PhotoStatus = 'pending' | 'analyzing' | 'analyzed' | 'confirmed' | 'error';

export interface ExtractedFeatures {
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  contrast: 'low' | 'medium' | 'high';
  eyeColor?: string;
  hairColor?: string;
}

export interface TrainingPhoto {
  id: string;
  file: File;
  preview: string;
  filename: string;
  status: PhotoStatus;
  aiPrediction: Subtype | null;
  aiConfidence: number | null;
  aiAlternatives: Subtype[];
  extractedFeatures: ExtractedFeatures | null;
  confirmedSubtype: Subtype | null;
  notes: string;
  isNewSubtype: boolean;
  uploadedAt: string;
  confirmedAt?: string;
}

// Painting types
export type PaintingStatus = 'pending' | 'analyzing' | 'analyzed' | 'reviewed' | 'error';

export interface PaintingAnalysis {
  title_suggestion?: string;
  artist_detected?: string;
  era_detected?: string;
  palette_effect?: string;
  fabrics?: { primary?: string[]; secondary?: string[] };
  silhouette?: { primary?: string; details?: string[] };
  neckline?: string;
  sleeves?: string;
  colors?: { dominant?: string[]; accent?: string[]; color_mood?: string };
  mood?: { primary?: string; secondary?: string[]; feeling?: string };
  jewelry_accessories?: { types?: string[]; metals?: string[]; style?: string };
  suggested_seasons?: { primary?: string; secondary?: string[]; reasoning?: string };
  best_for?: string[];
  client_talking_points?: string[];
}

export interface HubPainting {
  id: string;
  file?: File;
  preview: string;
  filename: string;
  status: PaintingStatus;
  title: string;
  analysis: PaintingAnalysis | null;
  linkedSubtypes: string[];
  notes: string;
  uploadedAt: string;
  analyzedAt?: string;
  paletteEffect?: string;
  artistDetected?: string;
  eraDetected?: string;
  suggestedSeason?: string;
  // Database fields for persisted paintings
  dbId?: string;
  imageUrl?: string;
}

// Stats types
export interface PhotoStats {
  total: number;
  pending: number;
  analyzed: number;
  confirmed: number;
  correct: number;
  accuracy: string | null;
}

export interface PaintingStats {
  total: number;
  pending: number;
  analyzed: number;
  reviewed: number;
  linked: number;
}

// Settings
export interface HubSettings {
  autoConfidenceThreshold: number;
  reviewThreshold: number;
  newSubtypeThreshold: number;
}
