import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SeasonFilter = 'all' | 'spring' | 'summer' | 'autumn' | 'winter';
export type StatusFilter = 'all' | 'unlabeled' | 'ai_predicted' | 'needs_review' | 'manually_labeled' | 'expert_verified' | 'nechama_verified';
export type SourceFilter = 'all' | 'celeba_hq' | 'ffhq' | 'training_upload' | 'client_photo' | 'user_submission';
export type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

interface FacesFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  seasonFilter: SeasonFilter;
  onSeasonChange: (season: SeasonFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sourceFilter: SourceFilter;
  onSourceChange: (source: SourceFilter) => void;
  confidenceFilter: ConfidenceFilter;
  onConfidenceChange: (confidence: ConfidenceFilter) => void;
  totalCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function FacesFilterToolbar({
  searchQuery,
  onSearchChange,
  seasonFilter,
  onSeasonChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  confidenceFilter,
  onConfidenceChange,
  totalCount,
  filteredCount,
  onClearFilters,
}: FacesFilterToolbarProps) {
  const hasActiveFilters = 
    searchQuery !== '' || 
    seasonFilter !== 'all' || 
    statusFilter !== 'all' || 
    sourceFilter !== 'all' || 
    confidenceFilter !== 'all';

  const statusLabels: Record<StatusFilter, string> = {
    all: 'All Status',
    unlabeled: 'Unlabeled',
    ai_predicted: 'AI Predicted',
    needs_review: 'Needs Review',
    manually_labeled: 'Manually Labeled',
    expert_verified: 'Expert Verified',
    nechama_verified: 'Nechama Verified',
  };

  const sourceLabels: Record<SourceFilter, string> = {
    all: 'All Sources',
    celeba_hq: 'CelebA-HQ',
    ffhq: 'FFHQ',
    training_upload: 'Training Upload',
    client_photo: 'Client Photo',
    user_submission: 'User Submission',
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
      {/* Search + Quick Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by source ID, subtype..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={seasonFilter} onValueChange={(v) => onSeasonChange(v as SeasonFilter)}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="spring">🌸 Spring</SelectItem>
              <SelectItem value="summer">☀️ Summer</SelectItem>
              <SelectItem value="autumn">🍂 Autumn</SelectItem>
              <SelectItem value="winter">❄️ Winter</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v) => onSourceChange(v as SourceFilter)}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {Object.entries(sourceLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={confidenceFilter} onValueChange={(v) => onConfidenceChange(v as ConfidenceFilter)}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High (80%+)</SelectItem>
              <SelectItem value="medium">Medium (50-79%)</SelectItem>
              <SelectItem value="low">Low (&lt;50%)</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results Count + Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCount.toLocaleString()} of {totalCount.toLocaleString()} faces
        </p>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3 h-3 text-muted-foreground" />
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button onClick={() => onSearchChange('')} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {seasonFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 capitalize">
                {seasonFilter}
                <button onClick={() => onSeasonChange('all')} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {statusLabels[statusFilter]}
                <button onClick={() => onStatusChange('all')} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {sourceFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {sourceLabels[sourceFilter]}
                <button onClick={() => onSourceChange('all')} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {confidenceFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1 capitalize">
                {confidenceFilter} confidence
                <button onClick={() => onConfidenceChange('all')} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
