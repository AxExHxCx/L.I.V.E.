const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Zap, MapPin, Loader2, Star } from 'lucide-react';

import { toast } from 'sonner';

const statusColors = {
  marked: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  collected: 'bg-primary/20 text-primary border-primary/30',
  cataloged: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  deployed: 'bg-chart-5/20 text-chart-5 border-chart-5/30',
};

export default function ComponentDetail({ component, onClose, onUpdate }) {
  const [analyzing, setAnalyzing] = useState(false);

  const handleCollect = async () => {
    await db.entities.Component.update(component.id, { status: 'collected' });
    onUpdate();
    toast.success('Component marked as collected');
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the AI system of L.I.V.E. (Live Interactive Villainous E-System). Analyze this component in detail:
Name: ${component.name}
Category: ${component.category}
Description: ${component.description || 'No description'}
Current AI ID: ${component.ai_identification || 'None'}

Provide a detailed technical analysis including:
1. Detailed identification and specifications
2. Condition assessment tips
3. 5 creative villain-gadget applications (fictional/fun)
4. Compatibility notes with common components
5. Storage recommendations`,
      response_json_schema: {
        type: 'object',
        properties: {
          identification: { type: 'string' },
          potential_uses: { type: 'array', items: { type: 'string' } },
          storage_tips: { type: 'string' },
          compatibility: { type: 'string' },
        },
      },
    });
    await db.entities.Component.update(component.id, {
      ai_identification: result.identification,
      potential_uses: result.potential_uses,
    });
    onUpdate();
    setAnalyzing(false);
    toast.success('Deep analysis complete');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs tracking-widest text-primary truncate flex-1">{component.name?.toUpperCase()}</h3>
        <Button size="icon" variant="ghost" onClick={onClose} className="h-7 w-7 text-muted-foreground shrink-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="font-heading text-[10px] capitalize">{component.category}</Badge>
        <Badge className={`font-heading text-[10px] ${statusColors[component.status]} border`}>
          {component.status}
        </Badge>
        {component.threat_level > 0 && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: component.threat_level }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-chart-3 text-chart-3" />
            ))}
          </div>
        )}
      </div>

      {component.image_url && (
        <img src={component.image_url} alt={component.name} className="w-full h-32 object-cover rounded-md border border-border" />
      )}

      {component.description && (
        <p className="font-body text-sm text-card-foreground">{component.description}</p>
      )}

      {component.location_note && (
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-3 h-3 mt-1 shrink-0" />
          <span className="font-body text-xs">{component.location_note}</span>
        </div>
      )}

      {component.ai_identification && (
        <div className="bg-muted rounded-md p-3 border border-border">
          <span className="font-heading text-[10px] tracking-wider text-accent">A.I. ANALYSIS</span>
          <p className="font-body text-xs text-card-foreground mt-1">{component.ai_identification}</p>
        </div>
      )}

      {component.potential_uses?.length > 0 && (
        <div className="space-y-1">
          <span className="font-heading text-[10px] tracking-wider text-muted-foreground">POTENTIAL USES</span>
          {component.potential_uses.map((use, i) => (
            <div key={i} className="flex items-start gap-2 bg-muted/50 rounded px-2 py-1.5">
              <Zap className="w-3 h-3 text-primary mt-0.5 shrink-0" />
              <span className="font-body text-xs text-card-foreground">{use}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {component.status === 'marked' && (
          <Button
            onClick={handleCollect}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-[10px] tracking-wider"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> COLLECTED
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex-1 border-accent text-accent hover:bg-accent/10 font-heading text-[10px] tracking-wider"
        >
          {analyzing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
          DEEP SCAN
        </Button>
      </div>
    </div>
  );
}