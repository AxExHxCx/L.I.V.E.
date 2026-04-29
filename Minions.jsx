const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Plus, Zap, Loader2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import MinionCard from '@/components/minions/MinionCard';
import MinionForm from '@/components/minions/MinionForm';
import MinionDetail from '@/components/minions/MinionDetail';

export default function Minions() {
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const queryClient = useQueryClient();

  const { data: minions = [], isLoading } = useQuery({
    queryKey: ['minions'],
    queryFn: () => db.entities.Minion.list('-created_date', 200),
  });

  const { data: components = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => db.entities.Component.list('-created_date', 200),
  });

  const handleCreate = async (data) => {
    await db.entities.Minion.create(data);
    queryClient.invalidateQueries({ queryKey: ['minions'] });
    setShowForm(false);
    toast.success('Minion recruited!');
  };

  const optimizeDeployment = async () => {
    if (minions.length === 0) {
      toast.error('No minions to deploy!');
      return;
    }
    setOptimizing(true);
    const minionList = minions.map(m => `${m.name} (${m.specialty}, skill: ${m.skill_level || 5}, status: ${m.status})`).join(', ');
    const compList = components.slice(0, 10).map(c => `${c.name} (${c.category}, status: ${c.status})`).join(', ');

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are the tactical A.I. system of L.I.V.E. Optimize the deployment of these minions based on their skills.
      
Minions: ${minionList}
Components needing collection: ${compList}

Assign each idle minion a specific task. Be creative and dramatic but keep it fictional/fun.`,
      response_json_schema: {
        type: 'object',
        properties: {
          assignments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                minion_name: { type: 'string' },
                task: { type: 'string' },
                location: { type: 'string' },
              },
            },
          },
        },
      },
    });

    for (const assignment of (result.assignments || [])) {
      const minion = minions.find(m => m.name === assignment.minion_name);
      if (minion) {
        await db.entities.Minion.update(minion.id, {
          current_task: assignment.task,
          task_location: assignment.location,
          status: 'on_mission',
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['minions'] });
    setOptimizing(false);
    toast.success('Deployment optimized by A.I.!');
  };

  const statusCounts = {
    idle: minions.filter(m => m.status === 'idle').length,
    on_mission: minions.filter(m => m.status === 'on_mission').length,
    injured: minions.filter(m => m.status === 'injured').length,
  };

  if (selected) {
    return (
      <div className="h-full p-4 overflow-y-auto">
        <MinionDetail
          minion={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ['minions'] });
            setSelected(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-sm tracking-widest text-foreground">MINION CORPS</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={optimizeDeployment}
              disabled={optimizing}
              className="border-accent text-accent hover:bg-accent/10 font-heading text-[10px] tracking-wider"
            >
              {optimizing ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Zap className="w-3 h-3 mr-1" />}
              A.I. DEPLOY
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading text-[10px] tracking-wider"
            >
              <Plus className="w-3 h-3 mr-1" />
              RECRUIT
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-muted rounded-md px-3 py-1.5 flex-1 text-center">
            <div className="font-heading text-xs text-primary">{statusCounts.idle}</div>
            <div className="font-heading text-[8px] text-muted-foreground tracking-wider">IDLE</div>
          </div>
          <div className="bg-muted rounded-md px-3 py-1.5 flex-1 text-center">
            <div className="font-heading text-xs text-chart-3">{statusCounts.on_mission}</div>
            <div className="font-heading text-[8px] text-muted-foreground tracking-wider">DEPLOYED</div>
          </div>
          <div className="bg-muted rounded-md px-3 py-1.5 flex-1 text-center">
            <div className="font-heading text-xs text-chart-4">{statusCounts.injured}</div>
            <div className="font-heading text-[8px] text-muted-foreground tracking-wider">INJURED</div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="p-4 border-b border-border shrink-0">
          <MinionForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : minions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="font-heading text-xs tracking-wider text-muted-foreground">NO MINIONS RECRUITED</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Every villain needs a loyal crew</p>
          </div>
        ) : (
          minions.map(m => (
            <MinionCard
              key={m.id}
              minion={m}
              onClick={setSelected}
              onDelete={() => queryClient.invalidateQueries({ queryKey: ['minions'] })}
            />
          ))
        )}
      </div>
    </div>
  );
}