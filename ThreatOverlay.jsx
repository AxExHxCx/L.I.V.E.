const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Loader2, RefreshCw, AlertTriangle, Gem, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const THREAT_TYPES = {
  instability: { color: '#ff4444', icon: '⚠️', label: 'INSTABILITY' },
  resource: { color: '#00e68a', icon: '💎', label: 'RESOURCES' },
  hero: { color: '#4488ff', icon: '🦸', label: 'HERO SIGHTING' },
};

export default function ThreatOverlay({ onClose }) {
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const generateThreats = async () => {
    setLoading(true);
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the global intelligence system for L.I.V.E. (Live Interactive Villainous E-System). 
Generate a realistic-sounding (but entirely fictional) global threat and opportunity intelligence report for a supervillain.
Include exactly 6 items: 2 global instability hotspots, 2 resource-rich zones, and 2 hero activity sightings.
Each should have a fictional city name, dramatic description, and a threat/opportunity level.`,
      response_json_schema: {
        type: 'object',
        properties: {
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['instability', 'resource', 'hero'] },
                location: { type: 'string' },
                description: { type: 'string' },
                level: { type: 'number' },
              },
            },
          },
        },
      },
    });
    setThreats(result.events || []);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  };

  useEffect(() => {
    generateThreats();
  }, []);

  return (
    <div className="absolute top-3 left-3 z-[1000] w-72 bg-card/95 backdrop-blur-sm border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-chart-4" />
          <span className="font-heading text-[10px] tracking-wider text-foreground">GLOBAL INTEL FEED</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={generateThreats} disabled={loading} className="h-6 w-6 text-muted-foreground hover:text-primary">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={onClose} className="h-6 w-6 text-muted-foreground hover:text-foreground">
            ✕
          </Button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
        {loading && threats.length === 0 ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="font-heading text-[10px] text-muted-foreground">SCANNING GLOBE...</span>
          </div>
        ) : (
          threats.map((t, i) => {
            const config = THREAT_TYPES[t.type] || THREAT_TYPES.instability;
            return (
              <div key={i} className="bg-muted/60 rounded-md p-2 border border-border/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{config.icon}</span>
                    <div>
                      <div className="font-heading text-[9px] tracking-wider" style={{ color: config.color }}>
                        {config.label}
                      </div>
                      <div className="font-body text-xs text-foreground font-semibold">{t.location}</div>
                    </div>
                  </div>
                  <Badge className="font-heading text-[8px] shrink-0" style={{ background: config.color + '22', color: config.color, borderColor: config.color + '44' }}>
                    LVL {t.level}
                  </Badge>
                </div>
                <p className="font-body text-[10px] text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
              </div>
            );
          })
        )}
      </div>

      {lastUpdate && (
        <div className="px-3 py-1.5 border-t border-border bg-muted/30">
          <span className="font-heading text-[8px] text-muted-foreground tracking-wider">LAST SYNC: {lastUpdate}</span>
        </div>
      )}
    </div>
  );
}