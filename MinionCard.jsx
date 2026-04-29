const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trash2, Star } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusStyles = {
  idle: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30',
  on_mission: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  injured: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
  mia: 'bg-destructive/20 text-destructive border-destructive/30',
};

const specialtyIcons = {
  infiltration: '🥷',
  engineering: '🔧',
  combat: '⚔️',
  recon: '🔭',
  logistics: '📦',
  hacking: '💻',
};

export default function MinionCard({ minion, onClick, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await db.entities.Minion.delete(minion.id);
    onDelete();
    setShowConfirm(false);
  };

  return (
    <>
      <div className="relative group bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-all duration-200 cursor-pointer"
        onClick={() => onClick(minion)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl">{specialtyIcons[minion.specialty] || '👤'}</span>
            <div className="min-w-0">
              <h4 className="font-heading text-xs tracking-wider text-foreground truncate">{minion.name?.toUpperCase()}</h4>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge variant="outline" className="font-heading text-[9px] capitalize">{minion.specialty}</Badge>
                <Badge className={`font-heading text-[9px] border ${statusStyles[minion.status]}`}>{minion.status?.replace('_', ' ')}</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {minion.skill_level > 0 && (
              <div className="flex gap-0.5">
                {Array.from({ length: Math.min(minion.skill_level, 10) }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 5 ? 'bg-primary' : 'bg-accent'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
        {minion.current_task && (
          <p className="font-body text-[10px] text-muted-foreground mt-2 leading-relaxed line-clamp-1">
            ▶ {minion.current_task}
          </p>
        )}
        <button
          onClick={e => { e.stopPropagation(); setShowConfirm(true); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-sm tracking-widest text-destructive">TERMINATE MINION</AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              Permanently dismiss <span className="text-foreground font-semibold">{minion.name}</span>? This action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-heading text-xs tracking-wider">CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-heading text-xs tracking-wider">
              DISMISS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}