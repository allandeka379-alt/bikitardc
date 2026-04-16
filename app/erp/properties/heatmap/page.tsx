'use client';

// Revenue heat map page — proportional circle
// markers per ward. Toggle between collections,
// outstanding and property density.

import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { WARDS } from '@/mocks/fixtures/wards';
import type { HeatmapMetric } from '@/components/erp/revenue-heatmap';
import { cn } from '@/lib/cn';

const RevenueHeatmap = dynamic(() => import('@/components/erp/revenue-heatmap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center rounded-lg border border-line bg-surface">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
    </div>
  ),
});

const METRICS: { id: HeatmapMetric; label: string; hint: string }[] = [
  { id: 'collections', label: 'Collections',  hint: 'Where is the money coming from?' },
  { id: 'outstanding', label: 'Outstanding',  hint: 'Where are the arrears concentrated?' },
  { id: 'density',     label: 'Property density', hint: 'How many ratepayers per ward?' },
];

export default function RevenueHeatmapPage() {
  const [metric, setMetric] = useState<HeatmapMetric>('collections');

  const totals = WARDS.map((w) => {
    const props = PROPERTIES.filter((p) => p.ward === w.name);
    const ids = new Set(props.map((p) => p.id));
    const collections = TRANSACTIONS.filter(
      (t) => ids.has(t.propertyId) && t.status === 'succeeded',
    ).reduce((s, t) => s + t.amount, 0);
    return {
      ward: w.name,
      properties: props.length,
      collections,
      outstanding: props.reduce((s, p) => s + p.balanceUsd, 0),
    };
  });

  const districtTotals = {
    properties: totals.reduce((s, t) => s + t.properties, 0),
    collections: totals.reduce((s, t) => s + t.collections, 0),
    outstanding: totals.reduce((s, t) => s + t.outstanding, 0),
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href="/erp/properties"
            className="mb-2 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Properties
          </Link>
          <h1 className="text-h1 text-ink">Revenue heat map</h1>
          <p className="mt-1 text-small text-muted">
            Circle area scales with the selected metric at each ward centroid. Click a ward for details.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{districtTotals.properties} properties</Badge>
          <Badge tone="success">{formatCurrency(districtTotals.collections)} collected</Badge>
          <Badge tone="danger">{formatCurrency(districtTotals.outstanding)} outstanding</Badge>
        </div>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {METRICS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMetric(m.id)}
            className={cn(
              'flex items-start gap-3 rounded-md border px-4 py-2.5 text-left transition-colors',
              metric === m.id
                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                : 'border-line bg-card text-ink hover:border-brand-primary/30',
            )}
          >
            <MapIcon className="mt-0.5 h-4 w-4" />
            <div>
              <div className="text-small font-semibold">{m.label}</div>
              <div className="text-micro text-muted">{m.hint}</div>
            </div>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative h-[calc(100dvh-340px)] min-h-[480px] w-full">
          <RevenueHeatmap metric={metric} />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-h3 text-ink">Ward totals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="py-2 pr-2 text-left">Ward</th>
                <th className="py-2 px-2 text-right">Properties</th>
                <th className="py-2 px-2 text-right">Collections</th>
                <th className="py-2 pl-2 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t) => (
                <tr key={t.ward} className="border-b border-line last:border-b-0">
                  <td className="py-2 pr-2 font-medium text-ink">{t.ward}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-ink">{t.properties}</td>
                  <td className="py-2 px-2 text-right font-semibold tabular-nums text-success">
                    {formatCurrency(t.collections)}
                  </td>
                  <td className="py-2 pl-2 text-right font-semibold tabular-nums text-danger">
                    {formatCurrency(t.outstanding)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
