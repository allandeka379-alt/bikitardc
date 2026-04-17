'use client';

// ─────────────────────────────────────────────
// Unified cadastral map — properties, service
// requests, internal work orders and infrastructure
// projects on a single Leaflet canvas.
//
// Each layer is toggleable from the parent.
// Property coordinates are synthesised from the
// ward centroid + a deterministic jitter so the
// same property always lands on the same spot.
// ─────────────────────────────────────────────

import 'leaflet/dist/leaflet.css';
import L, { type Map as LeafletMap, type DivIcon } from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { Property } from '@/mocks/fixtures/properties';
import type { ServiceRequest } from '@/mocks/fixtures/service-requests';
import type { WorkOrder } from '@/mocks/fixtures/work-orders';

const BIKITA_CENTER: [number, number] = [-20.118, 31.62];

// Ward centroids — used to seed property lat/lng.
const WARD_CENTROIDS: Record<string, [number, number]> = {
  Nyika:     [-20.08,  31.60],
  Mupani:    [-20.18,  31.55],
  Nhema:     [-20.05,  31.70],
  Bota:      [-20.20,  31.58],
  Chikwanda: [-20.115, 31.68],
  Chikuku:   [-20.13,  31.65],
  Silveira:  [-20.09,  31.63],
  Kamungoma: [-20.110, 31.620],
  'Ward 4':  [-20.06,  31.65],
  Marecha:   [-20.04,  31.67],
  Bikita:    [-20.12,  31.63],
};

function coordForWard(ward: string, seed: string): [number, number] {
  const base = WARD_CENTROIDS[ward] ?? BIKITA_CENTER;
  // Deterministic jitter ~ up to ± 0.015°
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const dLat = ((h % 1000) / 1000 - 0.5) * 0.03;
  const dLng = (((h >> 10) % 1000) / 1000 - 0.5) * 0.03;
  return [base[0] + dLat, base[1] + dLng];
}

export interface Layers {
  properties: boolean;
  serviceRequests: boolean;
  workOrders: boolean;
  projects: boolean;
}

interface Project {
  id: string;
  title: string;
  ward: string;
  status: string;
  progress: number;
}

interface Props {
  layers: Layers;
  properties: Property[];
  serviceRequests: ServiceRequest[];
  workOrders: WorkOrder[];
  projects: Project[];
  onPropertyClick?: (p: Property) => void;
  onRequestClick?: (r: ServiceRequest) => void;
  onWorkOrderClick?: (w: WorkOrder) => void;
}

export default function CadastreMap({
  layers,
  properties,
  serviceRequests,
  workOrders,
  projects,
  onPropertyClick,
  onRequestClick,
  onWorkOrderClick,
}: Props) {
  const mapRef = useRef<LeafletMap | null>(null);

  const icons = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return {
      propertyClear:   makeIcon('#1E7F4F'),
      propertyDue:     makeIcon('#C77700'),
      propertyOverdue: makeIcon('#B42318'),
      request:         makeRingIcon('#1E5AAA'),
      workOrder:       makeSquareIcon('#1F3A68'),
      project:         makeStarIcon('#C9A227'),
    };
  }, []);

  // When the layer set changes, fit to visible markers.
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [layers]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-line bg-surface">
      <MapContainer
        ref={(m) => { if (m) mapRef.current = m; }}
        center={BIKITA_CENTER}
        zoom={11}
        minZoom={9}
        maxZoom={17}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {layers.properties && icons && properties.map((p) => {
          const pos = coordForWard(p.ward, p.id);
          const icon =
            p.balanceUsd <= 0                               ? icons.propertyClear   :
            new Date(p.nextDueAt).getTime() < Date.now()    ? icons.propertyOverdue :
                                                              icons.propertyDue;
          return (
            <Marker key={`p_${p.id}`} position={pos} icon={icon} eventHandlers={{ click: () => onPropertyClick?.(p) }}>
              <Popup>
                <div style={{ minWidth: 160, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{p.stand}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    {p.ownerName} · {p.ward}
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    Balance: ${p.balanceUsd.toFixed(2)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {layers.serviceRequests && icons && serviceRequests.map((r) => (
          <Marker key={`r_${r.id}`} position={[r.lat, r.lng]} icon={icons.request} eventHandlers={{ click: () => onRequestClick?.(r) }}>
            <Popup>
              <div style={{ minWidth: 160, fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{r.title}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{r.ward} · {r.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {layers.workOrders && icons && workOrders
          .filter((w) => w.status !== 'completed' && w.status !== 'cancelled')
          .map((w) => {
            const pos = coordForWard(w.ward, w.id);
            return (
              <Marker key={`w_${w.id}`} position={pos} icon={icons.workOrder} eventHandlers={{ click: () => onWorkOrderClick?.(w) }}>
                <Popup>
                  <div style={{ minWidth: 180, fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{w.reference}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{w.title}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{w.team} · {w.priority}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {layers.projects && icons && projects.map((pr) => {
          const pos = coordForWard(pr.ward, pr.id);
          return (
            <Marker key={`pr_${pr.id}`} position={pos} icon={icons.project}>
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#222' }}>{pr.title}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{pr.ward} · {pr.progress}% · {pr.status}</div>
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
    html: `<span style="display:block;width:18px;height:18px;border-radius:999px;background:${color};box-shadow:0 0 0 3px rgba(255,255,255,0.95),0 2px 8px rgba(17,24,39,0.22);border:1.5px solid #fff;"></span>`,
    iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -8],
  });
}
function makeRingIcon(color: string): DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:22px;height:22px;border-radius:999px;background:transparent;border:3px solid ${color};box-shadow:0 2px 8px rgba(17,24,39,0.22);"></span>`,
    iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
  });
}
function makeSquareIcon(color: string): DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:20px;height:20px;background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(17,24,39,0.22);transform:rotate(45deg);"></span>`,
    iconSize: [20, 20], iconAnchor: [10, 10], popupAnchor: [0, -10],
  });
}
function makeStarIcon(color: string): DivIcon {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:22px;height:22px;background:${color};clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);box-shadow:0 2px 8px rgba(17,24,39,0.22);"></span>`,
    iconSize: [22, 22], iconAnchor: [11, 11], popupAnchor: [0, -10],
  });
}
