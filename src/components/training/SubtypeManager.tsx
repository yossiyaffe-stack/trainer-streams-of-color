import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Palette, Sparkles, Crown, ChevronDown, ChevronRight, Flower2, Sun, Leaf, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subtype {
  id: string;
  slug: string;
  name: string;
  season: string;
  description: string | null;
  palette_effect: string | null;
  key_colors: string[];
  avoid_colors: string[];
  fabrics_perfect: string[];
  fabrics_good: string[];
  fabrics_avoid: string[];
  prints: string[];
  silhouettes: string[];
  jewelry_metals: string[];
  jewelry_stones: string[];
  jewelry_styles: string[];
  eras: string[];
  artists: string[];
  designers: string[];
  makeup_lip: string[];
  makeup_cheek: string[];
  makeup_eye: string[];
  best_for: string[];
  is_active: boolean;
  display_order: number;
}

const EMPTY_SUBTYPE: Omit<Subtype, 'id'> = {
  slug: '',
  name: '',
  season: 'spring',
  description: '',
  palette_effect: '',
  key_colors: [],
  avoid_colors: [],
  fabrics_perfect: [],
  fabrics_good: [],
  fabrics_avoid: [],
  prints: [],
  silhouettes: [],
  jewelry_metals: [],
  jewelry_stones: [],
  jewelry_styles: [],
  eras: [],
  artists: [],
  designers: [],
  makeup_lip: [],
  makeup_cheek: [],
  makeup_eye: [],
  best_for: [],
  is_active: true,
  display_order: 0,
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
const TIME_PERIODS = ['Early', 'Mid', 'Late'] as const;

const SEASON_CONFIG = {
  spring: { 
    icon: Flower2, 
    label: 'Spring',
    bg: 'bg-emerald-100', 
    text: 'text-emerald-800', 
    border: 'border-emerald-300',
    activeBg: 'bg-emerald-500',
    activeText: 'text-white'
  },
  summer: { 
    icon: Sun, 
    label: 'Summer',
    bg: 'bg-rose-100', 
    text: 'text-rose-800', 
    border: 'border-rose-300',
    activeBg: 'bg-rose-500',
    activeText: 'text-white'
  },
  autumn: { 
    icon: Leaf, 
    label: 'Autumn',
    bg: 'bg-amber-100', 
    text: 'text-amber-800', 
    border: 'border-amber-300',
    activeBg: 'bg-amber-500',
    activeText: 'text-white'
  },
  winter: { 
    icon: Snowflake, 
    label: 'Winter',
    bg: 'bg-slate-100', 
    text: 'text-slate-800', 
    border: 'border-slate-300',
    activeBg: 'bg-slate-700',
    activeText: 'text-white'
  },
};

function TagInput({ 
  label, 
  value, 
  onChange, 
  placeholder 
}: { 
  label: string; 
  value: string[]; 
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    if (input.trim() && !value.includes(input.trim())) {
      onChange([...value, input.trim()]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button type="button" size="sm" onClick={addTag} variant="outline">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeTag(tag)}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubtypeManager() {
  const [subtypes, setSubtypes] = useState<Subtype[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubtype, setEditingSubtype] = useState<Subtype | null>(null);
  const [formData, setFormData] = useState<Omit<Subtype, 'id'>>(EMPTY_SUBTYPE);
  
  // 3-Tier Filter State
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set(SEASONS));

  useEffect(() => {
    fetchSubtypes();
  }, []);

  const fetchSubtypes = async () => {
    try {
      const { data, error } = await supabase
        .from('subtypes')
        .select('*')
        .order('season')
        .order('display_order');

      if (error) throw error;
      setSubtypes(data || []);
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      toast.error('Failed to load subtypes');
    } finally {
      setLoading(false);
    }
  };

  // Categorize subtypes
  const categorizedSubtypes = useMemo(() => {
    const result: Record<string, {
      timePeriods: Record<string, Subtype[]>;
      specific: Subtype[];
    }> = {};

    SEASONS.forEach(season => {
      result[season] = { timePeriods: {}, specific: [] };
      TIME_PERIODS.forEach(tp => {
        result[season].timePeriods[tp] = [];
      });
    });

    subtypes.forEach(subtype => {
      const season = subtype.season.toLowerCase();
      if (!result[season]) return;

      // Check if it's a time period subtype (Early X, Mid X, Late X)
      const timePeriodMatch = TIME_PERIODS.find(tp => 
        subtype.name.toLowerCase().startsWith(tp.toLowerCase())
      );

      if (timePeriodMatch) {
        result[season].timePeriods[timePeriodMatch].push(subtype);
      } else {
        result[season].specific.push(subtype);
      }
    });

    return result;
  }, [subtypes]);

  // Filter subtypes based on selection
  const filteredSubtypes = useMemo(() => {
    if (!selectedSeason) return subtypes;

    const seasonData = categorizedSubtypes[selectedSeason];
    if (!seasonData) return [];

    if (selectedTimePeriod) {
      return seasonData.timePeriods[selectedTimePeriod] || [];
    }

    // Return all for the season
    const allForSeason = [
      ...Object.values(seasonData.timePeriods).flat(),
      ...seasonData.specific
    ];
    return allForSeason;
  }, [subtypes, selectedSeason, selectedTimePeriod, categorizedSubtypes]);

  // Stats per season
  const seasonStats = useMemo(() => {
    const stats: Record<string, { total: number; timePeriod: number; specific: number }> = {};
    SEASONS.forEach(season => {
      const data = categorizedSubtypes[season];
      const timePeriodCount = Object.values(data.timePeriods).flat().length;
      stats[season] = {
        total: timePeriodCount + data.specific.length,
        timePeriod: timePeriodCount,
        specific: data.specific.length
      };
    });
    return stats;
  }, [categorizedSubtypes]);

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

  const openCreateDialog = () => {
    setEditingSubtype(null);
    setFormData({
      ...EMPTY_SUBTYPE,
      season: selectedSeason || 'spring'
    });
    setDialogOpen(true);
  };

  const openEditDialog = (subtype: Subtype) => {
    setEditingSubtype(subtype);
    setFormData({
      slug: subtype.slug,
      name: subtype.name,
      season: subtype.season,
      description: subtype.description || '',
      palette_effect: subtype.palette_effect || '',
      key_colors: subtype.key_colors || [],
      avoid_colors: subtype.avoid_colors || [],
      fabrics_perfect: subtype.fabrics_perfect || [],
      fabrics_good: subtype.fabrics_good || [],
      fabrics_avoid: subtype.fabrics_avoid || [],
      prints: subtype.prints || [],
      silhouettes: subtype.silhouettes || [],
      jewelry_metals: subtype.jewelry_metals || [],
      jewelry_stones: subtype.jewelry_stones || [],
      jewelry_styles: subtype.jewelry_styles || [],
      eras: subtype.eras || [],
      artists: subtype.artists || [],
      designers: subtype.designers || [],
      makeup_lip: subtype.makeup_lip || [],
      makeup_cheek: subtype.makeup_cheek || [],
      makeup_eye: subtype.makeup_eye || [],
      best_for: subtype.best_for || [],
      is_active: subtype.is_active,
      display_order: subtype.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.name) {
      toast.error('Slug and name are required');
      return;
    }

    setSaving(true);
    try {
      if (editingSubtype) {
        const { error } = await supabase
          .from('subtypes')
          .update(formData)
          .eq('id', editingSubtype.id);
        if (error) throw error;
        toast.success('Subtype updated!');
      } else {
        const { error } = await supabase
          .from('subtypes')
          .insert(formData);
        if (error) throw error;
        toast.success('Subtype created!');
      }
      setDialogOpen(false);
      fetchSubtypes();
    } catch (error: any) {
      console.error('Error saving subtype:', error);
      toast.error(error.message || 'Failed to save subtype');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subtype?')) return;
    
    try {
      const { error } = await supabase
        .from('subtypes')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Subtype deleted');
      fetchSubtypes();
    } catch (error) {
      console.error('Error deleting subtype:', error);
      toast.error('Failed to delete subtype');
    }
  };

  const clearFilters = () => {
    setSelectedSeason(null);
    setSelectedTimePeriod(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Subtype Management</h2>
          <p className="text-sm text-muted-foreground">
            {subtypes.length} subtypes across all seasons
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Subtype
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                {editingSubtype ? 'Edit Subtype' : 'Create New Subtype'}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="fabrics">Fabrics</TabsTrigger>
                  <TabsTrigger value="jewelry">Jewelry</TabsTrigger>
                  <TabsTrigger value="references">References</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Slug (unique ID)</Label>
                      <Input
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                        placeholder="e.g., warm-spring"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Warm Spring"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Season</Label>
                      <Select 
                        value={formData.season} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, season: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spring">🌷 Spring</SelectItem>
                          <SelectItem value="summer">🌸 Summer</SelectItem>
                          <SelectItem value="autumn">🍂 Autumn</SelectItem>
                          <SelectItem value="winter">❄️ Winter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Palette Effect</Label>
                      <Input
                        value={formData.palette_effect || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, palette_effect: e.target.value }))}
                        placeholder="e.g., Warm & Bright"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this subtype..."
                      rows={3}
                    />
                  </div>
                  <TagInput
                    label="Key Colors"
                    value={formData.key_colors}
                    onChange={(v) => setFormData(prev => ({ ...prev, key_colors: v }))}
                    placeholder="Add a color..."
                  />
                  <TagInput
                    label="Colors to Avoid"
                    value={formData.avoid_colors}
                    onChange={(v) => setFormData(prev => ({ ...prev, avoid_colors: v }))}
                    placeholder="Add a color to avoid..."
                  />
                  <TagInput
                    label="Best For (Client Types)"
                    value={formData.best_for}
                    onChange={(v) => setFormData(prev => ({ ...prev, best_for: v }))}
                    placeholder="e.g., Romantic events..."
                  />
                </TabsContent>

                <TabsContent value="fabrics" className="space-y-4">
                  <TagInput
                    label="Perfect Fabrics ✓"
                    value={formData.fabrics_perfect}
                    onChange={(v) => setFormData(prev => ({ ...prev, fabrics_perfect: v }))}
                    placeholder="Add fabric..."
                  />
                  <TagInput
                    label="Good Fabrics ○"
                    value={formData.fabrics_good}
                    onChange={(v) => setFormData(prev => ({ ...prev, fabrics_good: v }))}
                    placeholder="Add fabric..."
                  />
                  <TagInput
                    label="Fabrics to Avoid ✗"
                    value={formData.fabrics_avoid}
                    onChange={(v) => setFormData(prev => ({ ...prev, fabrics_avoid: v }))}
                    placeholder="Add fabric..."
                  />
                  <TagInput
                    label="Prints & Patterns"
                    value={formData.prints}
                    onChange={(v) => setFormData(prev => ({ ...prev, prints: v }))}
                    placeholder="Add print..."
                  />
                  <TagInput
                    label="Silhouettes"
                    value={formData.silhouettes}
                    onChange={(v) => setFormData(prev => ({ ...prev, silhouettes: v }))}
                    placeholder="Add silhouette..."
                  />
                </TabsContent>

                <TabsContent value="jewelry" className="space-y-4">
                  <TagInput
                    label="Metals"
                    value={formData.jewelry_metals}
                    onChange={(v) => setFormData(prev => ({ ...prev, jewelry_metals: v }))}
                    placeholder="e.g., Yellow Gold..."
                  />
                  <TagInput
                    label="Stones"
                    value={formData.jewelry_stones}
                    onChange={(v) => setFormData(prev => ({ ...prev, jewelry_stones: v }))}
                    placeholder="e.g., Peridot..."
                  />
                  <TagInput
                    label="Jewelry Styles"
                    value={formData.jewelry_styles}
                    onChange={(v) => setFormData(prev => ({ ...prev, jewelry_styles: v }))}
                    placeholder="e.g., Delicate chains..."
                  />
                  <TagInput
                    label="Lip Colors"
                    value={formData.makeup_lip}
                    onChange={(v) => setFormData(prev => ({ ...prev, makeup_lip: v }))}
                    placeholder="Add lip color..."
                  />
                  <TagInput
                    label="Cheek Colors"
                    value={formData.makeup_cheek}
                    onChange={(v) => setFormData(prev => ({ ...prev, makeup_cheek: v }))}
                    placeholder="Add cheek color..."
                  />
                  <TagInput
                    label="Eye Colors"
                    value={formData.makeup_eye}
                    onChange={(v) => setFormData(prev => ({ ...prev, makeup_eye: v }))}
                    placeholder="Add eye color..."
                  />
                </TabsContent>

                <TabsContent value="references" className="space-y-4">
                  <TagInput
                    label="Historical Eras"
                    value={formData.eras}
                    onChange={(v) => setFormData(prev => ({ ...prev, eras: v }))}
                    placeholder="e.g., Art Nouveau..."
                  />
                  <TagInput
                    label="Artists"
                    value={formData.artists}
                    onChange={(v) => setFormData(prev => ({ ...prev, artists: v }))}
                    placeholder="e.g., Mucha..."
                  />
                  <TagInput
                    label="Designers"
                    value={formData.designers}
                    onChange={(v) => setFormData(prev => ({ ...prev, designers: v }))}
                    placeholder="e.g., Oscar de la Renta..."
                  />
                </TabsContent>
              </Tabs>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingSubtype ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3-Tier Filter System */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Tier 1: Season Selection */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Step 1: Select Season
            </Label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map(season => {
                const config = SEASON_CONFIG[season];
                const Icon = config.icon;
                const isActive = selectedSeason === season;
                const stats = seasonStats[season];
                
                return (
                  <Button
                    key={season}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSeason(isActive ? null : season);
                      setSelectedTimePeriod(null);
                    }}
                    className={cn(
                      'gap-2 transition-all',
                      isActive 
                        ? `${config.activeBg} ${config.activeText} border-transparent` 
                        : `${config.bg} ${config.text} ${config.border}`
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                    <Badge variant="secondary" className={cn(
                      'ml-1 text-[10px]',
                      isActive && 'bg-white/20 text-inherit'
                    )}>
                      {stats.total}
                    </Badge>
                  </Button>
                );
              })}
              {selectedSeason && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Tier 2: Time Period (only when season selected) */}
          {selectedSeason && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                Step 2: Time Period (Optional)
              </Label>
              <div className="flex gap-2">
                {TIME_PERIODS.map(period => {
                  const isActive = selectedTimePeriod === period;
                  const count = categorizedSubtypes[selectedSeason]?.timePeriods[period]?.length || 0;
                  
                  return (
                    <Button
                      key={period}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTimePeriod(isActive ? null : period)}
                      className="gap-1"
                    >
                      {period}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-1 text-[10px]">
                          {count}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tier 3: Specific Subtypes Preview */}
          {selectedSeason && !selectedTimePeriod && (
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                Step 3: Specific Subtypes ({categorizedSubtypes[selectedSeason]?.specific.length || 0} unique names)
              </Label>
              <div className="flex flex-wrap gap-1">
                {categorizedSubtypes[selectedSeason]?.specific.slice(0, 10).map(subtype => (
                  <Badge key={subtype.id} variant="outline" className="text-xs">
                    {subtype.name}
                  </Badge>
                ))}
                {(categorizedSubtypes[selectedSeason]?.specific.length || 0) > 10 && (
                  <Badge variant="secondary" className="text-xs">
                    +{categorizedSubtypes[selectedSeason].specific.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Subtype Display */}
      {selectedSeason ? (
        // Filtered view
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold capitalize flex items-center gap-2">
              {SEASON_CONFIG[selectedSeason as keyof typeof SEASON_CONFIG]?.label}
              {selectedTimePeriod && ` › ${selectedTimePeriod}`}
              <Badge variant="secondary">{filteredSubtypes.length}</Badge>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSubtypes.map(subtype => (
              <SubtypeCard 
                key={subtype.id}
                subtype={subtype}
                onEdit={openEditDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        // Collapsible Season View
        <div className="space-y-4">
          {SEASONS.map(season => {
            const config = SEASON_CONFIG[season];
            const Icon = config.icon;
            const isExpanded = expandedSeasons.has(season);
            const seasonSubtypes = [
              ...Object.values(categorizedSubtypes[season]?.timePeriods || {}).flat(),
              ...(categorizedSubtypes[season]?.specific || [])
            ];

            return (
              <Collapsible key={season} open={isExpanded} onOpenChange={() => toggleSeason(season)}>
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      'w-full justify-between p-4 h-auto',
                      config.bg, config.text
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-semibold text-lg">{config.label}</span>
                      <Badge variant="secondary">{seasonSubtypes.length}</Badge>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  {/* Time Period Subtypes */}
                  {TIME_PERIODS.map(period => {
                    const periodSubtypes = categorizedSubtypes[season]?.timePeriods[period] || [];
                    if (periodSubtypes.length === 0) return null;
                    
                    return (
                      <div key={period} className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 ml-2">
                          {period} {config.label}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {periodSubtypes.map(subtype => (
                            <SubtypeCard
                              key={subtype.id}
                              subtype={subtype}
                              onEdit={openEditDialog}
                              onDelete={handleDelete}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Specific Subtypes */}
                  {(categorizedSubtypes[season]?.specific.length || 0) > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 ml-2">
                        Specific Subtypes
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categorizedSubtypes[season]?.specific.map(subtype => (
                          <SubtypeCard
                            key={subtype.id}
                            subtype={subtype}
                            onEdit={openEditDialog}
                            onDelete={handleDelete}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}

      {subtypes.length === 0 && (
        <Card className="py-12 text-center">
          <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No subtypes configured yet</p>
          <Button onClick={openCreateDialog} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Subtype
          </Button>
        </Card>
      )}
    </div>
  );
}

function SubtypeCard({ 
  subtype, 
  onEdit, 
  onDelete 
}: { 
  subtype: Subtype; 
  onEdit: (s: Subtype) => void; 
  onDelete: (id: string) => void;
}) {
  const config = SEASON_CONFIG[subtype.season as keyof typeof SEASON_CONFIG];
  
  return (
    <Card 
      className={cn(
        'relative group hover:shadow-md transition-shadow',
        !subtype.is_active && 'opacity-50'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{subtype.name}</CardTitle>
            <CardDescription className="text-xs font-mono">
              {subtype.slug}
            </CardDescription>
          </div>
          <Badge className={cn('text-xs', config?.bg, config?.text, config?.border)}>
            {subtype.palette_effect || subtype.season}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {subtype.key_colors.slice(0, 4).map(color => (
            <Badge key={color} variant="outline" className="text-[10px]">
              {color}
            </Badge>
          ))}
          {subtype.key_colors.length > 4 && (
            <Badge variant="outline" className="text-[10px]">
              +{subtype.key_colors.length - 4}
            </Badge>
          )}
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          {subtype.fabrics_perfect.length > 0 && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {subtype.fabrics_perfect.length} fabrics
            </span>
          )}
          {subtype.jewelry_metals.length > 0 && (
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {subtype.jewelry_metals.length} metals
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7"
            onClick={() => onEdit(subtype)}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 text-destructive"
            onClick={() => onDelete(subtype.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
