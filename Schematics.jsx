const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Cpu, Loader2, Zap, ChevronRight, Plus, Puzzle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const difficultyColors = {
  novice: 'bg-primary/20 text-primary border-primary/30',
  intermediate: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  advanced: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  mastermind: 'bg-accent/20 text-accent border-accent/30',
};

export default function Schematics() {
  const [generating, setGenerating] = useState(false);
  const [adapting, setAdapting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [adaptResult, setAdaptResult] = useState(null);
  const [selectedForAdapt, setSelectedForAdapt] = useState(null);
  const queryClient = useQueryClient();

  const { data: schematics = [], isLoading: loadingSchematics } = useQuery({
    queryKey: ['schematics'],
    queryFn: () => db.entities.Schematic.list('-created_date', 100),
  });

  const { data: components = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => db.entities.Component.list('-created_date', 500),
  });

  const generateSchematic = async () => {
    if (components.length === 0) {
      toast.error('No components in vault. Go find some first!');
      return;
    }
    setGenerating(true);
    const compList = components.slice(0, 20).map((c) => `${c.name} (${c.category})`).join(', ');
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the AI system of L.I.V.E. (Live Interactive Villainous E-System). Based on these available components: ${compList}

Generate a creative, fun supervillain gadget schematic with a MODULAR DESIGN. This is fictional and for entertainment purposes.

Provide:
1. A cool villain gadget name
2. A description of what it does
3. Step-by-step build instructions (in markdown format, be detailed and creative)
4. Which components from the list are needed (list component names)
5. Difficulty level (novice, intermediate, advanced, mastermind)
6. A category (surveillance, defense, utility, transport, communication, other)`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          instructions: { type: 'string' },
          required_components: { type: 'array', items: { type: 'string' } },
          difficulty: { type: 'string', enum: ['novice', 'intermediate', 'advanced', 'mastermind'] },
          category: { type: 'string', enum: ['surveillance', 'defense', 'utility', 'transport', 'communication', 'other'] },
        },
      },
    });
    await db.entities.Schematic.create(result);
    queryClient.invalidateQueries({ queryKey: ['schematics'] });
    setGenerating(false);
    toast.success('New schematic generated!');
  };

  const deleteSchematic = async (id, e) => {
    e.stopPropagation();
    await db.entities.Schematic.delete(id);
    queryClient.invalidateQueries({ queryKey: ['schematics'] });
    if (expandedId === id) setExpandedId(null);
    toast.success('Schematic purged');
  };

  const adaptSchematic = async () => {
    if (!selectedForAdapt) {
      toast.error('Select a schematic to adapt');
      return;
    }
    const schematic = schematics.find(s => s.id === selectedForAdapt);
    setAdapting(true);
    const availableComps = components.slice(0, 20).map(c => `${c.name} (${c.category})`).join(', ');
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the modular design A.I. of L.I.V.E.

Original gadget: ${schematic.name}
Original description: ${schematic.description}
Original required components: ${(schematic.required_components || []).join(', ')}

Available inventory now: ${availableComps}

Perform a modular adaptation analysis:
1. **SUBSTITUTION MODULE** — Identify which original components can be swapped with available alternatives, and how that changes the gadget's function
2. **ENHANCEMENT MODULE** — Suggest 2 enhancements using available components that upgrade the original design
3. **VARIANT BUILD** — Propose a completely new variant of this gadget using only currently available components
4. **INTEROPERABILITY NOTE** — Explain how this gadget can interface with other typical villain gadgets

Format with markdown headers. Be creative and dramatic.`,
    });
    setAdaptResult({ result, schematic });
    setAdapting(false);
    toast.success('Modular adaptation analysis complete');
  };

  const SchematicsList = () => (
    <div className="space-y-3">
      {loadingSchematics ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : schematics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Cpu className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-heading text-xs tracking-wider text-muted-foreground">NO SCHEMATICS YET</p>
          <p className="font-body text-xs text-muted-foreground mt-1">Hit GENERATE to create your first gadget blueprint</p>
        </div>
      ) : (
        schematics.map((s) => {
          const expanded = expandedId === s.id;
          return (
            <Card
              key={s.id}
              className="bg-card border-border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors relative group"
              onClick={() => setExpandedId(expanded ? null : s.id)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-6">
                    <h3 className="font-heading text-xs tracking-wider text-foreground">{s.name?.toUpperCase()}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`font-heading text-[9px] ${difficultyColors[s.difficulty]} border`}>{s.difficulty}</Badge>
                      <Badge variant="outline" className="font-heading text-[9px] capitalize">{s.category}</Badge>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </div>
                {expanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {s.required_components?.length > 0 && (
                      <div>
                        <span className="font-heading text-[10px] tracking-wider text-accent">REQUIRED COMPONENTS</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.required_components.map((rc, i) => (
                            <Badge key={i} variant="outline" className="font-body text-[10px]">
                              <Zap className="w-2.5 h-2.5 mr-1 text-primary" />{rc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {s.instructions && (
                      <div className="bg-muted rounded-md p-3 border border-border">
                        <span className="font-heading text-[10px] tracking-wider text-primary block mb-2">BUILD INSTRUCTIONS</span>
                        <div className="font-body text-xs text-card-foreground prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{s.instructions}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={(e) => deleteSchematic(s.id, e)}
                className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-destructive hover:bg-destructive/10"
                title="Delete schematic"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-sm tracking-widest text-foreground">SCHEMATICS</h2>
          </div>
          <Button
            onClick={generateSchematic}
            disabled={generating}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-[10px] tracking-wider"
          >
            {generating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
            GENERATE
          </Button>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">
          A.I. generates gadget blueprints from your collected components
        </p>
      </div>

      <Tabs defaultValue="blueprints" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 shrink-0">
          <TabsList className="bg-muted w-full">
            <TabsTrigger value="blueprints" className="flex-1 font-heading text-[10px] tracking-wider">
              <Cpu className="w-3 h-3 mr-1" /> BLUEPRINTS
            </TabsTrigger>
            <TabsTrigger value="modular" className="flex-1 font-heading text-[10px] tracking-wider">
              <Puzzle className="w-3 h-3 mr-1" /> MODULAR
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="blueprints" className="flex-1 overflow-y-auto p-4 mt-0">
          <SchematicsList />
        </TabsContent>

        <TabsContent value="modular" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="space-y-1.5">
              <span className="font-heading text-[10px] tracking-wider text-muted-foreground">SELECT SCHEMATIC TO ADAPT</span>
              {schematics.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground">Generate schematics first</p>
              ) : (
                schematics.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedForAdapt(s.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all font-body text-sm ${
                      selectedForAdapt === s.id
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-muted border-border text-card-foreground hover:border-accent/30'
                    }`}
                  >
                    <div className="font-heading text-[10px] tracking-wider">{s.name?.toUpperCase()}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{(s.required_components || []).slice(0, 3).join(', ')}</div>
                  </button>
                ))
              )}
            </div>

            {adaptResult && (
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Puzzle className="w-4 h-4 text-accent" />
                  <span className="font-heading text-[10px] tracking-wider text-accent">MODULAR ADAPTATION: {adaptResult.schematic.name?.toUpperCase()}</span>
                </div>
                <div className="font-body text-sm text-card-foreground prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{adaptResult.result}</ReactMarkdown>
                </div>
              </Card>
            )}
          </div>

          <div className="p-4 border-t border-border shrink-0">
            <Button
              onClick={adaptSchematic}
              disabled={adapting || !selectedForAdapt}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-heading text-xs tracking-wider"
            >
              {adapting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Puzzle className="w-4 h-4 mr-2" />}
              ANALYSE & ADAPT
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}