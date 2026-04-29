const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Plus, X, AlertTriangle } from 'lucide-react';
import MapView from '@/components/map/MapView';
import MarkerForm from '@/components/map/MarkerForm';
import ComponentDetail from '@/components/map/ComponentDetail';
import ThreatOverlay from '@/components/map/ThreatOverlay';
import { toast } from 'sonner';

export default function MapDashboard() {
  const [isPlacing, setIsPlacing] = useState(false);
  const [placingLatlng, setPlacingLatlng] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showThreatOverlay, setShowThreatOverlay] = useState(false);

  const queryClient = useQueryClient();

  const { data: components = [] } = useQuery({
    queryKey: ['components'],
    queryFn: () => db.entities.Component.list('-created_date', 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Component.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setPlacingLatlng(null);
      setIsPlacing(false);
      toast.success('Component logged to the grid');
    },
  });

  const handleMapClick = (latlng) => {
    setPlacingLatlng(latlng);
    setIsPlacing(false);
  };

  const handleMarkerClick = (comp) => {
    setSelectedComponent(comp);
    setPlacingLatlng(null);
  };

  return (
    <div className="relative w-full h-full">
      <MapView
        components={components}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        isPlacing={isPlacing}
      />

      {/* Stats overlay - only when no side panel */}
      {!placingLatlng && !selectedComponent && (
        <div className="absolute top-3 left-3 z-[1000] flex gap-2">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5">
            <span className="font-heading text-[9px] tracking-wider text-muted-foreground block">LOGGED</span>
            <span className="font-heading text-lg text-primary leading-none">{components.length}</span>
          </div>
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5">
            <span className="font-heading text-[9px] tracking-wider text-muted-foreground block">COLLECTED</span>
            <span className="font-heading text-lg text-foreground leading-none">
              {components.filter((c) => c.status !== 'marked').length}
            </span>
          </div>
          <Button
            size="icon"
            onClick={() => setShowThreatOverlay(v => !v)}
            className={`h-9 w-9 backdrop-blur-sm font-heading text-[10px] transition-all ${
              showThreatOverlay
                ? 'bg-chart-4 text-white hover:bg-chart-4/90'
                : 'bg-card/90 border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
            }`}
            title="Global Intel Feed"
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Global threat overlay */}
      {showThreatOverlay && !placingLatlng && !selectedComponent && (
        <ThreatOverlay onClose={() => setShowThreatOverlay(false)} />
      )}

      {/* Placing instruction banner */}
      {isPlacing && !placingLatlng && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000]" />
      )}

      {/* Floating action button */}
      {!isPlacing && !placingLatlng && !selectedComponent && (
        <div className="absolute bottom-6 right-4 z-[1000]">
          <Button
            onClick={() => setIsPlacing(true)}
            className="rounded-full w-14 h-14 bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {isPlacing && !placingLatlng && (
        <div className="absolute bottom-6 right-4 z-[1000]">
          <Button
            onClick={() => setIsPlacing(false)}
            variant="outline"
            className="rounded-full w-14 h-14 border-destructive text-destructive hover:bg-destructive/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Side panel */}
      {(placingLatlng || selectedComponent) && (
        <div className="absolute top-3 right-3 bottom-3 w-80 max-w-[calc(100%-24px)] z-[1000]">
          {placingLatlng && (
            <MarkerForm
              latlng={placingLatlng}
              onSave={(data) => createMutation.mutate(data)}
              onCancel={() => setPlacingLatlng(null)}
            />
          )}
          {selectedComponent && !placingLatlng && (
            <ComponentDetail
              component={selectedComponent}
              onClose={() => setSelectedComponent(null)}
              onUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['components'] });
                setSelectedComponent(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}