// ─────────────────────────────────────────────
// Budget vs actual — grouped by vote, with
// per-line variance against pro-rata. Highlights
// lines that are running materially ahead of or
// behind the monthly pace.
// ─────────────────────────────────────────────

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import {
  BUDGET_LINES,
  VOTE_LABEL,
  YTD_PRORATA,
  computeVariance,
  totalsByKind,
  type BudgetKind,
  type BudgetLine,
} from '@/mocks/fixtures/budget-lines';
import { cn } from '@/lib/cn';

const KINDS: { kind: BudgetKind; label: string; tone: 'success' | 'warning' | 'brand' }[] = [
  { kind: 'revenue', label: 'Revenue', tone: 'success' },
  { kind: 'expense', label: 'Expenses', tone: 'warning' },
  { kind: 'capital', label: 'Capital works', tone: 'brand' },
];

export default function BudgetPage() {
  const [activeKind, setActiveKind] = useState<BudgetKind>('expense');
  const totals = totalsByKind();

  const lines = useMemo(
    () => BUDGET_LINES.filter((l) => l.kind === activeKind),
    [activeKind],
  );

  // Group expense/capital by vote; revenue stays flat (already by source)
  const grouped = useMemo(() => {
    if (activeKind === 'revenue') return [{ vote: null as null, lines }];
    const out: Record<string, BudgetLine[]> = {};
    for (const l of lines) (out[l.vote] ||= []).push(l);
    return Object.entries(out).map(([vote, lines]) => ({ vote, lines }));
  }, [lines, activeKind]);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/erp/finance"
        className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Finance
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Budget vs actual · FY2026</h1>
          <p className="mt-1 text-small text-muted">
            Pro-rata expected at today is <span className="font-semibold text-ink">{Math.round(YTD_PRORATA * 100)}%</span>.
            Lines over <span className="font-semibold text-warning">+10 pp</span> are flagged.
          </p>
        </div>
      </ScrollReveal>

      {/* Summary tiles */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {KINDS.map(({ kind, label, tone }) => {
          const t = totals[kind];
          const pct = t.approved > 0 ? t.actual / t.approved : 0;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => setActiveKind(kind)}
              className={cn(
                'rounded-lg border bg-card p-5 text-left transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md',
                activeKind === kind ? 'border-brand-primary shadow-ring-brand' : 'border-line',
              )}
            >
              <div className="flex items-center justify-between">
                <Badge tone={tone}>{label}</Badge>
                <span className="text-micro tabular-nums text-muted">{Math.round(pct * 100)}%</span>
              </div>
              <div className="mt-3 text-h2 font-bold tabular-nums text-ink">
                {formatCurrency(t.actual)}
              </div>
              <div className="text-micro text-muted">of {formatCurrency(t.approved)} approved</div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <span
                  className={cn(
                    'block h-full rounded-full transition-[width] duration-slow',
                    tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-brand-primary',
                  )}
                  style={{ width: `${Math.min(100, pct * 100)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lines by vote */}
      <div className="flex flex-col gap-4">
        {grouped.map((group, i) => (
          <ScrollReveal key={group.vote ?? 'flat'} delay={i * 40}>
            <Card className="overflow-hidden">
              {group.vote !== null && (
                <div className="border-b border-line bg-surface/60 px-5 py-3">
                  <div className="text-micro font-bold uppercase tracking-wider text-muted">Vote</div>
                  <div className="text-body font-semibold text-ink">
                    {VOTE_LABEL[group.vote as keyof typeof VOTE_LABEL]}
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-line text-micro font-semibold uppercase tracking-wide text-muted">
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-right">Approved</th>
                      <th className="px-5 py-3 text-right">YTD actual</th>
                      <th className="px-5 py-3 text-right">Remaining</th>
                      <th className="px-5 py-3 text-left">Consumption</th>
                      <th className="px-5 py-3 text-right">vs pro-rata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.lines.map((line) => {
                      const v = computeVariance(line);
                      const flag = line.kind === 'expense' && v.variancePct > 0.10;
                      return (
                        <tr key={line.id} className={cn('border-b border-line last:border-b-0 hover:bg-surface/60', flag && 'bg-warning/5')}>
                          <td className="px-5 py-3">
                            <div className="font-medium text-ink">{line.category}</div>
                            {line.glAccount && (
                              <div className="font-mono text-micro text-muted">GL {line.glAccount}</div>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-muted">{formatCurrency(line.approvedUsd)}</td>
                          <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(line.ytdActualUsd)}</td>
                          <td className={cn('px-5 py-3 text-right tabular-nums', v.remainingUsd < 0 ? 'text-danger font-semibold' : 'text-muted')}>
                            {formatCurrency(v.remainingUsd)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-line">
                                <span
                                  className={cn(
                                    'block h-full rounded-full',
                                    v.consumedPct >= 1 ? 'bg-danger' : v.variancePct > 0.10 ? 'bg-warning' : 'bg-brand-primary',
                                  )}
                                  style={{ width: `${Math.min(100, v.consumedPct * 100)}%` }}
                                />
                                {/* Pro-rata tick */}
                                <span
                                  className="absolute top-0 h-full w-[1px] bg-ink/40"
                                  style={{ left: `${YTD_PRORATA * 100}%` }}
                                  aria-hidden
                                />
                              </div>
                              <span className="tabular-nums text-ink">{Math.round(v.consumedPct * 100)}%</span>
                            </div>
                          </td>
                          <td className={cn('px-5 py-3 text-right font-semibold tabular-nums', v.variancePct > 0.10 ? 'text-warning' : v.variancePct < -0.10 ? 'text-info' : 'text-muted')}>
                            {v.variancePct >= 0 ? '+' : ''}{Math.round(v.variancePct * 100)} pp
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
