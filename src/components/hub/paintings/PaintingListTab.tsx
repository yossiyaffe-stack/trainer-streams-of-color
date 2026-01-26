import { useMemo } from 'react';
import { useHub } from '@/contexts/HubContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function PaintingListTab() {
  const { paintings, subtypes, togglePaintingSubtype } = useHub();
  const filtered = paintings.filter(p => p.status !== 'pending');

  return (
    <div className="h-full bg-card overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left">Painting</th>
            <th className="px-4 py-3 text-left">Fabrics</th>
            <th className="px-4 py-3 text-left">Silhouette</th>
            <th className="px-4 py-3 text-left">Palette Effect</th>
            <th className="px-4 py-3 text-left">Linked Subtypes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filtered.map(p => (
            <tr key={p.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={p.preview} 
                    alt="" 
                    className="w-14 h-20 object-cover rounded" 
                  />
                  <div>
                    <div className="font-medium">{p.title || 'Untitled'}</div>
                    <div className="text-xs text-muted-foreground">{p.artistDetected}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.analysis?.fabrics?.primary?.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">{p.analysis?.silhouette?.primary || '-'}</td>
              <td className="px-4 py-3 text-accent">{p.paletteEffect || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {p.linkedSubtypes?.map(id => {
                    const s = subtypes.find(sub => sub.id === id);
                    return s ? (
                      <Badge key={id} variant="outline" className="text-xs">
                        {s.name}
                      </Badge>
                    ) : null;
                  })}
                  {(!p.linkedSubtypes || p.linkedSubtypes.length === 0) && (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
