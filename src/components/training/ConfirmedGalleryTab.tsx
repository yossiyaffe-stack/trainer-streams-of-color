import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, Search, Filter, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FaceDetailModal } from './FaceDetailModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ConfirmedFace {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  confirmed_season: string | null;
  confirmed_subtype: string | null;
  label_status: string | null;
  ai_confidence: number | null;
  skin_hex: string | null;
  eye_hex: string | null;
  hair_hex: string | null;
  undertone: string | null;
  depth: string | null;
  contrast_level: string | null;
}

// Proper season order - defined outside component
const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

export function ConfirmedGalleryTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedFace, setSelectedFace] = useState<ConfirmedFace | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set(SEASON_ORDER));
  const [expandedSubtypes, setExpandedSubtypes] = useState<Set<string>>(new Set());

  // Fetch confirmed faces (expert_verified or nechama_verified)
  const { data: confirmedFaces = [], isLoading, refetch } = useQuery({
    queryKey: ['confirmed-faces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_training_data')
        .select('*')
        .in('label_status', ['expert_verified', 'nechama_verified'])
        .order('confirmed_season', { ascending: true });

      if (error) throw error;
      return (data || []) as ConfirmedFace[];
    },
  });

  // Group by season and subtype
  const groupedFaces = useMemo(() => {
    const groups: Record<string, Record<string, ConfirmedFace[]>> = {};
    
    confirmedFaces
      .filter(face => 
        !searchTerm || 
        face.confirmed_subtype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        face.confirmed_season?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .forEach(face => {
        const season = face.confirmed_season?.toLowerCase() || 'unassigned';
        const subtype = face.confirmed_subtype || 'unassigned';
        
        if (!groups[season]) groups[season] = {};
        if (!groups[season][subtype]) groups[season][subtype] = [];
        groups[season][subtype].push(face);
      });
    
    return groups;
  }, [confirmedFaces, searchTerm]);

  // Sort seasons in proper order
  const sortedSeasons = useMemo(() => {
    return Object.keys(groupedFaces).sort((a, b) => {
      const aIndex = SEASON_ORDER.indexOf(a.toLowerCase());
      const bIndex = SEASON_ORDER.indexOf(b.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [groupedFaces]);

  const totalFiltered = useMemo(() => {
    return Object.values(groupedFaces).reduce((sum, subtypes) => 
      sum + Object.values(subtypes).reduce((s, faces) => s + faces.length, 0), 0
    );
  }, [groupedFaces]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllInSubtype = (faces: ConfirmedFace[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      faces.forEach(f => next.add(f.id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      // Delete color_labels first
      const { error: labelError } = await supabase
        .from('color_labels')
        .delete()
        .in('face_image_id', Array.from(selectedIds));

      if (labelError) throw labelError;

      // Then delete face_images
      const { error: imageError } = await supabase
        .from('face_images')
        .delete()
        .in('id', Array.from(selectedIds));

      if (imageError) throw imageError;

      toast.success(`Deleted ${selectedIds.size} confirmed face(s)`);
      setSelectedIds(new Set());
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete faces');
    }
    setDeleteDialogOpen(false);
  };

  const toggleSeason = (season: string) => {
    setExpandedSeasons(prev => {
      const next = new Set(prev);
      if (next.has(season)) {
        next.delete(season);
      } else {
        next.add(season);
      }
      return next;
    });
  };

  const toggleSubtype = (key: string) => {
    setExpandedSubtypes(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const getSeasonColor = (season: string) => {
    switch (season.toLowerCase()) {
      case 'spring': return 'bg-emerald-500/90 text-white';
      case 'summer': return 'bg-sky-500/90 text-white';
      case 'autumn': return 'bg-amber-600/90 text-white';
      case 'winter': return 'bg-indigo-600/90 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-success" />
            Confirmed Faces
          </h2>
          <p className="text-muted-foreground mt-1">
            {confirmedFaces.length} expert-verified faces ready for training
          </p>
        </div>
        
        {selectedIds.size > 0 && (
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete {selectedIds.size} Selected
          </Button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by season or subtype..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          {totalFiltered} results
        </Button>
      </div>

      {/* Grouped Display */}
      <div className="space-y-4">
        {sortedSeasons.map((season) => {
          const subtypes = groupedFaces[season];
          return (
          <Collapsible 
            key={season} 
            open={expandedSeasons.has(season)}
            onOpenChange={() => toggleSeason(season)}
          >
            <CollapsibleTrigger className="w-full">
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity",
                getSeasonColor(season)
              )}>
                <div className="flex items-center gap-3">
                  {expandedSeasons.has(season) ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                  <span className="font-semibold capitalize text-lg">{season}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {Object.values(subtypes).reduce((sum, faces) => sum + faces.length, 0)} faces
                  </Badge>
                </div>
                <span className="text-sm opacity-80">
                  {Object.keys(subtypes).length} subtypes
                </span>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-4 pt-2 space-y-2">
              {Object.entries(subtypes).map(([subtype, faces]) => {
                const subtypeKey = `${season}-${subtype}`;
                const isExpanded = expandedSubtypes.has(subtypeKey);
                
                return (
                  <Collapsible 
                    key={subtypeKey}
                    open={isExpanded}
                    onOpenChange={() => toggleSubtype(subtypeKey)}
                  >
                    <div className="bg-card border rounded-lg overflow-hidden">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{subtype}</span>
                            <Badge variant="outline">{faces.length}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAllInSubtype(faces);
                            }}
                          >
                            Select All
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="p-3 pt-0 grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                          {faces.map(face => (
                            <div
                              key={face.id}
                              className={cn(
                                "relative group aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all",
                                selectedIds.has(face.id) 
                                  ? "ring-2 ring-primary ring-offset-2 border-primary" 
                                  : "border-success/50 hover:border-success"
                              )}
                            >
                              <img
                                src={face.thumbnail_path || face.storage_path}
                                alt=""
                                className="w-full h-full object-cover"
                                onClick={() => setSelectedFace(face)}
                              />
                              
                              {/* Selection checkbox */}
                              <div 
                                className="absolute top-1 left-1 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelection(face.id);
                                }}
                              >
                                <Checkbox
                                  checked={selectedIds.has(face.id)}
                                  className="bg-white/80 border-white"
                                />
                              </div>
                              
                              {/* Color swatches */}
                              {(face.skin_hex || face.eye_hex || face.hair_hex) && (
                                <div className="absolute bottom-1 left-1 right-1 flex gap-0.5">
                                  {face.skin_hex && (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-white/50"
                                      style={{ backgroundColor: face.skin_hex }}
                                      title={`Skin: ${face.skin_hex}`}
                                    />
                                  )}
                                  {face.eye_hex && (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-white/50"
                                      style={{ backgroundColor: face.eye_hex }}
                                      title={`Eye: ${face.eye_hex}`}
                                    />
                                  )}
                                  {face.hair_hex && (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-white/50"
                                      style={{ backgroundColor: face.hair_hex }}
                                      title={`Hair: ${face.hair_hex}`}
                                    />
                                  )}
                                </div>
                              )}
                              
                              {/* Verified badge */}
                              <div className="absolute top-1 right-1">
                                <CheckCircle2 className="w-4 h-4 text-success drop-shadow" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
          );
        })}

        {Object.keys(groupedFaces).length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed">
            <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">No Confirmed Faces Yet</h3>
            <p className="text-muted-foreground">
              Verify faces in the Gallery tab to see them here.
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedFace && (
        <FaceDetailModal
          face={{
            id: selectedFace.id,
            storage_path: selectedFace.storage_path,
            thumbnail_path: selectedFace.thumbnail_path,
            source: 'training_upload',
            source_id: null,
            quality_score: null,
            created_at: new Date().toISOString(),
          }}
          onClose={() => setSelectedFace(null)}
          onAnalyze={async () => {}}
          onUpdate={() => refetch()}
          onDelete={async (id) => {
            await supabase.from('color_labels').delete().eq('face_image_id', id);
            await supabase.from('face_images').delete().eq('id', id);
            setSelectedFace(null);
            refetch();
          }}
          isAnalyzing={false}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Confirmed Face(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove these faces from the training dataset. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
