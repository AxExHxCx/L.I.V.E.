const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Zap, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const categoryIcons = {
  electronic: '⚡',
  mechanical: '⚙️',
  chemical: '🧪',
  structural: '🏗️',
  optical: '🔍',
  magnetic: '🧲',
  unknown: '❓',
};

const statusStyles = {
  marked: 'border-l-chart-4',
  collected: 'border-l-primary',
  cataloged: 'border-l-chart-2',
  deployed: 'border-l-chart-5',
};

export default function ComponentCard({ component, onClick, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    await db.entities.Component.delete(component.id);
    onDelete();
    setShowConfirm(false);
  };

  return (
    <>
      <div className={`w-full text-left bg-card border border-border rounded-lg p-3 hover:border-primary/40 transition-all duration-200 border-l-2 ${statusStyles[component.status]} relative group`}>
        <button onClick={() => onClick(component)} className="w-full text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span>{categoryIcons[component.category]}</span>
                <h4 className="font-heading text-xs tracking-wider text-foreground truncate">{component.name?.toUpperCase()}</h4>
              </div>
              {component.description && (
                <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-2">{component.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="font-heading text-[9px] capitalize">{component.status}</Badge>
                {component.location_note && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                    <MapPin className="w-2.5 h-2.5" />
                    {component.location_note?.substring(0, 30)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {component.threat_level > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(component.threat_level, 5) }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-chart-3 text-chart-3" />
                  ))}
                </div>
              )}
              {component.ai_identification && (
                <Zap className="w-3 h-3 text-accent" />
              )}
            </div>
          </div>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-destructive hover:bg-destructive/10"
          title="Delete component"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-sm tracking-widest text-destructive">CONFIRM DELETION</AlertDialogTitle>
            <AlertDialogDescription className="font-body text-muted-foreground">
              Permanently purge <span className="text-foreground font-semibold">{component.name}</span> from the vault? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-heading text-xs tracking-wider">CANCEL</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-heading text-xs tracking-wider">
              PURGE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}