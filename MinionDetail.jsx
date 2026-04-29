const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Save, Zap, Loader2 } from 'lucide-react';

import { toast } from 'sonner';

const statusStyles = {
  idle: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
  on_mission: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  injured: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  mia: 'bg-destructive/20 text-destructive border-destructive/30',
};

const specialtyIcons = {
  infiltration: '🥷', engineering: '🔧', combat: '⚔️',
  recon: '🔭', logistics: '📦', hacking: '💻',
};

export default function MinionDetail({ minion, onClose, onUpdate }) {
  const [form, setForm] = useState({ ...minion });
  const [saving, setSaving] = useState(false);
  const [aiPlanning, setAiPlanning] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await db.entities.Minion.update(minion.id, form);
    onUpdate();
    setSaving(false);
    toast.success('Minion updated');
  };

  const aiAssignTask = async () => {
    setAiPlanning(true);
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the tactical A.I. of L.I.V.E. Assign a mission to this minion:
Name: ${minion.name}
Specialty: ${minion.specialty}
Skill Level: ${minion.skill_level || 5}/10
Loyalty: ${minion.loyalty || 7}/10

Generate a specific, dramatic (but fictional/fun) villain mission for this minion. Include a task and a location.`,
      response_json_schema: {
        type: 'object',
        properties: {
          task: { type: 'string' },
          location: { type: 'string' },
        },
      },
    });
    setForm(prev => ({
      ...prev,
      current_task: result.task,
      task_location: result.location,
      status: 'on_mission',
    }));
    setAiPlanning(false);
    toast.success('Mission assigned by A.I.');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{specialtyIcons[minion.specialty] || '👤'}</span>
          <h3 className="font-heading text-xs tracking-widest text-primary">{minion.name?.toUpperCase()}</h3>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 text-muted-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="font-heading text-[9px] capitalize">{minion.specialty}</Badge>
        <Badge className={`font-heading text-[9px] border ${statusStyles[minion.status]}`}>
          {minion.status?.replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">STATUS</Label>
        <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
          <SelectTrigger className="bg-muted border-border font-body text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['idle', 'on_mission', 'injured', 'mia'].map(s => (
              <SelectItem key={s} value={s} className="font-body text-sm capitalize">{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">CURRENT MISSION</Label>
        <Input
          value={form.current_task || ''}
          onChange={e => setForm({ ...form, current_task: e.target.value })}
          placeholder="No active mission"
          className="bg-muted border-border font-body text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">DEPLOYMENT LOCATION</Label>
        <Input
          value={form.task_location || ''}
          onChange={e => setForm({ ...form, task_location: e.target.value })}
          placeholder="Location..."
          className="bg-muted border-border font-body text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">FIELD NOTES</Label>
        <Textarea
          value={form.notes || ''}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="Observations about this minion..."
          className="bg-muted border-border font-body text-sm resize-none h-16"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={aiAssignTask}
          disabled={aiPlanning}
          className="flex-1 border-accent text-accent hover:bg-accent/10 font-heading text-[10px] tracking-wider"
        >
          {aiPlanning ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
          A.I. MISSION
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-[10px] tracking-wider"
        >
          {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
          SAVE
        </Button>
      </div>
    </div>
  );
}