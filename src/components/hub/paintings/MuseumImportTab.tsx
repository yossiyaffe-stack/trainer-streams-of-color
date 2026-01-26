import { useState, useCallback } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Loader2, 
  Download, 
  ImageIcon,
  Building2,
  Sparkles,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MuseumArtwork {
  id: string;
  title: string;
  artist: string;
  date: string;
  imageUrl: string;
  thumbnailUrl: string;
  museum: string;
  department?: string;
  medium?: string;
  isPublicDomain: boolean;
}

const ARTISTS = [
  { name: 'Alphonse Mucha', query: 'mucha', movement: 'Art Nouveau', years: '1860-1939' },
  { name: 'Amedeo Modigliani', query: 'modigliani', movement: 'Expressionism', years: '1884-1920' },
  { name: 'Caravaggio', query: 'caravaggio', movement: 'Baroque', years: '1571-1610' },
  { name: 'Claude Monet', query: 'monet', movement: 'Impressionism', years: '1840-1926' },
  { name: 'Dante Gabriel Rossetti', query: 'rossetti', movement: 'Pre-Raphaelite', years: '1828-1882' },
  { name: 'Edgar Degas', query: 'degas', movement: 'Impressionism', years: '1834-1917' },
  { name: 'Édouard Manet', query: 'manet', movement: 'Impressionism/Realism', years: '1832-1883' },
  { name: 'El Greco', query: 'el-greco', movement: 'Mannerist', years: '1541-1614' },
  { name: 'Gustav Klimt', query: 'klimt', movement: 'Art Nouveau/Symbolism', years: '1862-1918' },
  { name: 'Henri Matisse', query: 'matisse', movement: 'Fauvism/Modernism', years: '1869-1954' },
  { name: 'Ingres', query: 'ingres', movement: 'Neoclassical', years: '1780-1867' },
  { name: 'Jean-Baptiste-Camille Corot', query: 'corot', movement: 'Realism/Barbizon', years: '1796-1875' },
  { name: 'Johannes Vermeer', query: 'vermeer', movement: 'Dutch Golden Age', years: '1632-1675' },
  { name: 'John Singer Sargent', query: 'sargent', movement: 'Realism/Impressionism', years: '1856-1925' },
  { name: 'Leonardo da Vinci', query: 'da-vinci leonardo', movement: 'High Renaissance', years: '1452-1519' },
  { name: 'Mary Cassatt', query: 'cassatt', movement: 'Impressionism', years: '1844-1926' },
  { name: 'Odilon Redon', query: 'odilon-redon', movement: 'Symbolist', years: '1840-1916' },
  { name: 'Pablo Picasso', query: 'picasso', movement: 'Cubism/Modernism', years: '1881-1973' },
  { name: 'Paul Gauguin', query: 'gauguin', movement: 'Post-Impressionism', years: '1848-1903' },
  { name: 'Pierre-Auguste Renoir', query: 'renoir', movement: 'Impressionism', years: '1841-1919' },
  { name: 'Raphael', query: 'raphael', movement: 'High Renaissance', years: '1483-1520' },
  { name: 'Rembrandt van Rijn', query: 'rembrandt', movement: 'Dutch Golden Age', years: '1606-1669' },
  { name: 'Sandro Botticelli', query: 'botticelli', movement: 'Early Renaissance', years: '1445-1510' },
  { name: 'Vincent van Gogh', query: 'van-gogh', movement: 'Post-Impressionism', years: '1853-1890' },
];

const QUICK_SEARCHES = [
  { label: '👗 Gowns & Dresses', query: 'gown dress woman' },
  { label: '👸 Portraits', query: 'portrait woman lady' },
  { label: '🎨 Renaissance', query: 'renaissance portrait woman' },
  { label: '💎 Jewelry', query: 'woman pearls jewels necklace' },
  { label: '🌸 Romantic Era', query: 'romantic era portrait woman' },
  { label: '🖼️ Pre-Raphaelite', query: 'pre-raphaelite woman' },
  { label: '👑 Nobility', query: 'duchess queen noblewoman portrait' },
  { label: '🌺 Impressionist', query: 'impressionist portrait woman renoir' },
];

const SEASON_SEARCHES = [
  { label: 'Spring', query: 'spring flowers pastel woman portrait', emoji: '🌷' },
  { label: 'Summer', query: 'summer bright colors outdoor woman', emoji: '☀️' },
  { label: 'Autumn', query: 'autumn warm tones rich colors portrait', emoji: '🍂' },
  { label: 'Winter', query: 'winter deep colors velvet portrait woman', emoji: '❄️' },
];

export function MuseumImportTab() {
  const { setPaintings, paintings } = useHub();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<MuseumArtwork[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeMuseum, setActiveMuseum] = useState<'all' | 'aic' | 'met'>('all');

  const searchMuseums = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('fetch-museum-art', {
        body: { action: 'search', query, museum: activeMuseum, limit: 30 }
      });

      if (error) throw error;
      setResults(data.results || []);
      
      if (data.results?.length === 0) {
        toast.info('No public domain artworks found. Try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search museums. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeMuseum]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const importSelected = async () => {
    const toImport = results.filter(r => selectedIds.has(r.id));
    if (toImport.length === 0) return;

    setImporting(true);
    let imported = 0;

    for (const artwork of toImport) {
      try {
        // Insert directly into database with external URL
        const { data: insertedPainting, error: insertError } = await supabase
          .from('paintings')
          .insert({
            image_url: artwork.imageUrl,
            thumbnail_url: artwork.thumbnailUrl,
            original_filename: `${artwork.museum}-${artwork.id}`,
            title: artwork.title,
            artist: artwork.artist,
            era: artwork.date,
            status: 'pending',
            notes: `Imported from ${artwork.museum}. ${artwork.medium || ''}`
          })
          .select()
          .single();

        if (!insertError && insertedPainting) {
          imported++;
          
          // Add to local state
          setPaintings(prev => [{
            id: insertedPainting.id,
            dbId: insertedPainting.id,
            preview: artwork.thumbnailUrl,
            imageUrl: artwork.imageUrl,
            filename: `${artwork.museum}-${artwork.id}`,
            status: 'pending',
            title: artwork.title,
            analysis: null,
            linkedSubtypes: [],
            notes: `Imported from ${artwork.museum}`,
            uploadedAt: new Date().toISOString(),
            artistDetected: artwork.artist,
            eraDetected: artwork.date
          }, ...prev]);
        }
      } catch (error) {
        console.error('Import error for', artwork.id, error);
      }
    }

    setImporting(false);
    setSelectedIds(new Set());
    toast.success(`Imported ${imported} paintings! Ready for AI analysis.`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏛️</div>
        <h2 className="text-2xl font-serif font-semibold">Museum Collections</h2>
        <p className="text-muted-foreground mt-1">
          Import public domain paintings from world-class museums for your training library
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for portraits, gowns, Renaissance art..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchMuseums(searchQuery)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'aic', label: 'Chicago' },
            { id: 'met', label: 'Met NYC' }
          ].map(m => (
            <Button
              key={m.id}
              variant={activeMuseum === m.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActiveMuseum(m.id as any)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <Button onClick={() => searchMuseums(searchQuery)} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="ml-2">Search</span>
        </Button>
      </div>

      {/* Quick Search Tags */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCHES.map(qs => (
            <Badge
              key={qs.query}
              variant="outline"
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-3 py-1"
              onClick={() => {
                setSearchQuery(qs.query);
                searchMuseums(qs.query);
              }}
            >
              {qs.label}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">By Season:</span>
          {SEASON_SEARCHES.map(s => (
            <Badge
              key={s.label}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => {
                setSearchQuery(s.query);
                searchMuseums(s.query);
              }}
            >
              {s.emoji} {s.label}
            </Badge>
          ))}
        </div>
        
        {/* Artist Selector */}
        <div className="flex gap-3 items-center pt-2">
          <span className="text-sm text-muted-foreground font-medium">🎨 By Artist:</span>
          <Select
            onValueChange={(value) => {
              const artist = ARTISTS.find(a => a.query === value);
              if (artist) {
                setSearchQuery(artist.name);
                searchMuseums(artist.query);
              }
            }}
          >
            <SelectTrigger className="w-[280px] bg-background">
              <SelectValue placeholder="Select an artist..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] bg-popover z-50">
              {ARTISTS.map(artist => (
                <SelectItem key={artist.query} value={artist.query}>
                  <div className="flex flex-col">
                    <span className="font-medium">{artist.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {artist.movement} • {artist.years}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Quick Artist Badges */}
          <div className="flex flex-wrap gap-1.5">
            {ARTISTS.slice(0, 6).map(artist => (
              <Badge
                key={artist.query}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
                onClick={() => {
                  setSearchQuery(artist.name);
                  searchMuseums(artist.query);
                }}
              >
                {artist.name.split(' ').pop()}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={selectAll}>
                {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="text-sm text-muted-foreground">
                {results.length} artworks found • {selectedIds.size} selected
              </span>
            </div>
            {selectedIds.size > 0 && (
              <Button onClick={importSelected} disabled={importing}>
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import {selectedIds.size} Paintings
                  </>
                )}
              </Button>
            )}
          </div>

          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map(artwork => (
                <Card
                  key={artwork.id}
                  className={cn(
                    'relative overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-accent group',
                    selectedIds.has(artwork.id) && 'ring-2 ring-primary'
                  )}
                  onClick={() => toggleSelect(artwork.id)}
                >
                  <div className="aspect-[3/4] relative">
                    <img
                      src={artwork.thumbnailUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className={cn(
                      'absolute inset-0 bg-primary/20 flex items-center justify-center transition-opacity',
                      selectedIds.has(artwork.id) ? 'opacity-100' : 'opacity-0'
                    )}>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Checkbox
                        checked={selectedIds.has(artwork.id)}
                        className="bg-background/80"
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => toggleSelect(artwork.id)}
                      />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute bottom-2 left-2 text-[10px] bg-background/80"
                    >
                      {artwork.museum.includes('Chicago') ? 'AIC' : 'Met'}
                    </Badge>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium line-clamp-2">{artwork.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{artwork.artist}</p>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Search museum collections above</p>
          <p className="text-sm">or click a quick search tag to get started</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-accent" />
          <p className="text-muted-foreground">Searching museum collections...</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>All images are public domain (CC0) from official museum APIs</p>
        <p className="mt-1">
          <span className="font-medium">Art Institute of Chicago</span> • 
          <span className="font-medium ml-2">Metropolitan Museum of Art</span>
        </p>
      </div>
    </div>
  );
}
