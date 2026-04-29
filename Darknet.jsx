const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Send, Zap, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

const CHANNEL_COLORS = {
  open: 'text-muted-foreground border-muted-foreground/30',
  alliance: 'text-primary border-primary/30',
  trade: 'text-chart-3 border-chart-3/30',
  intelligence: 'text-accent border-accent/30',
};

const VILLAIN_ALIASES = [
  'Dr. Nemesis', 'The Architect', 'Shadow Prime', 'Void Baron',
  'Agent Null', 'The Strategist', 'Iron Specter', 'Countess Oblivion',
];

export default function Darknet() {
  const [alias, setAlias] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState('open');
  const [sending, setSending] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['darknet-messages'],
    queryFn: () => db.entities.DarknetMessage.list('-created_date', 100),
    refetchInterval: 10000,
  });

  const sendMessage = async () => {
    if (!alias.trim() || !message.trim()) {
      toast.error('Alias and message required');
      return;
    }
    setSending(true);
    await db.entities.DarknetMessage.create({ sender_alias: alias, message, channel, is_ai_generated: false });
    queryClient.invalidateQueries({ queryKey: ['darknet-messages'] });
    setMessage('');
    setSending(false);
    toast.success('Message transmitted');
  };

  const generateAiMessage = async () => {
    setAiGenerating(true);
    const randomAlias = VILLAIN_ALIASES[Math.floor(Math.random() * VILLAIN_ALIASES.length)];
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are ${randomAlias}, a fictional supervillain, sending a cryptic message on the L.I.V.E. villain darknet. 
Channel: ${channel}
Write a short, dramatic, cryptic message in character — could be an alliance offer, a trade proposal, intelligence tip, or a veiled threat.
Keep it under 3 sentences. Make it feel mysterious and villain-esque. Purely fictional entertainment.`,
    });
    await db.entities.DarknetMessage.create({
      sender_alias: randomAlias,
      message: result,
      channel,
      is_ai_generated: true,
    });
    queryClient.invalidateQueries({ queryKey: ['darknet-messages'] });
    setAiGenerating(false);
    toast.success(`Transmission intercepted from ${randomAlias}`);
  };

  const filteredMessages = messages.filter(m => channel === 'open' ? true : m.channel === channel);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-5 h-5 text-accent" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-chart-4 rounded-full animate-ping" />
          </div>
          <h2 className="font-heading text-sm tracking-widest text-foreground">DARKNET COMMS</h2>
          <Lock className="w-3 h-3 text-muted-foreground ml-auto" />
        </div>
        <p className="font-body text-xs text-muted-foreground mt-1">Encrypted villain network — intercept and transmit intelligence</p>
      </div>

      {/* Channel selector */}
      <div className="px-4 pt-3 pb-2 border-b border-border shrink-0">
        <div className="flex gap-1.5 overflow-x-auto">
          {['open', 'alliance', 'trade', 'intelligence'].map(ch => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`font-heading text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
                channel === ch
                  ? CHANNEL_COLORS[ch] + ' bg-muted'
                  : 'text-muted-foreground border-transparent hover:border-border'
              }`}
            >
              {ch.toUpperCase()}
            </button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={generateAiMessage}
            disabled={aiGenerating}
            className="ml-auto border-accent text-accent hover:bg-accent/10 font-heading text-[9px] tracking-wider h-7 px-2 shrink-0"
          >
            {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
            INTERCEPT
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Radio className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-heading text-[10px] tracking-wider text-muted-foreground">NO TRANSMISSIONS</p>
            <p className="font-body text-xs text-muted-foreground mt-1">The channel is silent... for now</p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            const chanColor = CHANNEL_COLORS[msg.channel] || CHANNEL_COLORS.open;
            return (
              <div key={msg.id} className={`bg-card border rounded-lg p-3 ${msg.is_ai_generated ? 'border-accent/30' : 'border-border'}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-[10px] tracking-wider text-foreground">{msg.sender_alias}</span>
                    {msg.is_ai_generated && (
                      <Badge className="font-heading text-[8px] bg-accent/10 text-accent border-accent/30">INTERCEPTED</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`font-heading text-[8px] ${chanColor}`}>{msg.channel}</Badge>
                    <span className="font-body text-[9px] text-muted-foreground">
                      {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="font-body text-sm text-card-foreground leading-relaxed">{msg.message}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Compose */}
      <div className="p-4 border-t border-border shrink-0 space-y-2">
        <Input
          value={alias}
          onChange={e => setAlias(e.target.value)}
          placeholder="Your villain alias..."
          className="bg-muted border-border font-heading text-xs tracking-wider"
        />
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Transmit your message..."
            className="bg-muted border-border font-body text-sm resize-none h-10 min-h-[40px] flex-1"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={sending || !alias.trim() || !message.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 w-10 shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}