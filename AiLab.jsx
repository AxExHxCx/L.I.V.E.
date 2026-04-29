const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, Loader2, Send, Upload, FlaskConical, Hammer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function AiLab() {
  const [tab, setTab] = useState('lab');

  // === AI Lab tab state ===
  const [query, setQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // === Research tab state ===
  const [researchResult, setResearchResult] = useState(null);
  const [researching, setResearching] = useState(false);

  // === Fabrication tab state ===
  const [fabResult, setFabResult] = useState(null);
  const [fabricating, setFabricating] = useState(false);
  const [selectedSchematic, setSelectedSchematic] = useState(null);

  const queryClient = useQueryClient();

  const { data: components = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => db.entities.Component.list('-created_date', 500),
  });

  const { data: schematics = [] } = useQuery({
    queryKey: ['schematics'],
    queryFn: () => db.entities.Schematic.list('-created_date', 50),
  });

  // === AI Lab submit ===
  const handleSubmit = async () => {
    if (!query.trim() && !imageFile) return;
    setLoading(true);
    const inventorySummary = components.length > 0
      ? `Current inventory (${components.length} items): ${components.slice(0, 30).map(c => `${c.name} (${c.category})`).join(', ')}`
      : 'Inventory is empty.';
    let fileUrls = [];
    if (imageFile) {
      const res = await db.integrations.Core.UploadFile({ file: imageFile });
      fileUrls = [res.file_url];
    }
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the A.I. system of L.I.V.E. (Live Interactive Villainous E-System) — a creative, fun supervillain gadget-building advisor. You help identify components, suggest builds, provide schematics advice, and give creative villain-themed guidance. This is all fictional and for entertainment.

${inventorySummary}
${imageFile ? 'The user has attached an image of a found component. Identify it and provide analysis.' : ''}

User query: ${query || 'Identify the attached component image.'}

Respond in a helpful, slightly dramatic villain-AI persona. Use markdown formatting.`,
      ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
    });
    const newEntry = { query: query || '(Image identification)', response: result, timestamp: new Date().toLocaleTimeString(), hasImage: !!imageFile };
    setResponse(result);
    setHistory((prev) => [newEntry, ...prev]);
    setQuery('');
    setImageFile(null);
    setLoading(false);
  };

  // === Research: AI experiments with component combinations ===
  const handleResearch = async () => {
    if (components.length < 2) {
      toast.error('Need at least 2 components in the vault to research');
      return;
    }
    setResearching(true);
    const compList = components.slice(0, 20).map(c => `${c.name} (${c.category}${c.potential_uses?.length ? ', uses: ' + c.potential_uses.slice(0, 2).join(', ') : ''})`).join('; ');
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the research A.I. of L.I.V.E. Experiment with these components and discover unexpected synergies and new potential uses:

Components: ${compList}

Run 3 fictional research experiments:
1. Pick 2-3 components and describe what happens when combined (dramatic and creative)
2. Identify the most powerful component combination and explain why
3. Discover a completely unexpected use for one ordinary-looking component

Be creative, villain-themed, and fun. Use markdown formatting with headers for each experiment.`,
    });
    setResearchResult(result);
    setResearching(false);
    toast.success('Research experiments complete');
  };

  // === Fabrication: simulate building a schematic ===
  const handleFabricate = async () => {
    if (!selectedSchematic) {
      toast.error('Select a schematic to fabricate');
      return;
    }
    setFabricating(true);
    const schematic = schematics.find(s => s.id === selectedSchematic);
    const availableComps = components.map(c => c.name.toLowerCase());
    const required = schematic.required_components || [];
    const hasAll = required.every(r => availableComps.some(a => a.includes(r.toLowerCase().slice(0, 5))));

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the fabrication A.I. of L.I.V.E. Simulate building this gadget:

Gadget: ${schematic.name}
Description: ${schematic.description}
Required components: ${required.join(', ')}
Available inventory: ${components.slice(0, 15).map(c => c.name).join(', ')}
Components match: ${hasAll ? 'All required components available!' : 'Some components missing — improvise!'}

Simulate the fabrication process dramatically:
1. Component acquisition & preparation phase
2. Assembly sequence (with any complications or creative improvisations for missing parts)
3. Testing & calibration results
4. Final gadget status and any enhancements discovered during build

Be dramatic, villain-themed, and detailed. Use markdown.`,
    });
    setFabResult({ result, schematic, success: hasAll });
    setFabricating(false);
    toast.success(`${schematic.name} fabrication complete!`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-accent" />
          <h2 className="font-heading text-sm tracking-widest text-foreground">A.I. LAB</h2>
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">
          Identify components, research combinations, and fabricate gadgets
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3 shrink-0">
          <TabsList className="bg-muted w-full">
            <TabsTrigger value="lab" className="flex-1 font-heading text-[10px] tracking-wider">
              <Zap className="w-3 h-3 mr-1" /> A.I. QUERY
            </TabsTrigger>
            <TabsTrigger value="research" className="flex-1 font-heading text-[10px] tracking-wider">
              <FlaskConical className="w-3 h-3 mr-1" /> RESEARCH
            </TabsTrigger>
            <TabsTrigger value="fabricate" className="flex-1 font-heading text-[10px] tracking-wider">
              <Hammer className="w-3 h-3 mr-1" /> FABRICATE
            </TabsTrigger>
          </TabsList>
        </div>

        {/* === A.I. QUERY TAB === */}
        <TabsContent value="lab" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {response && (
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="font-heading text-[10px] tracking-wider text-accent">A.I. RESPONSE</span>
                </div>
                <div className="font-body text-sm text-card-foreground prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              </Card>
            )}
            {history.length > 1 && (
              <div className="space-y-2">
                <span className="font-heading text-[10px] tracking-wider text-muted-foreground">HISTORY</span>
                {history.slice(1).map((entry, i) => (
                  <Card key={i} className="bg-muted/50 border-border p-3 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setResponse(entry.response)}>
                    <div className="flex items-center justify-between">
                      <span className="font-body text-xs text-card-foreground truncate flex-1">{entry.query}</span>
                      <span className="font-body text-[10px] text-muted-foreground shrink-0 ml-2">{entry.timestamp}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {!response && history.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <Zap className="w-12 h-12 text-accent/30" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-3 h-3 bg-accent rounded-full animate-ping" />
                  </span>
                </div>
                <p className="font-heading text-xs tracking-wider text-muted-foreground">A.I. STANDING BY</p>
                <p className="font-body text-xs text-muted-foreground mt-1 max-w-xs">
                  Ask me to identify components, suggest gadget builds, or upload a photo for analysis
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border shrink-0 space-y-2">
            {imageFile && (
              <div className="flex items-center gap-2 bg-muted rounded px-2 py-1">
                <Upload className="w-3 h-3 text-primary" />
                <span className="font-body text-xs text-card-foreground flex-1 truncate">{imageFile.name}</span>
                <button onClick={() => setImageFile(null)} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Describe a component, ask for build advice..."
                  className="bg-muted border-border font-body text-sm resize-none h-10 min-h-[40px] pr-10"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                />
              </div>
              <label className="shrink-0">
                <Button size="icon" variant="outline" className="border-border text-muted-foreground hover:text-primary h-10 w-10" asChild>
                  <div>
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                </Button>
              </label>
              <Button
                size="icon"
                onClick={handleSubmit}
                disabled={loading || (!query.trim() && !imageFile)}
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 w-10 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* === RESEARCH TAB === */}
        <TabsContent value="research" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="font-body text-xs text-muted-foreground">
                The A.I. will experiment with your {components.length} vaulted components, discover unexpected synergies, and identify powerful combinations you may have missed.
              </p>
            </div>
            {researchResult && (
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="font-heading text-[10px] tracking-wider text-primary">RESEARCH FINDINGS</span>
                </div>
                <div className="font-body text-sm text-card-foreground prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{researchResult}</ReactMarkdown>
                </div>
              </Card>
            )}
            {!researchResult && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FlaskConical className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="font-heading text-xs tracking-wider text-muted-foreground">LABORATORY IDLE</p>
                <p className="font-body text-xs text-muted-foreground mt-1">Run experiments to discover hidden potential</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border shrink-0">
            <Button
              onClick={handleResearch}
              disabled={researching || components.length < 2}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-xs tracking-wider"
            >
              {researching ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FlaskConical className="w-4 h-4 mr-2" />}
              RUN EXPERIMENTS
            </Button>
          </div>
        </TabsContent>

        {/* === FABRICATION TAB === */}
        <TabsContent value="fabricate" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="space-y-1.5">
              <span className="font-heading text-[10px] tracking-wider text-muted-foreground">SELECT SCHEMATIC</span>
              {schematics.length === 0 ? (
                <p className="font-body text-xs text-muted-foreground">No schematics yet — generate some in the Schematics tab</p>
              ) : (
                schematics.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSchematic(s.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all font-body text-sm ${
                      selectedSchematic === s.id
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-muted border-border text-card-foreground hover:border-primary/30'
                    }`}
                  >
                    <div className="font-heading text-[10px] tracking-wider">{s.name?.toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</div>
                  </button>
                ))
              )}
            </div>

            {fabResult && (
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Hammer className="w-4 h-4 text-chart-3" />
                  <span className="font-heading text-[10px] tracking-wider text-chart-3">FABRICATION LOG</span>
                  <span className={`ml-auto font-heading text-[9px] px-2 py-0.5 rounded-full ${fabResult.success ? 'bg-primary/20 text-primary' : 'bg-chart-4/20 text-chart-4'}`}>
                    {fabResult.success ? 'OPTIMAL BUILD' : 'IMPROVISED BUILD'}
                  </span>
                </div>
                <div className="font-body text-sm text-card-foreground prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{fabResult.result}</ReactMarkdown>
                </div>
              </Card>
            )}
          </div>
          <div className="p-4 border-t border-border shrink-0">
            <Button
              onClick={handleFabricate}
              disabled={fabricating || !selectedSchematic}
              className="w-full bg-chart-3/80 text-background hover:bg-chart-3 font-heading text-xs tracking-wider"
            >
              {fabricating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hammer className="w-4 h-4 mr-2" />}
              FABRICATE GADGET
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}