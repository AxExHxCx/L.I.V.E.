const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Zap, Loader2, Upload } from 'lucide-react';

import { toast } from 'sonner';

const categories = ['electronic', 'mechanical', 'chemical', 'structural', 'optical', 'magnetic', 'unknown'];

export default function MarkerForm({ latlng, onSave, onCancel, onAiIdentify }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'unknown',
    location_note: '',
    latitude: latlng.lat,
    longitude: latlng.lng,
    status: 'marked',
    threat_level: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [identifying, setIdentifying] = useState(false);

  const handleAiIdentify = async () => {
    setIdentifying(true);
    const desc = form.description || form.name || 'unknown found object';
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the AI system of L.I.V.E. (Live Interactive Villainous E-System), a creative supervillain gadget-building tool. A field operative found an item described as: "${desc}". Location note: "${form.location_note || 'none'}".

Identify this component and provide:
1. A proper technical name for it
2. What category it falls under (electronic, mechanical, chemical, structural, optical, magnetic)
3. A brief technical description
4. 3 potential villain-gadget uses for it (creative and fun, keep it fictional/harmless)
5. A threat/usefulness level from 1-5`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string', enum: categories },
          description: { type: 'string' },
          potential_uses: { type: 'array', items: { type: 'string' } },
          threat_level: { type: 'number' },
        },
      },
    });
    setForm((prev) => ({
      ...prev,
      name: result.name || prev.name,
      category: result.category || prev.category,
      description: result.description || prev.description,
      threat_level: result.threat_level || prev.threat_level,
    }));
    if (onAiIdentify) onAiIdentify(result);
    setIdentifying(false);
    toast.success('A.I. identification complete');
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error('Component needs a designation');
      return;
    }
    setSaving(true);
    let imageUrl = '';
    if (imageFile) {
      const res = await db.integrations.Core.UploadFile({ file: imageFile });
      imageUrl = res.file_url;
    }
    await onSave({ ...form, image_url: imageUrl || undefined });
    setSaving(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs tracking-widest text-primary">NEW COMPONENT</h3>
        <Button size="icon" variant="ghost" onClick={onCancel} className="h-7 w-7 text-muted-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-[10px] font-body text-muted-foreground">
        COORDS: {latlng.lat.toFixed(5)}, {latlng.lng.toFixed(5)}
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">DESIGNATION</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="What did you find?"
          className="bg-muted border-border font-body text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">DESCRIPTION</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the component..."
          className="bg-muted border-border font-body text-sm h-20 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">CATEGORY</Label>
        <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger className="bg-muted border-border font-body text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="font-body text-sm capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">LOCATION NOTE</Label>
        <Input
          value={form.location_note}
          onChange={(e) => setForm({ ...form, location_note: e.target.value })}
          placeholder="Behind the dumpster at 5th Ave..."
          className="bg-muted border-border font-body text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="font-heading text-[10px] tracking-wider text-muted-foreground">PHOTO</Label>
        <label className="flex items-center gap-2 px-3 py-2 bg-muted border border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="font-body text-sm text-muted-foreground">
            {imageFile ? imageFile.name : 'Upload image...'}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
        </label>
      </div>

      <Button
        variant="outline"
        className="w-full border-accent text-accent hover:bg-accent/10 font-heading text-xs tracking-wider"
        onClick={handleAiIdentify}
        disabled={identifying}
      >
        {identifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
        A.I. IDENTIFY
      </Button>

      <Button
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs tracking-wider"
        onClick={handleSubmit}
        disabled={saving}
      >
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        LOG COMPONENT
      </Button>
    </div>
  );
}