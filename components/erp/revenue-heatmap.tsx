'use client';

// ─────────────────────────────────────────────
// Revenue heat map (spec §3.2 Demo-Visual).
//
// Simpler than a full polygon choropleth — we
// render proportional circle markers at each
// ward's centroid. Circle area scales with the
// chosen metric (collections, outstanding, density).
// ─────────────────────────────────────────────

import 'leaflet/dist/leaflet.css';
import L, { type DivIcon, type Map as LeafletMap } from 'leaflet';
import { useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { WARDS } from '@/mocks/fixtures/wards';

export type HeatmapMetric = 'collections' | 'outstanding' | 'density';

interface Props {
  metric: HeatmapMetric;
}

const BIKITA_CENTER: [number, number] = [-20.118, 31.62];

export default function RevenueHeatmap({ metric }: Props) {
  const mapRef = useRef<LeafletMap | null>(null);

  const points = useMemo(() => {
    return WARDS.map((w) => {
      const props = PROPERTIES.filter((p) => p.ward === w.name);
      const ids = new Set(props.map((p) => p.id));
      const collections = TRANSACTIONS.filter(
        (t) => ids.has(t.propertyId) && t.status === 'succeeded',
      ).reduce((s, t) => s + t.amount, 0);
      const outstanding = props.reduce((s, p) => s + p.balanceUsd, 0);
      const density = props.length;
      return {
        ward: w.name,
        center: [w.centroid.lat, w.centroid.lng] as [number, number],
        properties: props.length,
        collections,
        outstanding,
        density,
      };
    });
  }, []);

  const max = Math.max(
    ...points.map((p) =>
      metric === 'collections' ? p.collections : metric === 'outstanding' ? p.outstanding : p.density,
    ),
    1,
  );

  const icons = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return points.map((p) => {
      const raw =
        metric === 'collections' ? p.collections : metric === 'outstanding' ? p.outstanding : p.density;
      // Area ∝ value → radius ∝ √value. Scale radius between 22 and 80.
      const ratio = raw / max;
      const radius = Math.max(22, Math.round(22 + Math.sqrt(ratio) * 58));
      const color =
        metric === 'outstanding' ? CHART_TOKENS.danger : CHART_TOKENS.primary;
      const icon: DivIcon = L.divIcon({
        className: '',
        html: `<span style="
          display:block;
          width:${radius}px;
          height:${radius}px;
          border-radius:999px;
          background:${color}22;
          border:2px solid ${color};
          box-shadow:0 0 0 4px rgba(255,255,255,0.6), 0 6px 14px rgba(17,24,39,0.14);
          position:relative;
        ">
          <span style="
            position:absolute;
            inset:0;
            display:flex;
            align-items:center;
            justify-content:center;
            font-family:Inter,system-ui,sans-serif;
            font-weight:700;
            font-size:${radius > 50 ? 13 : 11}px;
            color:${color};
          ">${p.ward}</span>
        </span>`,
        iconSize: [radius, radius],
        iconAnchor: [radius / 2, radius / 2],
      });
      return { point: p, icon };
    });
  }, [points, metric, max]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-line bg-surface">
      <MapContainer
        ref={(m) => {
          if (m) mapRef.current = m;
        }}
        center={BIKITA_CENTER}
        zoom={10}
        minZoom={9}
        maxZoom={14}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {icons.map(({ point, icon }) => (
          <Marker key={point.ward} position={point.center} icon={icon}>
            <Popup>
              <div style={{ minWidth: 180, fontFamily: 'Inter, system-ui, sans-serif' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#222', marginBottom: 4 }}>
                  {point.ward} ward
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>
                  <div>Properties: <strong>{point.properties}</strong></div>
                  <div>Collections: <strong>${point.collections.toFixed(0)}</strong></div>
                  <div>Outstanding: <strong>${point.outstanding.toFixed(0)}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
