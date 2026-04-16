'use client';

// ─────────────────────────────────────────────
// TransparencySection
//
// Two-column (desktop): Recharts bar chart on the
// left showing ward-level collected vs spent, a
// callout list of transparency links on the right.
//
// Demonstrates the CHART_TOKENS pipeline (see
// lib/charts/tokens.ts) at the earliest possible
// point in the demo so later dashboards inherit
// the same style.
// ─────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Calendar, FileText, Landmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatCurrencyCompact } from '@/lib/charts/formatters';
import type { WardBudget } from '@/mocks/fixtures/budget';

async function fetchBudget(): Promise<WardBudget[]> {
  const res = await fetch('/api/public/budget');
  const json = (await res.json()) as { items: WardBudget[] };
  return json.items;
}

export function TransparencySection() {
  const t = useTranslations('landing.transparency');
  const { data = [] } = useQuery({ queryKey: ['public-budget'], queryFn: fetchBudget });

  return (
    <section
      id="transparency"
      className="mx-auto max-w-[1200px] px-5 pt-20 sm:px-8 sm:pt-24"
    >
      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <ScrollReveal>
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5">
              <div>
                <h2 className="text-h3 font-semibold text-ink sm:text-[1.375rem]">
                  {t('title')}
                </h2>
                <p className="mt-1 text-small text-muted">{t('subtitle')}</p>
              </div>
              <Link
                href="/budget"
                className="inline-flex shrink-0 items-center gap-1 rounded-sm text-small font-medium text-brand-primary hover:underline"
              >
                {t('viewBudget')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="px-2 py-5 sm:px-4">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    barCategoryGap={18}
                  >
                    <CartesianGrid
                      stroke={CHART_TOKENS.grid}
                      strokeDasharray="2 6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="ward"
                      tickLine={false}
                      axisLine={{ stroke: CHART_TOKENS.axisLine }}
                      tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                      dy={6}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrencyCompact(v as number)}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: CHART_TOKENS.axisLabel, fontSize: 11 }}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ fill: CHART_TOKENS.cursor }}
                      content={<BudgetTooltip collectedLabel={t('legendCollected')} spentLabel={t('legendSpent')} />}
                    />
                    <Legend
                      verticalAlign="top"
                      height={32}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', color: CHART_TOKENS.tooltipMuted }}
                      formatter={(value) =>
                        value === 'collected' ? t('legendCollected') : t('legendSpent')
                      }
                    />
                    <Bar
                      dataKey="collected"
                      fill={CHART_TOKENS.primary}
                      radius={[4, 4, 0, 0]}
                      animationDuration={650}
                    />
                    <Bar
                      dataKey="spent"
                      fill={CHART_TOKENS.accent}
                      radius={[4, 4, 0, 0]}
                      animationDuration={650}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={100} className="flex flex-col gap-3">
          <TransparencyLink href="/tenders"  icon={<FileText className="h-5 w-5" />} label={t('links.tenders')} />
          <TransparencyLink href="/meetings" icon={<Calendar className="h-5 w-5" />} label={t('links.meetings')} />
          <TransparencyLink href="/bylaws"   icon={<Landmark className="h-5 w-5" />} label={t('links.bylaws')} />
        </ScrollReveal>
      </div>
    </section>
  );
}

function TransparencyLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-lg border border-line bg-card px-5 py-4 transition-all duration-base ease-out-expo hover:border-brand-primary/25 hover:shadow-card-sm"
    >
      <div className="inline-flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center rounded-md bg-brand-primary/8 text-brand-primary"
          aria-hidden
        >
          {icon}
        </span>
        <span className="text-body font-medium text-ink">{label}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-primary" />
    </Link>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  collectedLabel: string;
  spentLabel: string;
}

function BudgetTooltip({ active, payload, label, collectedLabel, spentLabel }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const collected = payload.find((p) => p.dataKey === 'collected')?.value ?? 0;
  const spent = payload.find((p) => p.dataKey === 'spent')?.value ?? 0;
  return (
    <div
      style={{
        background: CHART_TOKENS.tooltipBg,
        border: `1px solid ${CHART_TOKENS.tooltipBorder}`,
        boxShadow: CHART_TOKENS.tooltipShadow,
        borderRadius: 8,
        padding: '10px 12px',
        minWidth: 180,
      }}
    >
      <div style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
        {label}
      </div>
      <TooltipRow color={CHART_TOKENS.primary} label={collectedLabel} value={collected} />
      <TooltipRow color={CHART_TOKENS.accent} label={spentLabel} value={spent} />
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontSize: 12, padding: '2px 0' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: CHART_TOKENS.tooltipMuted }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
        {label}
      </span>
      <span style={{ color: CHART_TOKENS.tooltipText, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
        {formatCurrencyCompact(value)}
      </span>
    </div>
  );
}
