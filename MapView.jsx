import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crosshair } from 'lucide-react';

const categoryColors = {
  electronic: '#00e68a',
  mechanical: '#9945ff',
  chemical: '#ffaa00',
  structural: '#4488ff',
  optical: '#ff4488',
  magnetic: '#00ccff',
  unknown: '#888888',
};

function createMarkerIcon(category, status) {
  const color = categoryColors[category] || categoryColors.unknown;
  const collected = status === 'collected' || status === 'cataloged' || status === 'deployed';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 24px; height: 24px;
      background: ${collected ? color : 'transparent'};
      border: 2px solid ${color};
      border-radius: 50%;
      box-shadow: 0 0 12px ${color}66, 0 0 4px ${color}44;
      display: flex; align-items: center; justify-content: center;
      position: relative;
    ">
      <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>
      ${!collected ? `<div style="
        position: absolute; inset: -4px;
        border: 1px solid ${color}44;
        border-radius: 50%;
        animation: villain-pulse 2s infinite;
      "></div>` : ''}
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function LocateButton() {
  const map = useMap();
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };
  return (
    <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
      <div className="leaflet-control m-3">
        <Button
          size="icon"
          variant="outline"
          onClick={handleLocate}
          className="bg-card border-border text-primary hover:bg-muted h-9 w-9"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function MapView({ components, onMapClick, onMarkerClick, isPlacing }) {
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([40.7128, -74.006])
    );
  }, []);

  if (!userPos) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-heading text-xs text-primary tracking-widest">ACQUIRING COORDINATES...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${isPlacing ? 'cursor-crosshair' : ''}`}>
      {isPlacing && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-accent/90 text-accent-foreground px-4 py-1.5 rounded-full font-heading text-xs tracking-wider backdrop-blur-sm border border-accent">
          TAP MAP TO MARK LOCATION
        </div>
      )}
      <MapContainer
        center={userPos}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />
        <LocateButton />
        {isPlacing && <MapClickHandler onMapClick={onMapClick} />}
        {components.map((comp) => (
          <Marker
            key={comp.id}
            position={[comp.latitude, comp.longitude]}
            icon={createMarkerIcon(comp.category, comp.status)}
            eventHandlers={{ click: () => onMarkerClick(comp) }}
          >
            <Popup className="villain-popup">
              <div className="font-body text-sm">
                <strong className="font-heading text-xs">{comp.name}</strong>
                <br />
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {comp.category}
                </Badge>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}