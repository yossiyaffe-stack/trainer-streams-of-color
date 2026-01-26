import { useState, useMemo } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusDot } from '../StatusDot';
import { Search, Link, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PaintingGridTab() {
  const { paintings, subtypes, updatePainting, togglePaintingSubtype, deletePaintings } = useHub();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const analyzed = paintings.filter(p => p.status !== 'pending');
    if (!search) return analyzed;
    const q = search.toLowerCase();
    return analyzed.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      p.paletteEffect?.toLowerCase().includes(q) ||
      JSON.stringify(p.analysis || {}).toLowerCase().includes(q)
    );
  }, [paintings, search]);

  const expandedPainting = expanded ? paintings.find(p => p.id === expanded) : null;

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDeleteSelected = () => {
    deletePaintings(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-card border-b p-4 flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, fabric, mood..." 
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} paintings</span>
        
        {selectedIds.size > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.size})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedIds.size} painting(s)?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the selected paintings. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(painting => {
            const isSelected = selectedIds.has(painting.id);
            return (
              <div 
                key={painting.id} 
                onClick={() => setExpanded(painting.id)}
                className={cn(
                  "group relative bg-card rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-all",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                <div className="aspect-[3/4] relative">
                  <img src={painting.preview} alt="" className="w-full h-full object-cover" />
                  <StatusDot status={painting.status} />
                  
                  {/* Quick delete button */}
                  <button
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePaintings([painting.id]);
                    }}
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                  
                  {painting.linkedSubtypes?.length > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs bg-primary text-primary-foreground flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      {painting.linkedSubtypes.length}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm truncate">{painting.title || 'Untitled'}</h3>
                  {painting.paletteEffect && (
                    <p className="text-xs text-accent truncate">{painting.paletteEffect}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {expandedPainting && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpanded(null)}
        >
          <div 
            className="bg-card rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-1/2 bg-muted flex items-center justify-center">
              <img 
                src={expandedPainting.preview} 
                alt="" 
                className="max-w-full max-h-[85vh] object-contain" 
              />
            </div>
            <div className="w-1/2 flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-serif font-semibold">
                  {expandedPainting.title || 'Untitled'}
                </h2>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this painting?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove the painting. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => {
                            deletePaintings([expandedPainting.id]);
                            setExpanded(null);
                          }} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <button 
                    onClick={() => setExpanded(null)} 
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {expandedPainting.paletteEffect && (
                  <div className="bg-accent/10 rounded-lg p-3">
                    <div className="text-xs text-accent font-medium">Palette Effect</div>
                    <div className="text-lg font-serif font-semibold">{expandedPainting.paletteEffect}</div>
                  </div>
                )}

                {expandedPainting.analysis?.fabrics && (
                  <div>
                    <div className="text-sm font-medium mb-1">🧵 Fabrics</div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        ...(expandedPainting.analysis.fabrics.primary || []), 
                        ...(expandedPainting.analysis.fabrics.secondary || [])
                      ].map((f, i) => (
                        <Badge key={i} variant="secondary">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {expandedPainting.analysis?.silhouette?.primary && (
                  <div>
                    <span className="text-sm font-medium">👗 Silhouette:</span>{' '}
                    {expandedPainting.analysis.silhouette.primary}
                  </div>
                )}

                {expandedPainting.suggestedSeason && (
                  <div>
                    <span className="text-sm font-medium">🎨 Suggested Season:</span>{' '}
                    <Badge className={cn(
                      expandedPainting.suggestedSeason === 'Spring' && 'badge-spring',
                      expandedPainting.suggestedSeason === 'Summer' && 'badge-summer',
                      expandedPainting.suggestedSeason === 'Autumn' && 'badge-autumn',
                      expandedPainting.suggestedSeason === 'Winter' && 'badge-winter'
                    )}>
                      {expandedPainting.suggestedSeason}
                    </Badge>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium mb-2">🔗 Link to Subtypes</div>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border rounded-lg p-2">
                    {subtypes.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => togglePaintingSubtype(expandedPainting.id, s.id)}
                        className={cn(
                          'px-2 py-1 rounded text-xs transition-colors',
                          expandedPainting.linkedSubtypes?.includes(s.id) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        )}
                      >
                        {expandedPainting.linkedSubtypes?.includes(s.id) && '✓ '}
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
