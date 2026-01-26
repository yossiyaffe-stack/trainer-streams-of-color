import { useHub } from '@/contexts/HubContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Upload, Grid3X3, Table, BarChart3, RefreshCw, Layout, List, Tags, Building2 } from 'lucide-react';

const PHOTO_TABS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'grid', label: 'Grid Review', icon: Grid3X3 },
  { id: 'table', label: 'Table', icon: Table },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'reanalysis', label: 'Re-Analysis', icon: RefreshCw },
];

const PAINTING_TABS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'museum', label: 'Museum Import', icon: Building2 },
  { id: 'grid', label: 'Gallery', icon: Grid3X3 },
  { id: 'list', label: 'List View', icon: List },
  { id: 'bySubtype', label: 'By Subtype', icon: Tags },
];

export function HubTabNavigation() {
  const { mode, activeTab, setActiveTab, photoStats, paintingStats } = useHub();

  const tabs = mode === 'photos' ? PHOTO_TABS : PAINTING_TABS;
  const stats = mode === 'photos' ? photoStats : paintingStats;
  const accentClass = mode === 'photos' ? 'text-primary bg-primary/10' : 'text-accent bg-accent/10';

  const getBadgeCount = (tabId: string) => {
    if (mode === 'photos') {
      if (tabId === 'upload') return photoStats.pending;
      if (tabId === 'grid') return photoStats.analyzed;
    } else {
      if (tabId === 'upload') return paintingStats.pending;
    }
    return 0;
  };

  return (
    <nav className="bg-muted/30 border-b sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const badge = getBadgeCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2',
                  activeTab === tab.id
                    ? `${accentClass} border-t-2 ${mode === 'photos' ? 'border-primary' : 'border-accent'} -mb-px bg-card`
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {badge > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                    {badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
