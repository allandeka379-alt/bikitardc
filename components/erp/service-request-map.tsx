'use client';

// ─────────────────────────────────────────────
// Service-request Leaflet map
//
// Dynamically loaded (SSR-unsafe). Renders each
// request as a colour-coded div-icon marker; click
// fires the parent-side callback to open the panel.
// Uses free OpenStreetMap tiles.
// ─────────────────────────────────────────────

import 'leaflet/dist/leaflet.css';
import L, { type Map as LeafletMap, type DivIcon } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import {
  STATUS_COLOR,
  STATUS_LABEL,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { useAllServiceRequests } from '@/lib/hooks/use-service-requests';

interface Props {
  onSelect: (r: ServiceRequest) => void;
  selectedId?: string | null;
}

const BIKITA_CENTER: [number, number] = [-20.118, 31.62];

export default function ServiceRequestMap({ onSelect, selectedId }: Props) {
  const requests = useAllServiceRequests();
  const mapRef = useRef<LeafletMap | null>(null);

  // Build a small div-icon cache — one per status colour.
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const cache: Record<RequestStatus, DivIcon> = {
      open:          makeIcon(STATUS_COLOR.open.dot),
      assigned:      makeIcon(STATUS_COLOR.assigned.dot),
      'in-progress': makeIcon(STATUS_COLOR['in-progress'].dot),
      resolved:      makeIcon(STATUS_COLOR.resolved.dot),
      reopened:      makeIcon(STATUS_COLOR.reopened.dot),
    };
    return cache;
  }, []);

  // Pan to the selected marker
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const req = requests.find((r) => r.id === selectedId);
    if (req) mapRef.current.flyTo([req.lat, req.lng], 13, { duration: 0.6 });
  }, [selectedId, requests]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-line bg-surface">
      <MapContainer
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        center={BIKITA_CENTER}
        zoom={11}
        minZoom={9}
        maxZoom={17}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {requests.map((r) => {
          const currentStatus = r.status as RequestStatus;
          const icon = (icons as Record<RequestStatus, DivIcon>)[currentStatus];
          if (!icon) return null;
          return (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={icon}
              eventHandlers={{ click: () => onSelect(r) }}
            >
              <Popup>
                <div style={{ minWidth: 160, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{r.title}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    {r.ward} · {STATUS_LABEL[currentStatus]}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function makeIcon(color: string): DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="
      display:block;
      width:22px;
      height:22px;
      border-radius:999px;
      background:${color};
      box-shadow:0 0 0 3px rgba(255,255,255,0.95), 0 2px 8px rgba(17,24,39,0.22);
      border:1.5px solid #fff;
      transition:transform 200ms cubic-bezier(0.16,1,0.3,1);
    "></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}
