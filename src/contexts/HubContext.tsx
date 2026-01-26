import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import type { Subtype } from '@/data/subtypes';
import { ALL_SUBTYPES } from '@/data/subtypes';
import type { 
  HubMode, 
  TrainingPhoto, 
  HubPainting, 
  PhotoStats, 
  PaintingStats, 
  HubSettings 
} from '@/types/hub';

const SELECTED_PHOTOS_KEY = 'hub-selected-photos';

interface HubContextValue {
  // Mode
  mode: HubMode;
  setMode: (mode: HubMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Shared
  subtypes: Subtype[];
  settings: HubSettings;
  setSettings: (settings: HubSettings) => void;

  // Photos
  photos: TrainingPhoto[];
  photoStats: PhotoStats;
  photoAnalyzing: boolean;
  photoProgress: { current: number; total: number };
  addPhotos: (files: File[]) => number;
  analyzePhotos: (ids?: string[]) => Promise<void>;
  confirmPhoto: (id: string, subtypeId: string, notes?: string) => void;
  confirmPhotoCorrect: (id: string) => void;
  setPhotos: React.Dispatch<React.SetStateAction<TrainingPhoto[]>>;

  // Paintings
  paintings: HubPainting[];
  paintingStats: PaintingStats;
  paintingAnalyzing: boolean;
  paintingProgress: { current: number; total: number };
  addPaintings: (files: File[]) => number;
  setPaintings: React.Dispatch<React.SetStateAction<HubPainting[]>>;
  updatePainting: (id: string, updates: Partial<HubPainting>) => void;
  togglePaintingSubtype: (paintingId: string, subtypeId: string) => void;
  deletePaintings: (ids: string[]) => void;
  deletePhotos: (ids: string[]) => void;

  // Photo selection (persisted)
  selectedPhotoIds: Set<string>;
  togglePhotoSelection: (id: string) => void;
  selectAllPhotos: (ids: string[]) => void;
  clearPhotoSelection: () => void;
  isPhotoSelected: (id: string) => boolean;
}
const HubContext = createContext<HubContextValue | null>(null);

export function useHub() {
  const context = useContext(HubContext);
  if (!context) throw new Error('useHub must be used within HubProvider');
  return context;
}

export function HubProvider({ children }: { children: ReactNode }) {
  // Mode state
  const [mode, setMode] = useState<HubMode>('photos');
  const [activeTab, setActiveTab] = useState('upload');

  // Subtypes - use all from data file
  const subtypes = ALL_SUBTYPES;

  // Settings
  const [settings, setSettings] = useState<HubSettings>({
    autoConfidenceThreshold: 85,
    reviewThreshold: 60,
    newSubtypeThreshold: 40,
  });

  // Photo state
  const [photos, setPhotos] = useState<TrainingPhoto[]>([]);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoProgress, setPhotoProgress] = useState({ current: 0, total: 0 });

  // Photo selection - persisted in localStorage
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(SELECTED_PHOTOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // Ignore parse errors
    }
    return new Set();
  });

  // Persist selections to localStorage
  useEffect(() => {
    localStorage.setItem(SELECTED_PHOTOS_KEY, JSON.stringify([...selectedPhotoIds]));
  }, [selectedPhotoIds]);

  // Painting state  
  const [paintings, setPaintings] = useState<HubPainting[]>([]);
  const [paintingAnalyzing] = useState(false);
  const [paintingProgress] = useState({ current: 0, total: 0 });

  // Computed photo stats
  const photoStats = useMemo<PhotoStats>(() => {
    const pending = photos.filter(p => p.status === 'pending').length;
    const analyzed = photos.filter(p => p.status === 'analyzed').length;
    const confirmed = photos.filter(p => p.status === 'confirmed').length;
    const correct = photos.filter(p => 
      p.status === 'confirmed' && p.confirmedSubtype?.id === p.aiPrediction?.id
    ).length;
    return {
      total: photos.length,
      pending,
      analyzed,
      confirmed,
      correct,
      accuracy: confirmed > 0 ? ((correct / confirmed) * 100).toFixed(1) : null
    };
  }, [photos]);

  // Computed painting stats
  const paintingStats = useMemo<PaintingStats>(() => {
    const pending = paintings.filter(p => p.status === 'pending').length;
    const analyzed = paintings.filter(p => p.status === 'analyzed').length;
    const reviewed = paintings.filter(p => p.status === 'reviewed').length;
    const linked = paintings.filter(p => p.linkedSubtypes?.length > 0).length;
    return { total: paintings.length, pending, analyzed, reviewed, linked };
  }, [paintings]);

  // Photo operations
  const addPhotos = useCallback((files: File[]) => {
    const newPhotos: TrainingPhoto[] = files.map((file, i) => ({
      id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending',
      aiPrediction: null,
      aiConfidence: null,
      aiAlternatives: [],
      extractedFeatures: null,
      confirmedSubtype: null,
      notes: '',
      isNewSubtype: false,
      uploadedAt: new Date().toISOString()
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    return newPhotos.length;
  }, []);

  const analyzePhotos = useCallback(async (ids?: string[]) => {
    const toAnalyze = ids 
      ? photos.filter(p => ids.includes(p.id))
      : photos.filter(p => p.status === 'pending');
    
    if (toAnalyze.length === 0) return;
    setPhotoAnalyzing(true);
    setPhotoProgress({ current: 0, total: toAnalyze.length });

    for (let i = 0; i < toAnalyze.length; i++) {
      const photo = toAnalyze[i];
      setPhotoProgress({ current: i + 1, total: toAnalyze.length });
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'analyzing' } : p));

      try {
        // Mock analysis - in production this would call an AI endpoint
        await new Promise(r => setTimeout(r, 300 + Math.random() * 400));
        const randomSubtype = subtypes[Math.floor(Math.random() * subtypes.length)];
        const confidence = Math.floor(45 + Math.random() * 50);
        
        setPhotos(prev => prev.map(p => p.id === photo.id ? {
          ...p,
          status: 'analyzed',
          aiPrediction: randomSubtype,
          aiConfidence: confidence,
          aiAlternatives: [subtypes[Math.floor(Math.random() * subtypes.length)]],
          extractedFeatures: {
            undertone: ['warm', 'cool', 'neutral'][Math.floor(Math.random() * 3)] as 'warm' | 'cool' | 'neutral',
            depth: ['light', 'medium', 'deep'][Math.floor(Math.random() * 3)] as 'light' | 'medium' | 'deep',
            contrast: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
          },
          isNewSubtype: confidence < settings.newSubtypeThreshold
        } : p));
      } catch {
        setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: 'error' } : p));
      }
    }
    setPhotoAnalyzing(false);
  }, [photos, subtypes, settings.newSubtypeThreshold]);

  const confirmPhoto = useCallback((id: string, subtypeId: string, notes = '') => {
    const subtype = subtypes.find(s => s.id === subtypeId);
    if (!subtype) return;
    setPhotos(prev => prev.map(p => p.id === id ? {
      ...p, 
      status: 'confirmed', 
      confirmedSubtype: subtype, 
      confirmedAt: new Date().toISOString(), 
      notes: notes || p.notes
    } : p));
  }, [subtypes]);

  const confirmPhotoCorrect = useCallback((id: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? {
      ...p, 
      status: 'confirmed', 
      confirmedSubtype: p.aiPrediction,
      confirmedAt: new Date().toISOString()
    } : p));
  }, []);

  // Painting operations
  const addPaintings = useCallback((files: File[]) => {
    const newPaintings: HubPainting[] = files.map((file, i) => ({
      id: `painting-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      filename: file.name,
      status: 'pending',
      title: '',
      analysis: null,
      linkedSubtypes: [],
      notes: '',
      uploadedAt: new Date().toISOString()
    }));
    setPaintings(prev => [...prev, ...newPaintings]);
    return newPaintings.length;
  }, []);

  const updatePainting = useCallback((id: string, updates: Partial<HubPainting>) => {
    setPaintings(prev => prev.map(p => p.id === id ? { ...p, ...updates, status: 'reviewed' } : p));
  }, []);

  const togglePaintingSubtype = useCallback((paintingId: string, subtypeId: string) => {
    setPaintings(prev => prev.map(p => {
      if (p.id !== paintingId) return p;
      const linked = p.linkedSubtypes || [];
      return {
        ...p,
        linkedSubtypes: linked.includes(subtypeId) 
          ? linked.filter(id => id !== subtypeId)
          : [...linked, subtypeId]
      };
    }));
  }, []);

  const deletePaintings = useCallback((ids: string[]) => {
    setPaintings(prev => prev.filter(p => !ids.includes(p.id)));
  }, []);

  const deletePhotos = useCallback((ids: string[]) => {
    setPhotos(prev => prev.filter(p => !ids.includes(p.id)));
    // Also remove deleted photos from selection
    setSelectedPhotoIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  // Photo selection operations
  const togglePhotoSelection = useCallback((id: string) => {
    setSelectedPhotoIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllPhotos = useCallback((ids: string[]) => {
    setSelectedPhotoIds(new Set(ids));
  }, []);

  const clearPhotoSelection = useCallback(() => {
    setSelectedPhotoIds(new Set());
  }, []);

  const isPhotoSelected = useCallback((id: string) => {
    return selectedPhotoIds.has(id);
  }, [selectedPhotoIds]);

  const value: HubContextValue = {
    mode, setMode,
    activeTab, setActiveTab,
    subtypes,
    settings, setSettings,
    photos, photoStats, photoAnalyzing, photoProgress,
    addPhotos, analyzePhotos, confirmPhoto, confirmPhotoCorrect, setPhotos,
    deletePhotos,
    paintings, paintingStats, paintingAnalyzing, paintingProgress,
    addPaintings, setPaintings, updatePainting, togglePaintingSubtype,
    deletePaintings,
    selectedPhotoIds, togglePhotoSelection, selectAllPhotos, clearPhotoSelection, isPhotoSelected
  };

  return (
    <HubContext.Provider value={value}>
      {children}
    </HubContext.Provider>
  );
}
