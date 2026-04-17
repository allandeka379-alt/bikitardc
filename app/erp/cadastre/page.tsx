// Unified cadastral map — every stand, service request,
// work order and infrastructure project on one canvas.

'use client';

import { Eye, EyeOff, Info, MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { WORK_ORDERS } from '@/mocks/fixtures/work-orders';
import { WARDS } from '@/mocks/fixtures/wards';
import { cn } from '@/lib/cn';

const CadastreMap = dynamic(() => import('@/components/erp/cadastre-map'), { ssr: false, loading: () => <MapSkeleton /> });

// Infrastructure projects (derived from the existing landing
// Building Bikita fixture-equivalent but kept inline here so the
// cadastre page has a self-contained list of points).
const PROJECTS = [
  { id: 'p_kamungoma_signals', title: 'Kamungoma solar traffic signals',  ward: 'Kamungoma', status: 'live',     progress: 100 },
  { id: 'p_kamungoma_road',    title: 'Kamungoma dual carriageway',       ward: 'Kamungoma', status: 'active',   progress:  95 },
  { id: 'p_solar_streetlights',title: 'Solar street-lighting rollout',    ward: 'Nyika',     status: 'active',   progress:  72 },
  { id: 'p_rural_electrif',    title: 'Rural electrification',            ward: 'Bota',      status: 'active',   progress:  58 },
  { id: 'p_dam_rehab',         title: 'Dam rehabilitation — Siya',        ward: 'Nhema',     status: 'planning', progress:  40 },
  { id: 'p_signage',           title: 'Signage & road safety corridor',   ward: 'Mupani',    status: 'active',   progress:  30 },
];

export default function CadastrePage() {
  const [layers, setLayers] = useState({
    properties: true,
    serviceRequests: true,
    workOrders: true,
    projects: true,
  });

  const toggle = (k: keyof typeof layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));

  const counts = useMemo(() => ({
    properties: PROPERTIES.length,
    serviceRequests: SERVICE_REQUESTS.length,
    workOrders: WORK_ORDERS.filter((w) => w.status !== 'completed' && w.status !== 'cancelled').length,
    projects: PROJECTS.length,
  }), []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Cadastral map</h1>
            <p className="mt-1 text-small text-muted">
              Every stand, open service request, active work order and live capital project on one canvas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-small text-muted">
            <MapPin className="h-4 w-4" /> {WARDS.length}+ wards mapped
          </div>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Layer panel */}
        <Card className="h-fit p-4">
          <h2 className="text-body font-semibold text-ink">Layers</h2>
          <p className="mt-1 text-micro text-muted">Toggle visibility by data type.</p>
          <ul className="mt-3 flex flex-col gap-1">
            <LayerRow active={layers.properties}      count={counts.properties}      onToggle={() => toggle('properties')}      colorDot="bg-success"          label="Properties (stands)" sublabel="Coloured by balance tier" />
            <LayerRow active={layers.serviceRequests} count={counts.serviceRequests} onToggle={() => toggle('serviceRequests')} colorDot="ring-info"           label="Service requests" sublabel="Citizen-reported issues" />
            <LayerRow active={layers.workOrders}      count={counts.workOrders}      onToggle={() => toggle('workOrders')}      colorDot="bg-brand-primary"    label="Work orders" sublabel="Internal open / in progress" />
            <LayerRow active={layers.projects}        count={counts.projects}        onToggle={() => toggle('projects')}        colorDot="bg-brand-accent star" label="Capital projects" sublabel="Building Bikita programme" />
          </ul>

          <div className="mt-5 rounded-md border border-brand-primary/15 bg-brand-primary/5 p-3 text-micro text-brand-primary">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <p>Property pins are synthesised from ward centroids for the demo. In production they draw directly from the GIS cadastre.</p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-2 text-micro font-semibold uppercase tracking-wide text-muted">Property tiers</div>
            <ul className="flex flex-col gap-1.5 text-micro">
              <li className="inline-flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-success" />Clear</li>
              <li className="inline-flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />Due soon</li>
              <li className="inline-flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 rounded-full bg-danger" />Overdue</li>
            </ul>
          </div>
        </Card>

        {/* Map */}
        <div className="h-[620px]">
          <CadastreMap
            layers={layers}
            properties={PROPERTIES}
            serviceRequests={SERVICE_REQUESTS}
            workOrders={WORK_ORDERS}
            projects={PROJECTS}
          />
        </div>
      </div>

      {/* Ward summary */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-body font-semibold text-ink">Ward summary</h2>
          <p className="mt-0.5 text-micro text-muted">Points per ward across all active layers.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-right">Properties</th>
                <th className="px-5 py-3 text-right">Service requests</th>
                <th className="px-5 py-3 text-right">Work orders</th>
                <th className="px-5 py-3 text-right">Capital projects</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set([
                ...PROPERTIES.map((p) => p.ward),
                ...SERVICE_REQUESTS.map((r) => r.ward),
                ...WORK_ORDERS.map((w) => w.ward),
                ...PROJECTS.map((p) => p.ward),
              ])].sort().map((ward) => {
                const props = PROPERTIES.filter((p) => p.ward === ward).length;
                const reqs  = SERVICE_REQUESTS.filter((r) => r.ward === ward).length;
                const wos   = WORK_ORDERS.filter((w) => w.ward === ward && w.status !== 'completed' && w.status !== 'cancelled').length;
                const projs = PROJECTS.filter((p) => p.ward === ward).length;
                return (
                  <tr key={ward} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3 font-semibold text-ink">{ward}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{props || '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{reqs  || '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{wos   || '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted">{projs || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function LayerRow({ active, count, onToggle, colorDot, label, sublabel }: {
  active: boolean; count: number; onToggle: () => void; colorDot: string; label: string; sublabel: string;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors',
          active ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-line bg-card hover:bg-surface',
        )}
      >
        <span className={cn('grid h-6 w-6 place-items-center rounded-md', active ? 'bg-brand-primary/10 text-brand-primary' : 'bg-surface text-muted')}>
          {active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </span>
        <span className={cn('h-3 w-3 shrink-0 rounded-full ring-2 ring-offset-0', colorDot)} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-small font-semibold text-ink">{label}</span>
          <span className="block truncate-line text-micro text-muted">{sublabel}</span>
        </span>
        <Badge tone={active ? 'brand' : 'neutral'}>{count}</Badge>
      </button>
    </li>
  );
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-line bg-surface">
      <div className="text-micro text-muted">Loading map…</div>
    </div>
  );
}
