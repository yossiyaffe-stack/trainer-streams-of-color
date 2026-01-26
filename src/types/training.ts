import { Subtype } from '@/data/subtypes';

export type PhotoStatus = 'pending' | 'analyzing' | 'analyzed' | 'confirmed' | 'error';

export interface ExtractedFeatures {
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  contrast: 'low' | 'medium' | 'high';
  eyeColor?: string;
  hairColor?: string;
}

export interface BulkPhoto {
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
}

export interface BulkTrainingStats {
  total: number;
  pending: number;
  analyzed: number;
  confirmed: number;
  correct: number;
  wrong: number;
  newSubtype: number;
}

export type FilterType = 'all' | 'pending' | 'correct' | 'wrong' | 'new-subtype';
export type SortType = 'confidence' | 'date' | 'season';
