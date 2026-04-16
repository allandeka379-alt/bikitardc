// ─────────────────────────────────────────────
// CAMPFIRE quotas &amp; off-takes — wildlife quota
// allocations by ward + species, off-take schedule,
// and the dividend ring-fenced per ward.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  CAMPFIRE_OFFTAKES,
  CAMPFIRE_QUOTAS,
  SPECIES_LABEL,
  campfireYtdLevies,
  quotasByWard,
  type CampfireOfftake,
} from '@/mocks/fixtures/campfire';
import { cn } from '@/lib/cn';

const OFFTAKE_TONE: Record<CampfireOfftake['status'], 'success' | 'info' | 'warning' | 'danger'> = {
  completed:  'success',
  paid:       'info',
  scheduled:  'warning',
  cancelled:  'danger',
};

export default function CampfirePage() {
  const byWard = quotasByWard();
  const ytd = campfireYtdLevies();
  const wards = Object.keys(byWard);

  const allocated = CAMPFIRE_QUOTAS.reduce((s, q) => s + q.allocated, 0);
  const utilised  = CAMPFIRE_QUOTAS.reduce((s, q) => s + q.utilised, 0);
  const utilPct   = allocated > 0 ? (utilised / allocated) * 100 : 0;

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
          <h1 className="text-h1 text-ink">CAMPFIRE quotas &amp; off-takes</h1>
          <p className="mt-1 text-small text-muted">
            ZimParks-allocated wildlife quotas across {wards.length} wards. Levies are ring-fenced for the contributing ward&rsquo;s dividend.
          </p>
        </div>
      </ScrollReveal>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <Stat label="YTD levies" value={formatCurrency(ytd)} tone="success" emphasis />
        <Stat label="Animals allocated" value={allocated.toString()} tone="info" />
        <Stat label="Animals off-taken" value={utilised.toString()} tone="info" />
        <Stat label="Utilisation" value={`${utilPct.toFixed(0)}%`} tone={utilPct >= 80 ? 'warning' : 'info'} />
      </div>

      {/* Quotas by ward */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {wards.map((ward) => {
          const quotas = byWard[ward]!;
          const wardTotal = quotas.reduce((s, q) => s + q.allocated * q.feePerOfftakeUsd, 0);
          const wardEarned = quotas.reduce((s, q) => s + q.utilised * q.feePerOfftakeUsd, 0);
          return (
            <Card key={ward} className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-line bg-surface/60 px-5 py-3">
                <div>
                  <div className="text-body font-semibold text-ink">{ward} ward</div>
                  <div className="text-micro text-muted">{quotas.length} species</div>
                </div>
                <div className="text-right">
                  <div className="text-small font-semibold tabular-nums text-ink">{formatCurrency(wardEarned)}</div>
                  <div className="text-micro text-muted">of {formatCurrency(wardTotal)} potential</div>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {quotas.map((q) => {
                  const pct = q.allocated > 0 ? (q.utilised / q.allocated) * 100 : 0;
                  return (
                    <li key={q.id} className="flex items-center justify-between gap-4 px-5 py-3 text-small">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">{SPECIES_LABEL[q.species]}</span>
                          <span className="text-micro text-muted">·{formatCurrency(q.feePerOfftakeUsd)}/offtake</span>
                        </div>
                        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                          <span
                            className={cn('block h-full rounded-full', pct >= 100 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-brand-primary')}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-small font-semibold text-ink">{q.utilised} / {q.allocated}</div>
                        <div className="text-micro text-muted">{Math.round(pct)}%</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Off-takes log */}
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-surface/60 px-5 py-3">
          <h2 className="text-body font-semibold text-ink">Off-takes · {CAMPFIRE_OFFTAKES.length} bookings YTD</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-left">Species</th>
                <th className="px-5 py-3 text-left">Operator</th>
                <th className="px-5 py-3 text-left">Hunter origin</th>
                <th className="px-5 py-3 text-right">Levy</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {CAMPFIRE_OFFTAKES.sort((a, b) => (a.offtakeDate < b.offtakeDate ? 1 : -1)).map((o) => (
                <tr key={o.id} className="border-b border-line last:border-b-0 hover:bg-surface/40">
                  <td className="px-5 py-3 text-muted">{formatDate(o.offtakeDate)}</td>
                  <td className="px-5 py-3 text-ink">{o.ward}</td>
                  <td className="px-5 py-3">{SPECIES_LABEL[o.species]}</td>
                  <td className="px-5 py-3 text-ink">{o.operator}</td>
                  <td className="px-5 py-3 font-mono text-micro text-muted">{o.huntersOrigin}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(o.levyUsd)}</td>
                  <td className="px-5 py-3"><Badge tone={OFFTAKE_TONE[o.status]} dot>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone, emphasis }: { label: string; value: string; tone: 'success' | 'info' | 'warning'; emphasis?: boolean }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-info';
  return (
    <Card className={cn('p-4', emphasis && 'border-success/30 bg-success/5')}>
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', toneClass)}>{value}</div>
    </Card>
  );
}
