'use client';

import { Download, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { MonthlyCollectionsChart } from '@/components/erp/monthly-collections-chart';
import { PageHero } from '@/components/public/page-hero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CATEGORICAL_PALETTE, CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import { formatCurrency } from '@/lib/format';
import { WARD_BUDGET } from '@/mocks/fixtures/budget';
import {
  AGEING_DEBTORS,
  MONTHLY_COLLECTIONS,
  REVENUE_BY_SOURCE,
} from '@/mocks/fixtures/erp-kpis';

export default function BudgetPage() {
  const totalCollected = MONTHLY_COLLECTIONS.reduce((s, m) => s + m.collected, 0);
  const totalTarget = MONTHLY_COLLECTIONS.reduce((s, m) => s + m.target, 0);
  const performance = (totalCollected / totalTarget) * 100;

  const bySource = REVENUE_BY_SOURCE.reduce((s, r) => s + r.amount, 0);

  return (
    <>
      <PageHero
        eyebrow="Budget"
        title="Where your rates go."
        description="Ward-level collections, spending, month-on-month trend, and ageing debtors."
        actions={
          <Button variant="secondary" size="sm" leadingIcon={<Download className="h-3.5 w-3.5" />}>
            Download annual budget
          </Button>
        }
      />

      <section className="mx-auto max-w-[1200px] px-5 pb-24 pt-12 sm:px-8 sm:pb-32 sm:pt-14">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="Collected YTD" value={formatCurrencyCompact(totalCollected)} />
          <Metric label="Target YTD"    value={formatCurrencyCompact(totalTarget)} />
          <Metric label="Performance"   value={`${performance.toFixed(1)}%`} tone="brand" />
          <Metric label="MTD by source" value={formatCurrencyCompact(bySource)} />
        </div>

        <ScrollReveal>
          <Card className="mb-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 pb-4 pt-5">
              <div>
                <h2 className="text-h3 text-ink">Collected vs target</h2>
                <p className="text-micro text-muted">Last 12 months</p>
              </div>
              <Badge tone="brand">
                <TrendingUp className="h-3 w-3" />
                {performance.toFixed(1)}% hit-rate
              </Badge>
            </div>
            <div className="px-2 pb-4 pt-2 sm:px-4">
              <MonthlyCollectionsChart data={MONTHLY_COLLECTIONS} />
            </div>
          </Card>
        </ScrollReveal>

        <div className="grid gap-4 lg:grid-cols-2">
          <ScrollReveal>
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 pb-4 pt-5">
                <h2 className="text-h3 text-ink">Ward-level split</h2>
                <p className="text-micro text-muted">Collected vs spent — current period</p>
              </div>
              <div className="space-y-3 p-5">
                {WARD_BUDGET.map((w) => {
                  const ratio = w.spent / Math.max(1, w.collected);
                  return (
                    <div key={w.ward}>
                      <div className="flex items-center justify-between text-small">
                        <span className="font-medium text-ink">{w.ward}</span>
                        <span className="tabular-nums text-muted">
                          {formatCurrency(w.collected)} · {formatCurrency(w.spent)} spent
                        </span>
                      </div>
                      <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-surface">
                        <span
                          className="block h-full rounded-full bg-brand-primary transition-[width] duration-slow"
                          style={{ width: `${Math.min(100, (w.collected / (w.collected + 1)) * 100)}%` }}
                          aria-hidden
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-muted">
                        {(ratio * 100).toFixed(0)}% of collected already spent
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={60}>
            <Card className="overflow-hidden">
              <div className="border-b border-line px-5 pb-4 pt-5">
                <h2 className="text-h3 text-ink">Revenue sources</h2>
                <p className="text-micro text-muted">Month-to-date contribution</p>
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-[1fr_1fr]">
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={REVENUE_BY_SOURCE}
                        dataKey="amount"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {REVENUE_BY_SOURCE.map((_, i) => (
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
                                {formatCurrencyCompact(p.amount)}
                              </div>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="flex flex-col justify-center gap-1.5 text-small">
                  {REVENUE_BY_SOURCE.map((r, i) => (
                    <li key={r.label} className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-ink">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length] }}
                          aria-hidden
                        />
                        {r.label}
                      </span>
                      <span className="tabular-nums text-muted">{formatCurrency(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <Card className="mt-4 p-5 sm:p-6">
            <h2 className="text-h3 text-ink">Ageing debtors</h2>
            <p className="mt-1 text-small text-muted">
              Outstanding rates split by how long they've been owed.
            </p>
            <ul className="mt-4 space-y-3">
              {AGEING_DEBTORS.map((b, i) => (
                <li key={b.bucket}>
                  <div className="flex items-center justify-between text-small">
                    <span className="font-medium text-ink">{b.bucket}</span>
                    <span className="tabular-nums text-muted">
                      {formatCurrency(b.amount)} · {b.count} accounts
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                    <span
                      className="block h-full rounded-full transition-[width] duration-slow ease-out-expo"
                      style={{
                        width: `${(b.amount / AGEING_DEBTORS[0]!.amount) * 100}%`,
                        backgroundColor: [
                          CHART_TOKENS.success,
                          CHART_TOKENS.warning,
                          CHART_TOKENS.accent,
                          CHART_TOKENS.danger,
                        ][i],
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'brand' | 'danger';
}) {
  return (
    <Card className="p-4">
      <div className="text-micro text-muted">{label}</div>
      <div
        className={
          tone === 'brand'
            ? 'text-h3 font-bold tabular-nums text-brand-primary'
            : tone === 'danger'
              ? 'text-h3 font-bold tabular-nums text-danger'
              : 'text-h3 font-bold tabular-nums text-ink'
        }
      >
        {value}
      </div>
    </Card>
  );
}
