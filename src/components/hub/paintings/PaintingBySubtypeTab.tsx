import { useMemo } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PaintingBySubtypeTab() {
  const { paintings, subtypes } = useHub();

  const grouped = useMemo(() => {
    const g: Record<string, { subtype: { id: string; name: string; season: string }; paintings: typeof paintings }> = {};
    
    subtypes.forEach(s => {
      g[s.id] = { 
        subtype: { id: s.id, name: s.name, season: s.season }, 
        paintings: paintings.filter(p => p.linkedSubtypes?.includes(s.id)) 
      };
    });
    
    g['unlinked'] = { 
      subtype: { id: 'unlinked', name: 'Not Linked', season: '' }, 
      paintings: paintings.filter(p => !p.linkedSubtypes?.length && p.status !== 'pending') 
    };
    
    return g;
  }, [paintings, subtypes]);

  const seasonEmojis: Record<string, string> = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️'
  };

  const seasons = ['spring', 'summer', 'autumn', 'winter', ''];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {seasons.map(season => {
        const seasonGroups = Object.values(grouped).filter(
          g => g.subtype.season === season && g.paintings.length > 0
        );
        
        if (seasonGroups.length === 0) return null;
        
        return (
          <div key={season || 'other'}>
            <h2 className="text-lg font-serif font-semibold mb-4">
              {season ? (
                <>{seasonEmojis[season]} <span className="capitalize">{season}</span></>
              ) : (
                <>📁 Unlinked</>
              )}
            </h2>
            {seasonGroups.map(({ subtype, paintings: subtypePaintings }) => (
              <div key={subtype.id} className="mb-6">
                <h3 className="font-medium mb-2">
                  {subtype.name}{' '}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({subtypePaintings.length})
                  </span>
                </h3>
                <div className="grid grid-cols-8 gap-2">
                  {subtypePaintings.slice(0, 8).map(p => (
                    <div key={p.id} className="relative">
                      <img 
                        src={p.preview} 
                        alt="" 
                        className="w-full aspect-[3/4] object-cover rounded" 
                      />
                    </div>
                  ))}
                  {subtypePaintings.length > 8 && (
                    <div className="w-full aspect-[3/4] bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
                      +{subtypePaintings.length - 8}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
