import { useState } from 'react';
import { motion } from 'framer-motion';
import { SAMPLE_SUBTYPES, SEASONS, type Season, type Subtype, getSeasonBadge } from '@/data/subtypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubtypeCardProps {
  subtype: Subtype;
  onClick?: () => void;
}

function SubtypeCard({ subtype, onClick }: SubtypeCardProps) {
  const palette = subtype.palette.skinTones || subtype.palette.colors || [];
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`p-5 rounded-2xl season-card-${subtype.season} border border-border/50 cursor-pointer transition-all duration-300 hover:shadow-elevated`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-serif text-lg font-semibold">{subtype.name}</h3>
        <Badge className={getSeasonBadge(subtype.season)}>
          {subtype.season}
        </Badge>
      </div>

      {/* Mini color palette */}
      <div className="flex gap-0.5 mb-4 h-6 rounded-lg overflow-hidden">
        {palette.slice(0, 5).map((color, i) => (
          <div
            key={i}
            className="flex-1 bg-muted-foreground/20"
            title={color}
          />
        ))}
      </div>

      {/* Palette effects */}
      <div className="flex flex-wrap gap-1 mb-3">
        {subtype.paletteEffects.slice(0, 2).map((effect) => (
          <span
            key={effect}
            className="text-xs px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground"
          >
            {effect}
          </span>
        ))}
      </div>

      {/* Fabrics preview */}
      <p className="text-xs text-muted-foreground line-clamp-1">
        {subtype.fabrics.slice(0, 3).join(' • ')}
      </p>
    </motion.div>
  );
}

export function SubtypeExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedSubtype, setSelectedSubtype] = useState<Subtype | null>(null);

  const filteredSubtypes = SAMPLE_SUBTYPES.filter((subtype) => {
    const matchesSeason = selectedSeason === 'all' || subtype.season === selectedSeason;
    const matchesSearch = subtype.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subtype.paletteEffects.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSeason && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search subtypes, effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedSeason === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSeason('all')}
          >
            All
          </Button>
          {SEASONS.map((season) => (
            <Button
              key={season.id}
              variant={selectedSeason === season.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSeason(season.id)}
              className={selectedSeason === season.id ? '' : getSeasonBadge(season.id)}
            >
              {season.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredSubtypes.length} subtypes
      </p>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSubtypes.map((subtype, index) => (
          <motion.div
            key={subtype.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SubtypeCard 
              subtype={subtype} 
              onClick={() => setSelectedSubtype(subtype)}
            />
          </motion.div>
        ))}
      </div>

      {/* Detail Modal - simplified inline version */}
      {selectedSubtype && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedSubtype(null)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <Badge className={getSeasonBadge(selectedSubtype.season)}>
                  {selectedSubtype.season}
                </Badge>
                <h2 className="font-serif text-3xl font-bold mt-2">{selectedSubtype.name}</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedSubtype(null)}>
                ✕
              </Button>
            </div>

            {/* Palette Effects */}
            <div className="mb-6">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Palette Effects
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubtype.paletteEffects.map((effect) => (
                  <span key={effect} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {effect}
                  </span>
                ))}
              </div>
            </div>

            {/* Color Combinations */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Color Combinations</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubtype.colorCombinations.map((combo) => (
                  <span key={combo} className="px-3 py-1 rounded-full bg-muted text-sm">
                    {combo}
                  </span>
                ))}
              </div>
            </div>

            {/* Fabrics */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Recommended Fabrics</h4>
              <p className="text-muted-foreground text-sm">
                {selectedSubtype.fabrics.join(' • ')}
              </p>
            </div>

            {/* Prints */}
            <div>
              <h4 className="font-medium mb-2">Prints & Patterns</h4>
              <p className="text-muted-foreground text-sm">
                {selectedSubtype.prints.join(' • ')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
