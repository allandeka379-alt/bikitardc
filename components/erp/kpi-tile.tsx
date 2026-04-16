'use client';

// ─────────────────────────────────────────────
// ERP KPI tile with inline sparkline.
// Matches the Synvas dashboard-widgets pattern —
// big number + delta chip + trend chart — re-themed
// for Bikita (light surface + navy/gold palette).
// ─────────────────────────────────────────────

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrency, formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { KpiSpark } from '@/mocks/fixtures/erp-kpis';

interface Props {
  kpi: KpiSpark;
  href?: string;
  icon?: ReactNode;
  tint?: 'navy' | 'gold' | 'danger' | 'sky';
}

const TINT: Record<'navy' | 'gold' | 'danger' | 'sky', { bg: string; text: string; stroke: string; gradient: string }> = {
  navy:   { bg: 'bg-brand-primary/10',  text: 'text-brand-primary', stroke: CHART_TOKENS.primary, gradient: 'url(#sparkNavy)' },
  gold:   { bg: 'bg-brand-accent/15',   text: 'text-[#8a6e13]',     stroke: CHART_TOKENS.accent,  gradient: 'url(#sparkGold)' },
  danger: { bg: 'bg-danger/10',         text: 'text-danger',        stroke: CHART_TOKENS.danger,  gradient: 'url(#sparkDanger)' },
  sky:    { bg: 'bg-info/10',           text: 'text-info',          stroke: CHART_TOKENS.sky,     gradient: 'url(#sparkSky)' },
};

export function KpiTile({ kpi, href, icon, tint = 'navy' }: Props) {
  const t = TINT[tint];
  const positive = kpi.deltaPct >= 0;
  const showDeltaGood = kpi.id === 'open-tickets' ? !positive : positive;

  const data = kpi.series.map((y, i) => ({ x: i, y }));
  const gradientId = t.gradient.replace('url(#', '').replace(')', '');

  const body = (
    <Card className="group relative h-full overflow-hidden p-5 hover-lift">
      <div className="flex items-start justify-between">
        {icon && (
          <span className={cn('grid h-10 w-10 place-items-center rounded-md', t.bg, t.text)} aria-hidden>
            {icon}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-semibold',
            showDeltaGood ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(kpi.deltaPct).toFixed(1)}%
        </span>
      </div>

      <div className="mt-4">
        <div className="text-[26px] font-bold leading-8 tabular-nums text-ink sm:text-[28px]">
          {kpi.kind === 'currency'
            ? formatCurrency(kpi.value)
            : kpi.label.includes('rate')
              ? `${kpi.value.toFixed(1)}%`
              : formatNumber(kpi.value)}
        </div>
        <div className="mt-0.5 text-small text-muted">{kpi.label}</div>
        <div className="mt-0.5 text-micro text-muted/80">{kpi.sublabel}</div>
      </div>

      {/* Sparkline */}
      <div className="mt-2 h-10 w-full -mb-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={t.stroke} stopOpacity={0.25} />
                <stop offset="100%" stopColor={t.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={t.stroke}
              strokeWidth={1.75}
              fill={t.gradient}
              isAnimationActive
              animationDuration={650}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 rounded-lg">
      {body}
    </Link>
  ) : (
    body
  );
}
