// ─────────────────────────────────────────────
// Beer hall outlets — monthly operating P&L per
// outlet with margin calculations and a liquor-
// licence expiry watch.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import { BEER_HALLS, beerHallNetMargin, type BeerHallOutlet } from '@/mocks/fixtures/beer-halls';
import { cn } from '@/lib/cn';

const STATUS_TONE: Record<BeerHallOutlet['status'], 'success' | 'warning' | 'danger'> = {
  trading:         'success',
  'under-review':  'warning',
  closed:          'danger',
};

export default function BeerHallPage() {
  const totals = BEER_HALLS.reduce(
    (acc, b) => {
      acc.revenue += b.revenueUsd;
      acc.cost    += b.costOfSalesUsd;
      acc.staff   += b.staffUsd;
      acc.margin  += beerHallNetMargin(b);
      return acc;
    },
    { revenue: 0, cost: 0, staff: 0, margin: 0 },
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/billing"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Billing runs
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Beer hall outlets</h1>
          <p className="mt-1 text-small text-muted">
            {BEER_HALLS.length} council-run outlets · last closed month {BEER_HALLS[0]!.periodMonth}.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat label="Revenue"  value={formatCurrency(totals.revenue)} tone="success" />
        <Stat label="Cost of sales" value={formatCurrency(totals.cost)} tone="warning" />
        <Stat label="Staff" value={formatCurrency(totals.staff)} tone="info" />
        <Stat label="Net margin" value={formatCurrency(totals.margin)} emphasis />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {BEER_HALLS.map((b) => {
          const margin = beerHallNetMargin(b);
          const marginPct = b.revenueUsd > 0 ? (margin / b.revenueUsd) * 100 : 0;
          const expiryDays = Math.floor((new Date(b.liquorExpiry).getTime() - new Date('2026-04-17').getTime()) / (1000 * 60 * 60 * 24));
          const expiringSoon = expiryDays <= 120;
          return (
            <Card key={b.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-body font-semibold text-ink">{b.name}</h2>
                  <p className="mt-0.5 text-micro text-muted">{b.ward} ward · Manager {b.manager}</p>
                </div>
                <Badge tone={STATUS_TONE[b.status]} dot>{b.status}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-small">
                <Line label="Revenue"        value={formatCurrency(b.revenueUsd)}    tone="success" />
                <Line label="Cost of sales"  value={formatCurrency(b.costOfSalesUsd)} tone="warning" />
                <Line label="Staff costs"    value={formatCurrency(b.staffUsd)}       tone="info" />
                <Line label="Net margin"     value={formatCurrency(margin)}           tone={margin >= 0 ? 'success' : 'danger'} emphasis />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-micro text-muted">
                  <span>Margin %</span>
                  <span className={cn('font-semibold tabular-nums', marginPct >= 20 ? 'text-success' : marginPct >= 10 ? 'text-info' : 'text-warning')}>
                    {marginPct.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <span
                    className={cn('block h-full rounded-full', marginPct >= 20 ? 'bg-success' : marginPct >= 10 ? 'bg-info' : 'bg-warning')}
                    style={{ width: `${Math.min(100, Math.max(0, marginPct * 3))}%` }}
                  />
                </div>
              </div>

              <div className={cn(
                'mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-small',
                expiringSoon ? 'border-warning/20 bg-warning/5 text-warning' : 'border-line bg-surface/40 text-muted',
              )}>
                {expiringSoon && <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                <div>
                  <div className="text-micro font-semibold uppercase tracking-wide">Liquor licence</div>
                  <div className="text-ink">Expires {formatDate(b.liquorExpiry)}</div>
                  {expiringSoon && (
                    <div className="mt-0.5">{expiryDays} days — renewal reminder queued.</div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone, emphasis }: { label: string; value: string; tone?: 'success' | 'warning' | 'info'; emphasis?: boolean }) {
  const toneClass = emphasis ? 'text-brand-primary' : tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-info';
  return (
    <Card className={cn('p-4', emphasis && 'border-brand-primary shadow-ring-brand')}>
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 text-h3 font-bold tabular-nums', toneClass)}>{value}</div>
    </Card>
  );
}

function Line({ label, value, tone, emphasis }: { label: string; value: string; tone: 'success' | 'warning' | 'info' | 'danger'; emphasis?: boolean }) {
  const toneClass =
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
    tone === 'danger'  ? 'text-danger'  :
                         'text-info';
  return (
    <div>
      <div className="text-micro text-muted">{label}</div>
      <div className={cn('font-semibold tabular-nums', toneClass, emphasis && 'text-body')}>
        {value}
      </div>
    </div>
  );
}
