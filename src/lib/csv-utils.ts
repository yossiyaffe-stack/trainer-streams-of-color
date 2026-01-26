/**
 * CSV Import/Export Utilities for Streams of Color Training
 */

import { Subtype } from '@/data/subtypes';
import { BulkPhoto } from '@/types/training';

function getDateStamp(): string {
  return new Date().toISOString().split('T')[0];
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCSV(str: string): string {
  if (!str) return '';
  return str.replace(/"/g, '""');
}

/**
 * Export analyzed photos to CSV for offline review
 */
export function exportToCSV(photos: BulkPhoto[], filename = 'training-data'): void {
  const headers = [
    'ID',
    'Filename',
    'Status',
    'AI_Prediction',
    'AI_Prediction_ID',
    'AI_Confidence',
    'Alternative_1',
    'Alternative_2',
    'Confirmed_Subtype',
    'Confirmed_Subtype_ID',
    'Was_Correct',
    'Undertone',
    'Depth',
    'Contrast',
    'Eye_Color',
    'Hair_Color',
    'Notes',
    'Is_New_Subtype',
    'Uploaded_At'
  ];

  const rows = photos.map(p => [
    p.id,
    p.filename || '',
    p.status || '',
    p.aiPrediction?.name || '',
    p.aiPrediction?.id || '',
    String(p.aiConfidence || ''),
    p.aiAlternatives?.[0]?.name || '',
    p.aiAlternatives?.[1]?.name || '',
    p.confirmedSubtype?.name || '',
    p.confirmedSubtype?.id || '',
    p.confirmedSubtype ? (p.confirmedSubtype.id === p.aiPrediction?.id ? 'Yes' : 'No') : '',
    p.extractedFeatures?.undertone || '',
    p.extractedFeatures?.depth || '',
    p.extractedFeatures?.contrast || '',
    p.extractedFeatures?.eyeColor || '',
    p.extractedFeatures?.hairColor || '',
    escapeCSV(p.notes || ''),
    p.isNewSubtype ? 'Yes' : 'No',
    p.uploadedAt || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => 
      typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
        ? `"${cell.replace(/"/g, '""')}"`
        : cell
    ).join(','))
  ].join('\n');

  downloadFile(csv, `${filename}-${getDateStamp()}.csv`, 'text/csv');
}

/**
 * Export to Excel-compatible format (Tab-separated for easy paste)
 */
export function exportToTSV(photos: BulkPhoto[], filename = 'training-data'): void {
  const headers = [
    'Photo ID',
    'AI Says',
    'Confidence',
    'YOUR CORRECTION (leave blank if correct)',
    'Notes'
  ];

  const rows = photos
    .filter(p => p.status === 'analyzed' || p.status === 'confirmed')
    .map(p => [
      p.id,
      p.aiPrediction?.name || '',
      `${p.aiConfidence}%`,
      p.confirmedSubtype?.name || '',
      p.notes || ''
    ]);

  const tsv = [
    headers.join('\t'),
    ...rows.map(row => row.join('\t'))
  ].join('\n');

  downloadFile(tsv, `${filename}-${getDateStamp()}.tsv`, 'text/tab-separated-values');
}

/**
 * Export subtype reference list
 */
export function exportSubtypeList(subtypes: Subtype[]): void {
  const headers = ['ID', 'Name', 'Season'];
  const rows = subtypes.map(s => [s.id, s.name, s.season]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csv, `subtype-reference-${getDateStamp()}.csv`, 'text/csv');
}

/**
 * Parse a single CSV line (handling quoted values)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

/**
 * Find column index by possible names
 */
function findColumn(headers: string[], possibleNames: string[]): number {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  for (const name of possibleNames) {
    const idx = lowerHeaders.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

export interface CSVCorrection {
  photoId: string;
  correctedSubtypeName: string;
  notes: string;
}

export interface ImportResult {
  applied: number;
  notFound: string[];
  invalidSubtype: Array<{ photoId: string; attempted: string }>;
  error?: string;
}

/**
 * Parse CSV file and return corrections
 */
export function parseCSVCorrections(csvText: string): CSVCorrection[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const idCol = findColumn(headers, ['id', 'photo_id', 'photo id']);
  const correctionCol = findColumn(headers, ['correction', 'confirmed', 'your correction', 'confirmed_subtype']);
  const notesCol = findColumn(headers, ['notes', 'note', 'comments']);

  if (idCol === -1) {
    throw new Error('Could not find ID column. Please include a column named "ID" or "Photo ID"');
  }

  const corrections: CSVCorrection[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const id = values[idCol]?.trim();
    const correction = correctionCol !== -1 ? values[correctionCol]?.trim() : '';
    const notes = notesCol !== -1 ? values[notesCol]?.trim() : '';

    if (id && correction) {
      corrections.push({
        photoId: id,
        correctedSubtypeName: correction,
        notes: notes
      });
    }
  }

  return corrections;
}

/**
 * Apply corrections from parsed CSV
 */
export function applyCorrections(
  photos: BulkPhoto[],
  corrections: CSVCorrection[],
  subtypes: Subtype[]
): ImportResult {
  const subtypeMap = new Map(subtypes.map(s => [s.name.toLowerCase(), s]));
  const results: ImportResult = { applied: 0, notFound: [], invalidSubtype: [] };
  
  const photoMap = new Map(photos.map(p => [p.id, p]));
  
  corrections.forEach(correction => {
    const photo = photoMap.get(correction.photoId);
    if (!photo) {
      results.notFound.push(correction.photoId);
      return;
    }
    
    const subtype = subtypeMap.get(correction.correctedSubtypeName.toLowerCase());
    if (!subtype) {
      results.invalidSubtype.push({
        photoId: correction.photoId,
        attempted: correction.correctedSubtypeName
      });
      return;
    }
    
    photo.confirmedSubtype = subtype;
    photo.notes = correction.notes || photo.notes;
    photo.status = 'confirmed';
    results.applied++;
  });
  
  return results;
}
