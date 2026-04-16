// ─────────────────────────────────────────────
// Market stall register — every council-managed
// stall with its holder, fee tier and current
// balance. Forms the billable base for the
// monthly market-fees billing run.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  MARKET_STALLS,
  stallsByMarket,
  totalMarketArrears,
  type MarketStall,
  type MarketStallStatus,
} from '@/mocks/fixtures/market-stalls';
import { cn } from '@/lib/cn';

const STATUS_TONE: Record<MarketStallStatus, 'success' | 'info' | 'danger'> = {
  occupied:  'success',
  vacant:    'info',
  suspended: 'danger',
};

export default function MarketFeesPage() {
  const [q, setQ] = useState('');
  const byMarket = stallsByMarket();
  const arrears = totalMarketArrears();

  const filterStalls = (stalls: MarketStall[]) => {
    const ql = q.trim().toLowerCase();
    if (!ql) return stalls;
    return stalls.filter(
      (s) =>
        s.code.toLowerCase().includes(ql) ||
        (s.holderName ?? '').toLowerCase().includes(ql) ||
        s.trade.toLowerCase().includes(ql),
    );
  };

  const totals = useMemo(() => {
    const occupied = MARKET_STALLS.filter((s) => s.status === 'occupied').length;
    const vacant   = MARKET_STALLS.filter((s) => s.status === 'vacant').length;
    return { occupied, vacant, total: MARKET_STALLS.length };
  }, []);

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
          <h1 className="text-h1 text-ink">Market stalls</h1>
          <p className="mt-1 text-small text-muted">
            {totals.total} registered stalls across {Object.keys(byMarket).length} markets
            {' · '}
            <span className="font-semibold text-warning">{formatCurrency(arrears)}</span> in total arrears.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Metric label="Occupied" value={totals.occupied.toString()} tone="success" />
        <Metric label="Vacant"   value={totals.vacant.toString()}   tone="info" />
        <Metric label="Arrears"  value={formatCurrency(arrears)}    tone="warning" />
      </div>

      <Card className="overflow-hidden">
        <div className="relative border-b border-line px-5 py-3">
          <Filter className="pointer-events-none absolute left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search by stall code, holder or trade…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <div className="divide-y divide-line">
          {Object.entries(byMarket).map(([marketName, stalls]) => {
            const filtered = filterStalls(stalls);
            if (filtered.length === 0 && q) return null;
            const marketArrears = stalls.reduce((s, x) => s + x.balanceUsd, 0);
            return (
              <div key={marketName}>
                <div className="flex items-center justify-between bg-surface/60 px-5 py-2.5">
                  <div>
                    <div className="text-body font-semibold text-ink">{marketName}</div>
                    <div className="text-micro text-muted">{stalls.length} stalls</div>
                  </div>
                  <div className={cn('text-small font-semibold tabular-nums', marketArrears > 0 ? 'text-warning' : 'text-muted')}>
                    {marketArrears > 0 ? `${formatCurrency(marketArrears)} arrears` : 'All clear'}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-small">
                    <thead>
                      <tr className="border-b border-line text-micro font-semibold uppercase tracking-wide text-muted">
                        <th className="px-5 py-2 text-left">Stall</th>
                        <th className="px-5 py-2 text-left">Trade</th>
                        <th className="px-5 py-2 text-left">Holder</th>
                        <th className="px-5 py-2 text-left">Fee</th>
                        <th className="px-5 py-2 text-left">Status</th>
                        <th className="px-5 py-2 text-right">Balance</th>
                        <th className="px-5 py-2 text-left">Last paid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s) => (
                        <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-surface/40">
                          <td className="px-5 py-2 font-mono text-micro text-ink">{s.code}</td>
                          <td className="px-5 py-2 text-muted">{s.trade}</td>
                          <td className="px-5 py-2">
                            {s.holderName ? (
                              <>
                                <div className="text-ink">{s.holderName}</div>
                                <div className="text-micro text-muted">{s.holderPhone}</div>
                              </>
                            ) : (
                              <span className="text-micro italic text-muted">Unassigned</span>
                            )}
                          </td>
                          <td className="px-5 py-2 tabular-nums text-muted">
                            {formatCurrency(s.feeUsd)} <span className="text-micro">/{s.tier}</span>
                          </td>
                          <td className="px-5 py-2"><Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge></td>
                          <td className={cn('px-5 py-2 text-right font-semibold tabular-nums', s.balanceUsd > 0 ? 'text-warning' : 'text-muted')}>
                            {formatCurrency(s.balanceUsd)}
                          </td>
                          <td className="px-5 py-2 text-micro text-muted">
                            {s.lastPaidAt ? formatDate(s.lastPaidAt) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'success' | 'info' | 'warning' }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'info' ? 'text-info' : 'text-warning';
  return (
    <Card className="p-4">
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', toneClass)}>{value}</div>
    </Card>
  );
}
