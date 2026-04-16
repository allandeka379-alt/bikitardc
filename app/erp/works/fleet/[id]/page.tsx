// Vehicle detail — state + fuel history + maintenance log.

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  KIND_LABEL,
  STATUS_LABEL,
  STATUS_TONE,
  findVehicle,
  logsForVehicle,
} from '@/mocks/fixtures/fleet';
import { cn } from '@/lib/cn';

export default function FleetDetailPage() {
  const params = useParams<{ id: string }>();
  const v = findVehicle(params.id);
  if (!v) return notFound();

  const { fuel, maintenance } = logsForVehicle(v.id);
  const fuelCost = fuel.reduce((s, f) => s + f.costUsd, 0);
  const fuelLitres = fuel.reduce((s, f) => s + f.litres, 0);
  const maintCost = maintenance.reduce((s, m) => s + m.costUsd, 0);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/erp/works/fleet" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" />
        Fleet
      </Link>

      <ScrollReveal>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-h1 text-ink">{v.reg}</h1>
                <Badge tone={STATUS_TONE[v.status]}>{STATUS_LABEL[v.status]}</Badge>
                <Badge tone="neutral">{KIND_LABEL[v.kind]}</Badge>
              </div>
              <div className="mt-1 text-body text-ink">{v.description}</div>
              <div className="text-small text-muted">{v.department} · driver {v.driver ?? '—'}</div>
              <div className="mt-1 font-mono text-micro text-muted">Asset tag {v.assetTag}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
              <Metric label="Odometer"    value={`${v.odometer.toLocaleString()} km`} />
              <Metric label="Fuel"        value={`${v.fuelPct}%`} tone={v.fuelPct < 25 ? 'danger' : v.fuelPct < 50 ? 'warning' : 'success'} />
              <Metric label="Next service"value={v.nextServiceAtKm > 0 ? `${v.nextServiceAtKm.toLocaleString()} km` : '—'} />
              <Metric label="Last service"value={formatDate(v.lastServiceAt)} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Fuel + maintenance tables */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Fuel log</h2>
            <div className="text-micro text-muted">{fuelLitres} L · {formatCurrency(fuelCost)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/40 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-2 text-left">Date</th>
                  <th className="px-5 py-2 text-right">Litres</th>
                  <th className="px-5 py-2 text-right">Cost</th>
                  <th className="px-5 py-2 text-right">Odo</th>
                  <th className="px-5 py-2 text-left">Station</th>
                </tr>
              </thead>
              <tbody>
                {fuel.map((f) => (
                  <tr key={f.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-2 text-muted">{formatDate(f.refuelledAt)}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink">{f.litres}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink">{formatCurrency(f.costUsd)}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-muted">{f.odometer.toLocaleString()}</td>
                    <td className="px-5 py-2 text-muted">{f.station}</td>
                  </tr>
                ))}
                {fuel.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-micro text-muted">No fuel records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-body font-semibold text-ink">Maintenance</h2>
            <div className="text-micro text-muted">{maintenance.length} jobs · {formatCurrency(maintCost)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/40 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-2 text-left">Date</th>
                  <th className="px-5 py-2 text-left">Kind</th>
                  <th className="px-5 py-2 text-left">Description</th>
                  <th className="px-5 py-2 text-right">Cost</th>
                  <th className="px-5 py-2 text-left">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-2 text-muted">{formatDate(m.serviceDate)}</td>
                    <td className="px-5 py-2"><Badge tone={m.kind === 'repair' ? 'warning' : m.kind === 'inspection' ? 'info' : 'success'}>{m.kind}</Badge></td>
                    <td className="px-5 py-2 text-ink">{m.description}</td>
                    <td className="px-5 py-2 text-right tabular-nums text-ink">{formatCurrency(m.costUsd)}</td>
                    <td className="px-5 py-2 text-muted">{m.supplier}</td>
                  </tr>
                ))}
                {maintenance.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-micro text-muted">No maintenance records.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' | 'danger' }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : tone === 'danger' ? 'text-danger' : 'text-ink';
  return (
    <div className="rounded-md border border-line bg-card px-3 py-2">
      <div className="text-micro text-muted">{label}</div>
      <div className={cn('text-small font-bold tabular-nums', toneClass)}>{value}</div>
    </div>
  );
}
