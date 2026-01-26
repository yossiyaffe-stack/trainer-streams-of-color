import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddSubtypeDialogProps {
  defaultSeason?: string;
  onSubtypeAdded: (subtype: { id: string; name: string; season: string; slug: string }) => void;
  trigger?: React.ReactNode;
}

const SEASON_OPTIONS = ['spring', 'summer', 'autumn', 'winter'] as const;

export function AddSubtypeDialog({ defaultSeason, onSubtypeAdded, trigger }: AddSubtypeDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [season, setSeason] = useState(defaultSeason || '');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a subtype name',
        variant: 'destructive',
      });
      return;
    }

    if (!season) {
      toast({
        title: 'Season Required',
        description: 'Please select a season',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const slug = generateSlug(name);
      
      // Check if slug already exists
      const { data: existing } = await supabase
        .from('subtypes')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        toast({
          title: 'Already Exists',
          description: 'A subtype with a similar name already exists',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from('subtypes')
        .insert([{
          name: name.trim(),
          slug,
          season,
          is_active: true,
        }])
        .select('id, name, season, slug')
        .single();

      if (error) throw error;

      toast({
        title: 'Subtype Added',
        description: `"${name}" has been added to ${season}`,
      });

      onSubtypeAdded(data);
      setOpen(false);
      setName('');
      setSeason(defaultSeason || '');
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: err instanceof Error ? err.message : 'Could not add subtype',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5 w-full border-dashed">
            <Plus className="w-4 h-4" />
            Add New Subtype
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif">Add New Subtype</DialogTitle>
          <DialogDescription>
            Create a new Nechama subtype classification
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subtype-name">Subtype Name</Label>
            <Input
              id="subtype-name"
              placeholder="e.g., Golden Spring, Dusky Summer..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Season</Label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger>
                <SelectValue placeholder="Select season" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {SEASON_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s === 'spring' && '🌸 '}
                    {s === 'summer' && '☀️ '}
                    {s === 'autumn' && '🍂 '}
                    {s === 'winter' && '❄️ '}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Subtype
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
