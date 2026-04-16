'use client';

// ─────────────────────────────────────────────
// Ward performance scorecard (spec §3.2
// "Ward performance scorecard" Demo-Visual).
//
// Derives per-ward metrics from existing fixtures:
//   • Properties on roll
//   • Outstanding balance (total)
//   • Collections YTD (proxy via transactions)
//   • Open / resolved / breached service requests
//   • SLA compliance + average satisfaction
// Renders as a scorecard grid + a normalised bar
// chart for a quick comparison across wards.
// ─────────────────────────────────────────────

import { ArrowLeft, BarChart3, Download } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS, CATEGORICAL_PALETTE } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import { formatCurrency } from '@/lib/format';
import { useAllServiceRequests } from '@/lib/hooks/use-service-requests';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { slaHealth } from '@/mocks/fixtures/service-requests';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { WARDS } from '@/mocks/fixtures/wards';
import { cn } from '@/lib/cn';

type Metric = 'collections' | 'outstanding' | 'sla' | 'satisfaction';

const METRIC_LABEL: Record<Metric, string> = {
  collections:  'Collections YTD',
  outstanding:  'Outstanding balance',
  sla:          'SLA compliance',
  satisfaction: 'Avg satisfaction',
};

const METRIC_FORMAT: Record<Metric, (v: number) => string> = {
  collections:  formatCurrencyCompact,
  outstanding:  formatCurrencyCompact,
  sla:          (v) => `${v.toFixed(1)}%`,
  satisfaction: (v) => (v > 0 ? `${v.toFixed(1)} / 5` : '—'),
};

interface WardRow {
  name: string;
  properties: number;
  collectionsYtd: number;
  outstanding: number;
  requestsTotal: number;
  requestsResolved: number;
  requestsBreached: number;
  slaCompliancePct: number;
  satisfactionAvg: number;
}

export default function WardScorecardPage() {
  const requests = useAllServiceRequests();
  const [metric, setMetric] = useState<Metric>('collections');

  const rows: WardRow[] = useMemo(() => {
    return WARDS.map((w) => {
      const props = PROPERTIES.filter((p) => p.ward === w.name);
      const propertyIds = new Set(props.map((p) => p.id));
      const txs = TRANSACTIONS.filter(
        (t) => propertyIds.has(t.propertyId) && t.status === 'succeeded',
      );
      const collectionsYtd = txs.reduce((s, t) => s + t.amount, 0);
      const outstanding = props.reduce((s, p) => s + p.balanceUsd, 0);

      const wardRequests = requests.filter((r) => r.ward === w.name);
      const resolved = wardRequests.filter((r) => r.status === 'resolved');
      const breached = wardRequests.filter(
        (r) => r.status !== 'resolved' && slaHealth(r) === 'breached',
      );
      const slaCompliancePct =
        wardRequests.length === 0
          ? 100
          : ((wardRequests.length - breached.length) / wardRequests.length) * 100;

      const rated = resolved.filter((r) => typeof r.satisfaction === 'number');
      const satisfactionAvg =
        rated.length === 0
          ? 0
          : rated.reduce((s, r) => s + (r.satisfaction ?? 0), 0) / rated.length;

      return {
        name: w.name,
        properties: props.length,
        collectionsYtd,
        outstanding,
        requestsTotal: wardRequests.length,
        requestsResolved: resolved.length,
        requestsBreached: breached.length,
        slaCompliancePct,
        satisfactionAvg,
      };
    });
  }, [requests]);

  const chartData = rows.map((r) => ({
    ward: r.name,
    value:
      metric === 'collections'
        ? r.collectionsYtd
        : metric === 'outstanding'
          ? r.outstanding
          : metric === 'sla'
            ? r.slaCompliancePct
            : r.satisfactionAvg,
  }));

  const best = [...rows].sort(rankFor(metric, false))[0];
  const worst = [...rows].sort(rankFor(metric, true))[0];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <Link
          href="/erp/reports"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to reports
        </Link>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Ward performance scorecard</h1>
            <p className="mt-1 text-small text-muted">
              Per-ward collections, arrears, service-request SLA and resident satisfaction — derived from
              live fixture data.
            </p>
          </div>
          <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
            Export CSV
          </Button>
        </div>
      </ScrollReveal>

      {best && worst && (
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Highlight label={`Top-performing ward on ${METRIC_LABEL[metric].toLowerCase()}`}
            ward={best.name}
            value={METRIC_FORMAT[metric]((chartData.find((c) => c.ward === best.name)?.value) ?? 0)}
            tone="success"
          />
          <Highlight label={`Lowest ward on ${METRIC_LABEL[metric].toLowerCase()}`}
            ward={worst.name}
            value={METRIC_FORMAT[metric]((chartData.find((c) => c.ward === worst.name)?.value) ?? 0)}
            tone="warning"
          />
        </div>
      )}

      <ScrollReveal>
        <Card className="mb-4 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 pb-4 pt-5">
            <div>
              <h2 className="text-h3 text-ink">At-a-glance</h2>
              <p className="text-small text-muted">Compare a single metric across wards.</p>
            </div>
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

          <div className="px-2 py-5 sm:px-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }} barCategoryGap={18}>
                  <CartesianGrid stroke={CHART_TOKENS.grid} strokeDasharray="2 6" vertical={false} />
                  <XAxis
                    dataKey="ward"
                    tickLine={false}
                    axisLine={{ stroke: CHART_TOKENS.axisLine }}
                    tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                    dy={6}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                    tickFormatter={(v) =>
                      metric === 'sla' || metric === 'satisfaction'
                        ? String(Math.round(v as number))
                        : formatCurrencyCompact(v as number)
                    }
                    width={46}
                  />
                  <Tooltip
                    cursor={{ fill: CHART_TOKENS.cursor }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const row = payload[0]?.payload as { ward: string; value: number };
                      return (
                        <div
                          style={{
                            background: CHART_TOKENS.tooltipBg,
                            border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
                            boxShadow: CHART_TOKENS.tooltipShadow,
                            borderRadius: 8,
                            padding: '8px 12px',
                            fontSize: 12,
                          }}
                        >
                          <div style={{ color: CHART_TOKENS.tooltipMuted, marginBottom: 2 }}>
                            {row.ward} ward
                          </div>
                          <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {METRIC_FORMAT[metric](row.value)}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={650}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v: number) => METRIC_FORMAT[metric](v)}
                      style={{ fill: CHART_TOKENS.tooltipText, fontSize: 10, fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-small font-semibold text-ink">
              <BarChart3 className="mr-1.5 inline h-4 w-4 text-muted" />
              Scorecard
            </h2>
            <span className="text-micro text-muted">{rows.length} wards</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-small">
              <thead>
                <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 text-left">Ward</th>
                  <th className="px-5 py-3 text-right">Properties</th>
                  <th className="px-5 py-3 text-right">Collections</th>
                  <th className="px-5 py-3 text-right">Outstanding</th>
                  <th className="px-5 py-3 text-right">Requests</th>
                  <th className="px-5 py-3 text-right">SLA %</th>
                  <th className="px-5 py-3 text-right">Satisfaction</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-line last:border-b-0 hover:bg-surface/60">
                    <td className="px-5 py-3">
                      <div className="text-small font-semibold text-ink">{r.name}</div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">{r.properties}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-success">
                      {formatCurrency(r.collectionsYtd)}
                    </td>
                    <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', r.outstanding > 0 ? 'text-danger' : 'text-success')}>
                      {formatCurrency(r.outstanding)}
                    </td>
                    <td className="px-5 py-3 text-right text-ink">
                      <span className="tabular-nums">{r.requestsTotal}</span>
                      {r.requestsBreached > 0 && (
                        <Badge tone="danger" className="ml-2">
                          {r.requestsBreached} breached
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Badge
                        tone={
                          r.slaCompliancePct >= 90 ? 'success' : r.slaCompliancePct >= 70 ? 'warning' : 'danger'
                        }
                      >
                        {r.slaCompliancePct.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink">
                      {r.satisfactionAvg > 0 ? `${r.satisfactionAvg.toFixed(1)} / 5` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function rankFor(metric: Metric, asc: boolean) {
  return (a: WardRow, b: WardRow) => {
    const av =
      metric === 'collections'
        ? a.collectionsYtd
        : metric === 'outstanding'
          ? a.outstanding
          : metric === 'sla'
            ? a.slaCompliancePct
            : a.satisfactionAvg;
    const bv =
      metric === 'collections'
        ? b.collectionsYtd
        : metric === 'outstanding'
          ? b.outstanding
          : metric === 'sla'
            ? b.slaCompliancePct
            : b.satisfactionAvg;
    // For outstanding, lower is better — flip it
    const dir = metric === 'outstanding' ? 1 : -1;
    return asc ? (av - bv) * -dir : (bv - av) * -dir;
  };
}

function Highlight({
  label,
  ward,
  value,
  tone,
}: {
  label: string;
  ward: string;
  value: string;
  tone: 'success' | 'warning';
}) {
  return (
    <Card
      className={cn(
        'p-5',
        tone === 'success' ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5',
      )}
    >
      <div className="text-micro uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <div className="text-h3 text-ink">{ward} ward</div>
        <div className={cn('text-h3 font-bold tabular-nums', tone === 'success' ? 'text-success' : 'text-warning')}>
          {value}
        </div>
      </div>
    </Card>
  );
}
