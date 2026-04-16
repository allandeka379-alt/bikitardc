'use client';

// Reports hub — spec §6.2 screen #17.
// Canned report tiles + one interactive chart.

import {
  Banknote,
  BarChart3,
  Building2,
  Clock3,
  Download,
  FileSpreadsheet,
  LineChart as LineChartIcon,
  MapPinned,
  Percent,
  PieChart as PieChartIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { MonthlyCollectionsChart } from '@/components/erp/monthly-collections-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CATEGORICAL_PALETTE, CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency } from '@/lib/format';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import { AGEING_DEBTORS, MONTHLY_COLLECTIONS, REVENUE_BY_SOURCE } from '@/mocks/fixtures/erp-kpis';
import { cn } from '@/lib/cn';

const TILES = [
  { key: 'daily',      Icon: Banknote,       label: "Daily collections",       desc: 'Collections, by channel, for today.', tint: 'navy' as const,    href: '#' },
  { key: 'monthly',    Icon: LineChartIcon,  label: 'Monthly revenue by source', desc: 'Rates, licences, levies, refuse — by month.', tint: 'gold' as const, href: '#' },
  { key: 'ageing',     Icon: Clock3,         label: 'Ageing debtors',          desc: 'Outstanding balances bucketed by age.', tint: 'danger' as const, href: '#' },
  { key: 'ward',       Icon: MapPinned,      label: 'Ward scorecard',          desc: 'Collections, requests and SLA by ward.', tint: 'sky' as const,  href: '/erp/reports/ward-scorecard' },
  { key: 'budget',     Icon: Percent,        label: 'Budget vs actual',        desc: 'Departmental spending vs budget allocation.', tint: 'success' as const, href: '/budget' },
  { key: 'licensing',  Icon: FileSpreadsheet, label: 'Licensing revenue',       desc: 'Business & liquor licence revenue.', tint: 'navy' as const,  href: '#' },
  { key: 'builder',    Icon: BarChart3,      label: 'Ad-hoc builder',          desc: 'Build a one-off report; schedule by email.', tint: 'success' as const, href: '/erp/reports/builder' },
];

type TintKey = 'navy' | 'gold' | 'danger' | 'sky' | 'success';
const TINT: Record<TintKey, string> = {
  navy:    'bg-brand-primary/10 text-brand-primary',
  gold:    'bg-brand-accent/15 text-[#8a6e13]',
  danger:  'bg-danger/10 text-danger',
  sky:     'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'revenue' | 'ageing'>('monthly');

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Reports</h1>
            <p className="mt-1 text-small text-muted">
              Canned reports and an interactive trend view. Export to CSV, Excel or PDF.
            </p>
          </div>
          <Button size="sm" variant="secondary" leadingIcon={<Download className="h-3.5 w-3.5" />}>
            Export all
          </Button>
        </div>
      </ScrollReveal>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {TILES.map((t, i) => {
          const card = (
            <Card className="group flex h-full items-start gap-3 p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-md">
              <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-md', TINT[t.tint])}>
                <t.Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-small font-semibold text-ink group-hover:text-brand-primary">
                  {t.label}
                </h3>
                <p className="mt-1 text-micro text-muted">{t.desc}</p>
              </div>
              <Button variant="ghost" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
                CSV
              </Button>
            </Card>
          );
          return (
            <ScrollReveal key={t.key} delay={i * 60}>
              {t.href !== '#' ? (
                <Link href={t.href} className="block focus-visible:outline-none">
                  {card}
                </Link>
              ) : (
                <div className="cursor-pointer">{card}</div>
              )}
            </ScrollReveal>
          );
        })}
      </div>

      {/* Interactive chart */}
      <ScrollReveal>
        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-5 pb-4 pt-5">
            <div>
              <h2 className="text-h3 text-ink">Interactive trends</h2>
              <p className="mt-0.5 text-small text-muted">
                Switch views to explore different angles on the same data.
              </p>
            </div>
            <div className="flex rounded-md border border-line bg-card p-0.5">
              {(['monthly', 'revenue', 'ageing'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-small font-medium transition-colors',
                    activeTab === t
                      ? 'bg-brand-primary text-white shadow-card-sm'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {t === 'monthly' && <LineChartIcon className="h-3.5 w-3.5" />}
                  {t === 'revenue' && <Building2 className="h-3.5 w-3.5" />}
                  {t === 'ageing' && <PieChartIcon className="h-3.5 w-3.5" />}
                  {t === 'monthly' ? 'Monthly' : t === 'revenue' ? 'Revenue' : 'Ageing'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-2 pb-4 pt-2 sm:px-4">
            {activeTab === 'monthly' && <MonthlyCollectionsChart data={MONTHLY_COLLECTIONS} />}
            {activeTab === 'revenue' && <RevenueSplit data={REVENUE_BY_SOURCE} />}
            {activeTab === 'ageing' && <AgeingBuckets />}
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function RevenueSplit({ data }: { data: { label: string; amount: number }[] }) {
  const total = data.reduce((s, d) => s + d.amount, 0);
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
              strokeWidth={2}
              stroke="#ffffff"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]?.payload as { label: string; amount: number };
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
                    <div style={{ color: CHART_TOKENS.tooltipMuted }}>{p.label}</div>
                    <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrencyCompact(p.amount)} ({((p.amount / total) * 100).toFixed(1)}%)
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col justify-center gap-2 py-4">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-small">
            <span className="inline-flex items-center gap-2 text-ink">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length] }}
                aria-hidden
              />
              {d.label}
            </span>
            <span className="tabular-nums text-muted">
              {formatCurrency(d.amount)} · {((d.amount / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AgeingBuckets() {
  const max = Math.max(...AGEING_DEBTORS.map((b) => b.amount));
  const BAR_COLORS = [CHART_TOKENS.success, CHART_TOKENS.warning, CHART_TOKENS.accent, CHART_TOKENS.danger];
  const total = AGEING_DEBTORS.reduce((s, b) => s + b.amount, 0);
  return (
    <div className="px-2 py-5">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-small text-muted">Total outstanding</div>
          <div className="text-[28px] font-bold tabular-nums text-ink">{formatCurrency(total)}</div>
        </div>
        <Badge tone="danger">
          {AGEING_DEBTORS[3]!.count} accounts 90+ days
        </Badge>
      </div>
      <ul className="flex flex-col gap-3">
        {AGEING_DEBTORS.map((b, i) => {
          const pct = (b.amount / max) * 100;
          return (
            <li key={b.bucket}>
              <div className="flex items-center justify-between text-small">
                <span className="font-medium text-ink">{b.bucket}</span>
                <span className="tabular-nums text-muted">
                  {formatCurrency(b.amount)} · {b.count} accounts
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface">
                <span
                  className="block h-full rounded-full transition-[width] duration-slow ease-out-expo"
                  style={{ width: `${pct}%`, backgroundColor: BAR_COLORS[i] ?? CHART_TOKENS.primary }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
