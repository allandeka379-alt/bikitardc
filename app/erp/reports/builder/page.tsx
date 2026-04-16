'use client';

// ─────────────────────────────────────────────
// Ad-hoc report builder (spec §3.2 Phase 2).
// Pick a metric + dimension + filter → live chart
// preview. "Schedule delivery" persists a weekly
// email-delivery entry to the scheduler below.
// ─────────────────────────────────────────────

import { BarChart3, CalendarClock, Download, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { CATEGORICAL_PALETTE, CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import { useReportsStore } from '@/lib/stores/reports';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { CHANNEL_LABEL, TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

type Metric = 'collections' | 'outstanding' | 'count';
type Dimension = 'ward' | 'channel' | 'class' | 'month';
type Shape = 'bar' | 'line';

const METRIC_LABEL: Record<Metric, string> = {
  collections: 'Collections',
  outstanding: 'Outstanding',
  count:       'Transaction count',
};

const DIMENSION_LABEL: Record<Dimension, string> = {
  ward:    'Ward',
  channel: 'Payment channel',
  class:   'Property class',
  month:   'Month',
};

export default function ReportBuilderPage() {
  const [metric, setMetric] = useState<Metric>('collections');
  const [dimension, setDimension] = useState<Dimension>('ward');
  const [shape, setShape] = useState<Shape>('bar');
  const [name, setName] = useState('');
  const [recipient, setRecipient] = useState('ceo@bikita.gov.zw');
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const schedule = useReportsStore((s) => s.schedule);
  const remove = useReportsStore((s) => s.remove);
  const schedules = useReportsStore((s) => s.items);

  const data = useMemo(() => buildData(metric, dimension), [metric, dimension]);

  const saveSchedule = () => {
    if (!name.trim()) return toast({ title: 'Name this schedule first.', tone: 'danger' });
    schedule({
      name: name.trim(),
      metric,
      dimension,
      shape,
      recipient,
      cadence,
    });
    toast({
      title: 'Scheduled',
      description: `${name} sends ${cadence} to ${recipient}.`,
      tone: 'success',
    });
    setName('');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <Link
            href="/erp/reports"
            className="mb-2 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
          >
            ← Reports
          </Link>
          <h1 className="text-h1 text-ink">Report builder</h1>
          <p className="mt-1 text-small text-muted">
            Pick a metric, a dimension and a shape. Save a schedule to get it by email.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Builder</h3>
          <div className="mt-4 grid gap-4">
            <div>
              <Label>Metric</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetric(m)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                      metric === m
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {METRIC_LABEL[m]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Group by</Label>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(DIMENSION_LABEL) as Dimension[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDimension(d)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                      dimension === d
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {DIMENSION_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Shape</Label>
              <div className="flex gap-1.5">
                {(['bar', 'line'] as Shape[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShape(s)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium capitalize transition-colors',
                      shape === s
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <Label htmlFor="rb-name">Schedule name</Label>
              <Input id="rb-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CEO weekly brief" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rb-email">Recipient</Label>
                <Input id="rb-email" type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <div>
                <Label>Cadence</Label>
                <div className="flex gap-1.5">
                  {(['daily', 'weekly', 'monthly'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCadence(c)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-micro font-medium capitalize transition-colors',
                        cadence === c
                          ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                          : 'border-line bg-card text-ink hover:border-brand-primary/30',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
                Export CSV
              </Button>
              <Button size="sm" onClick={saveSchedule} leadingIcon={<Save className="h-3.5 w-3.5" />}>
                Save schedule
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h3 className="text-small font-semibold text-ink">
                  <BarChart3 className="mr-1.5 inline h-4 w-4 text-muted" />
                  {METRIC_LABEL[metric]} by {DIMENSION_LABEL[dimension]}
                </h3>
                <p className="text-micro text-muted">Live preview of the configured report.</p>
              </div>
              <Badge tone="brand">{data.length} rows</Badge>
            </div>
            <div className="h-[360px] w-full px-2 py-5 sm:px-4">
              <ResponsiveContainer width="100%" height="100%">
                {shape === 'bar' ? (
                  <BarChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="2 6" vertical={false} />
                    <XAxis dataKey="key" tickLine={false} axisLine={{ stroke: CHART_TOKENS.axisLine }} tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} dy={6} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v) =>
                        metric === 'count' ? String(Math.round(v as number)) : formatCurrencyCompact(v as number)
                      }
                      width={52}
                    />
                    <Tooltip cursor={{ fill: CHART_TOKENS.cursor }} content={<BuilderTooltip metric={metric} />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={600}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="2 6" vertical={false} />
                    <XAxis dataKey="key" tickLine={false} axisLine={{ stroke: CHART_TOKENS.axisLine }} tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }} dy={6} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                      tickFormatter={(v) =>
                        metric === 'count' ? String(Math.round(v as number)) : formatCurrencyCompact(v as number)
                      }
                      width={52}
                    />
                    <Tooltip cursor={{ stroke: CHART_TOKENS.cursor, strokeWidth: 1 }} content={<BuilderTooltip metric={metric} />} />
                    <Line type="monotone" dataKey="value" stroke={CHART_TOKENS.primary} strokeWidth={2} dot={{ r: 3, fill: CHART_TOKENS.primary }} animationDuration={600} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted" />
                <h3 className="text-small font-semibold text-ink">Scheduled deliveries</h3>
              </div>
              <Badge tone="brand">{schedules.length}</Badge>
            </div>
            {schedules.length === 0 ? (
              <div className="px-5 py-10 text-center text-small text-muted">
                No schedules yet. Configure one on the left and click "Save schedule".
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {schedules.map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-3 px-5 py-3 text-small">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="success">{s.cadence}</Badge>
                        <span className="font-semibold text-ink">{s.name}</span>
                      </div>
                      <div className="mt-0.5 text-micro text-muted">
                        {METRIC_LABEL[s.metric]} by {DIMENSION_LABEL[s.dimension]} → {s.recipient}
                      </div>
                      {s.lastSentAt && (
                        <div className="text-[10px] text-muted">Last sent {formatRelative(s.lastSentAt)}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" leadingIcon={<Send className="h-3.5 w-3.5" />} onClick={() => {
                        useReportsStore.getState().markSent(s.id);
                        toast({ title: 'Sent preview', description: `${s.name} delivered to ${s.recipient}.`, tone: 'success' });
                      }}>
                        Send now
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(s.id)} leadingIcon={<Trash2 className="h-3.5 w-3.5" />}>
                        Remove
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Data engine ──────────────────────────────

function buildData(metric: Metric, dimension: Dimension): { key: string; value: number }[] {
  const succeeded = TRANSACTIONS.filter((t) => t.status === 'succeeded');

  if (dimension === 'ward') {
    const map = new Map<string, { value: number }>();
    for (const p of PROPERTIES) {
      const entry = map.get(p.ward) ?? { value: 0 };
      if (metric === 'outstanding') entry.value += p.balanceUsd;
      map.set(p.ward, entry);
    }
    if (metric === 'outstanding') {
      return Array.from(map.entries()).map(([k, v]) => ({ key: k, value: v.value }));
    }
    const byWard = new Map<string, number>();
    for (const t of succeeded) {
      const prop = PROPERTIES.find((p) => p.id === t.propertyId);
      if (!prop) continue;
      byWard.set(prop.ward, (byWard.get(prop.ward) ?? 0) + (metric === 'count' ? 1 : t.amount));
    }
    return Array.from(byWard.entries()).map(([k, v]) => ({ key: k, value: v }));
  }

  if (dimension === 'channel') {
    const by = new Map<string, number>();
    for (const t of succeeded) {
      if (metric === 'outstanding') continue;
      by.set(t.channel, (by.get(t.channel) ?? 0) + (metric === 'count' ? 1 : t.amount));
    }
    return Array.from(by.entries()).map(([k, v]) => ({ key: CHANNEL_LABEL[k as keyof typeof CHANNEL_LABEL], value: v }));
  }

  if (dimension === 'class') {
    const by = new Map<string, number>();
    for (const p of PROPERTIES) {
      const cur = by.get(p.classKind) ?? 0;
      by.set(p.classKind, cur + (metric === 'outstanding' ? p.balanceUsd : 0));
    }
    if (metric !== 'outstanding') {
      for (const t of succeeded) {
        const prop = PROPERTIES.find((p) => p.id === t.propertyId);
        if (!prop) continue;
        by.set(prop.classKind, (by.get(prop.classKind) ?? 0) + (metric === 'count' ? 1 : t.amount));
      }
    }
    return Array.from(by.entries()).map(([k, v]) => ({ key: k, value: v }));
  }

  // month
  const by = new Map<string, number>();
  for (const t of succeeded) {
    const key = t.createdAt.slice(0, 7); // YYYY-MM
    by.set(key, (by.get(key) ?? 0) + (metric === 'count' ? 1 : t.amount));
  }
  return Array.from(by.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => ({ key: k, value: v }));
}

interface BuilderTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { key: string } }>;
  metric: Metric;
}

function BuilderTooltip({ active, payload, metric }: BuilderTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0]!;
  return (
    <div
      style={{
        background: CHART_TOKENS.tooltipBg,
        border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
        boxShadow: CHART_TOKENS.tooltipShadow,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <div style={{ color: CHART_TOKENS.tooltipMuted, marginBottom: 2 }}>{row.payload.key}</div>
      <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600 }}>
        {metric === 'count' ? Math.round(row.value) : formatCurrencyCompact(row.value)}
      </div>
    </div>
  );
}
