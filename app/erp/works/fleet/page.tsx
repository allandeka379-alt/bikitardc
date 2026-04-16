// Fleet list — vehicles and heavy plant.

'use client';

import { ArrowLeft, Filter, Fuel, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';
import {
  FLEET,
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  type FleetKind,
} from '@/mocks/fixtures/fleet';
import { cn } from '@/lib/cn';

export default function FleetPage() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<FleetKind | 'all'>('all');

  const rows = useMemo(() => {
    let r = FLEET;
    if (kind !== 'all') r = r.filter((v) => v.kind === kind);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter(
        (v) =>
          v.reg.toLowerCase().includes(ql) ||
          v.description.toLowerCase().includes(ql) ||
          (v.driver ?? '').toLowerCase().includes(ql),
      );
    }
    return r;
  }, [q, kind]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/works" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Works &amp; assets
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Fleet &amp; plant</h1>
          <p className="mt-1 text-small text-muted">{FLEET.length} assets on the fleet register.</p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input placeholder="Search by registration, description or driver…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select value={kind} onChange={(e) => setKind(e.target.value as FleetKind | 'all')} className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink">
            <option value="all">All types</option>
            {(Object.keys(KIND_LABEL) as FleetKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Reg / Asset tag</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-left">Driver</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Fuel</th>
                <th className="px-5 py-3 text-right">Odo / service due</th>
                <th className="px-5 py-3 text-left">Licence expiry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const serviceDueSoon = v.nextServiceAtKm > 0 && v.odometer >= v.nextServiceAtKm - 500;
                return (
                  <tr key={v.id} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <Link href={`/erp/works/fleet/${v.id}`} className="font-semibold text-ink hover:text-brand-primary">{v.reg}</Link>
                      <div className="font-mono text-micro text-muted">{v.assetTag}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-ink">{v.description}</div>
                      <div className="text-micro text-muted">{KIND_LABEL[v.kind]} · {v.department}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{v.driver ?? '—'}</td>
                    <td className="px-5 py-3"><Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Fuel className={cn('h-3.5 w-3.5', v.fuelPct < 25 ? 'text-danger' : v.fuelPct < 50 ? 'text-warning' : 'text-success')} />
                        <div className="relative h-1 w-20 overflow-hidden rounded-full bg-line">
                          <span
                            className={cn('block h-full rounded-full', v.fuelPct < 25 ? 'bg-danger' : v.fuelPct < 50 ? 'bg-warning' : 'bg-success')}
                            style={{ width: `${v.fuelPct}%` }}
                          />
                        </div>
                        <span className="text-micro tabular-nums text-muted">{v.fuelPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="tabular-nums text-ink">{v.odometer.toLocaleString()} km</div>
                      {v.nextServiceAtKm > 0 && (
                        <div className={cn('text-micro tabular-nums', serviceDueSoon ? 'font-semibold text-warning' : 'text-muted')}>
                          {serviceDueSoon && <Wrench className="mr-1 inline h-3 w-3" />}
                          service @ {v.nextServiceAtKm.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-micro text-muted">{v.licenceExpiry === '—' ? '—' : formatDate(v.licenceExpiry)}</td>
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
