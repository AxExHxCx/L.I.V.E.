import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

const specialties = ['infiltration', 'engineering', 'combat', 'recon', 'logistics', 'hacking'];

export default function MinionForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    specialty: 'logistics',
    skill_level: 5,
    loyalty: 7,
    status: 'idle',
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs tracking-widest text-primary">RECRUIT MINION</h3>
        <Button size="icon" variant="ghost" onClick={onCancel} className="h-6 w-6 text-muted-foreground">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">CODENAME</Label>
        <Input
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Henchman #7, Igor..."
          className="bg-muted border-border font-body text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">SPECIALTY</Label>
        <Select value={form.specialty} onValueChange={v => setForm({ ...form, specialty: v })}>
          <SelectTrigger className="bg-muted border-border font-body text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {specialties.map(s => (
              <SelectItem key={s} value={s} className="font-body text-sm capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">SKILL LEVEL: {form.skill_level}/10</Label>
        <Slider
          value={[form.skill_level]}
          onValueChange={([v]) => setForm({ ...form, skill_level: v })}
          min={1} max={10} step={1}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">LOYALTY: {form.loyalty}/10</Label>
        <Slider
          value={[form.loyalty]}
          onValueChange={([v]) => setForm({ ...form, loyalty: v })}
          min={1} max={10} step={1}
          className="w-full"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!form.name.trim()}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs tracking-wider"
      >
        RECRUIT
      </Button>
    </div>
  );
}