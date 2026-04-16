'use client';

// ─────────────────────────────────────────────
// Location picker — click-to-pin Leaflet map
// used by the business licence and report-issue
// wizards (spec §7.2, §3.1).
//
// Dynamic import is handled by the parent.
// ─────────────────────────────────────────────

import 'leaflet/dist/leaflet.css';
import L, { type LeafletMouseEvent, type Map as LeafletMap } from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';

interface Props {
  value: [number, number] | null;
  onChange: (latlng: [number, number]) => void;
  defaultCenter?: [number, number];
}

const BIKITA_CENTER: [number, number] = [-20.118, 31.62];

export default function LocationPicker({ value, onChange, defaultCenter = BIKITA_CENTER }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);

  // Fly to the current value when it changes externally
  useEffect(() => {
    if (!value || !mapRef.current) return;
    mapRef.current.flyTo(value, 15, { duration: 0.6 });
  }, [value]);

  return (
    <div className="h-[320px] w-full overflow-hidden rounded-md border border-line">
      <MapContainer
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        center={value ?? defaultCenter}
        zoom={value ? 15 : 11}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onClick={onChange} />
        {value && <Marker position={value} icon={pinIcon()} />}
      </MapContainer>
    </div>
  );
}

function ClickHandler({ onClick }: { onClick: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      onClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function pinIcon() {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;
      width:22px;
      height:22px;
      border-radius:999px;
      background:#1F3A68;
      box-shadow:0 0 0 3px rgba(255,255,255,0.95), 0 2px 8px rgba(17,24,39,0.22);
      border:1.5px solid #fff;
    "></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
