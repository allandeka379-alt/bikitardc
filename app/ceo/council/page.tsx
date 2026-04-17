// CEO governance drill-down.

'use client';

import { ArrowLeft, Gavel } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ChartShell, Donut, HorizontalBars, ProgressRing, RadarPlot, Sparkline, StackedArea } from '@/components/ceo/charts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CHART_TOKENS } from '@/lib/charts/tokens';
import { formatDate } from '@/lib/format';
import {
  ACTION_ITEMS,
  COUNCIL_MEETINGS,
  KIND_LABEL,
  RESOLUTIONS,
  RES_STATUS_LABEL,
  openActions,
} from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

function synthTrend(seed: number, n = 12, base = 20, amp = 10): number[] {
  return Array.from({ length: n }, (_, i) => {
    const v = base + Math.sin((i + seed) * 0.7) * amp + (i * amp) / (n * 2);
    return Math.max(0, Math.round(v * 10) / 10);
  });
}

export default function CeoCouncilPage() {
  const passed = RESOLUTIONS.filter((r) => r.status === 'passed' || r.status === 'actioned').length;
  const passRate = (passed / (RESOLUTIONS.length || 1)) * 100;
  const completionPct = Math.round((ACTION_ITEMS.filter((a) => a.status === 'completed').length / Math.max(1, ACTION_ITEMS.length)) * 100);

  // Resolutions by status donut
  const resByStatus = new Map<string, number>();
  for (const r of RESOLUTIONS) resByStatus.set(r.status, (resByStatus.get(r.status) ?? 0) + 1);
  const resDonut = [...resByStatus.entries()].map(([k, value]) => ({
    name: RES_STATUS_LABEL[k as keyof typeof RES_STATUS_LABEL],
    value,
    color:
      k === 'passed'    ? CHART_TOKENS.success :
      k === 'actioned'  ? CHART_TOKENS.primary :
      k === 'rejected'  ? CHART_TOKENS.danger  :
      k === 'deferred'  ? CHART_TOKENS.warning :
      k === 'amended'   ? CHART_TOKENS.sky :
                          CHART_TOKENS.axisLabel,
  }));

  // Action items by department (HB)
  const actByDept = new Map<string, number>();
  for (const a of ACTION_ITEMS) actByDept.set(a.department, (actByDept.get(a.department) ?? 0) + 1);
  const actDeptBars = [...actByDept.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  // Radar: action-status profile by department (top 4)
  const topDepts = [...actByDept.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([d]) => d);
  const axes: { axis: string; match: (a: typeof ACTION_ITEMS[number]) => boolean }[] = [
    { axis: 'Open',         match: (a) => a.status === 'open' },
    { axis: 'In progress',  match: (a) => a.status === 'in-progress' },
    { axis: 'Overdue',      match: (a) => a.status === 'overdue' },
    { axis: 'Completed',    match: (a) => a.status === 'completed' },
    { axis: 'Total',        match: () => true },
  ];
  const radarData = axes.map(({ axis, match }) => {
    const row: Record<string, number | string> = { axis };
    for (const d of topDepts) row[d] = ACTION_ITEMS.filter((a) => a.department === d && match(a)).length;
    return row;
  });

  // Stacked area: resolutions over past 6 meetings
  const meetingHistory = [...COUNCIL_MEETINGS]
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1))
    .slice(-6);
  const trendRows = meetingHistory.map((m) => {
    const rs = RESOLUTIONS.filter((r) => r.meetingId === m.id);
    return {
      x: formatDate(m.startsAt).slice(0, 6),
      passed:   rs.filter((r) => r.status === 'passed').length,
      actioned: rs.filter((r) => r.status === 'actioned').length,
      deferred: rs.filter((r) => r.status === 'deferred').length,
      rejected: rs.filter((r) => r.status === 'rejected').length,
    };
  });

  const upcoming = COUNCIL_MEETINGS.filter((m) => m.status === 'scheduled').sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
  const overdueActions = ACTION_ITEMS.filter((a) => a.status === 'overdue');

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/ceo" className="mb-3 inline-flex items-center gap-1.5 text-small text-muted hover:text-brand-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Governance</h1>
          <p className="mt-1 text-small text-muted">Meetings, resolutions, action items, and the CEO decision log.</p>
        </div>
      </ScrollReveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Meetings scheduled" value={upcoming.length.toString()} sub={upcoming[0] ? formatDate(upcoming[0].startsAt) : 'None'} spark={synthTrend(1, 12, 4, 2)} sparkColor={CHART_TOKENS.primary} />
        <Stat label="Resolutions passed" value={passed.toString()} sub={`${Math.round(passRate)}% pass rate`} tone="success" spark={synthTrend(3, 12, 14, 5)} sparkColor={CHART_TOKENS.success} />
        <Stat label="Open action items"  value={openActions().length.toString()} sub={`${overdueActions.length} overdue`} tone={overdueActions.length > 0 ? 'warning' : 'info'} spark={synthTrend(5, 12, 12, 4)} sparkColor={CHART_TOKENS.warning} />
        <Stat label="Total meetings YTD" value={COUNCIL_MEETINGS.length.toString()} sub={`${COUNCIL_MEETINGS.filter((m) => m.status === 'ratified').length} ratified`} spark={synthTrend(7, 12, 10, 3)} sparkColor={CHART_TOKENS.sky} />
      </div>

      {/* Resolution donut + completion gauge + stacked area trend */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_2fr]">
        <ScrollReveal>
          <ChartShell title="Resolutions by status" subtitle={`${RESOLUTIONS.length} resolutions on record`}>
            <Donut data={resDonut} />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <Card className="h-full p-5">
            <div className="mb-1">
              <h3 className="text-body font-semibold text-ink">Completion rate</h3>
              <p className="mt-0.5 text-micro text-muted">Action items closed</p>
            </div>
            <div className="h-[180px]">
              <ProgressRing value={completionPct} label="Closed" color={CHART_TOKENS.success} sublabel={`${ACTION_ITEMS.filter((a) => a.status === 'completed').length} of ${ACTION_ITEMS.length}`} />
            </div>
          </Card>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <ChartShell title="Resolution outcomes by meeting" subtitle="Recent 6 meetings">
            <StackedArea
              data={trendRows}
              series={[
                { key: 'passed',   label: 'Passed',   color: CHART_TOKENS.success },
                { key: 'actioned', label: 'Actioned', color: CHART_TOKENS.primary },
                { key: 'deferred', label: 'Deferred', color: CHART_TOKENS.warning },
                { key: 'rejected', label: 'Rejected', color: CHART_TOKENS.danger },
              ]}
            />
          </ChartShell>
        </ScrollReveal>
      </div>

      {/* Radar + action items bars */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ScrollReveal>
          <ChartShell title="Action items — department profile" subtitle="Top 4 departments across status dimensions" height={300}>
            <RadarPlot
              data={radarData}
              series={topDepts.map((d) => ({ key: d, label: d }))}
            />
          </ChartShell>
        </ScrollReveal>
        <ScrollReveal delay={40}>
          <Card className="p-5">
            <h3 className="mb-4 text-body font-semibold text-ink">Action items by department</h3>
            <HorizontalBars data={actDeptBars} valueFormatter={(v) => v.toString()} />
          </Card>
        </ScrollReveal>
      </div>

      {/* Upcoming meetings + Overdue actions */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-h3 text-ink">Upcoming meetings</h3>
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((m) => (
              <li key={m.id}>
                <Link href={`/erp/council/meetings/${m.id}`} className="block py-3 transition-colors hover:text-brand-primary">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-3.5 w-3.5 text-brand-primary" />
                    <Badge tone="brand">{KIND_LABEL[m.kind]}</Badge>
                  </div>
                  <div className="mt-1 text-small font-semibold text-ink">{m.title}</div>
                  <div className="text-micro text-muted">{formatDate(m.startsAt)} · {m.venue} · Chair {m.chair}</div>
                </Link>
              </li>
            ))}
            {upcoming.length === 0 && (<li className="py-4 text-center text-small text-muted">No meetings scheduled.</li>)}
          </ul>
        </Card>

        <Card className="p-5">
          <h3 className="text-h3 text-ink">Overdue actions</h3>
          <ul className="mt-3 divide-y divide-line text-small">
            {overdueActions.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-micro text-muted">{a.reference}</span>
                  <Badge tone="danger">Overdue</Badge>
                </div>
                <div className="mt-1 font-semibold text-ink">{a.description}</div>
                <div className="mt-0.5 flex items-center justify-between text-micro text-muted">
                  <span>{a.owner} · {a.department}</span>
                  <span>Due {formatDate(a.dueAt)}</span>
                </div>
              </li>
            ))}
            {overdueActions.length === 0 && (<li className="py-4 text-center text-small text-success">No overdue items.</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, tone, spark, sparkColor }: { label: string; value: string; sub: string; tone?: 'success' | 'warning' | 'info'; spark: number[]; sparkColor: string }) {
  const toneClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-ink';
  return (
    <Card className="p-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className={cn('mt-1 text-h2 font-bold tabular-nums', toneClass)}>{value}</div>
      <div className="text-micro text-muted">{sub}</div>
      <div className="mt-2">
        <Sparkline data={spark} color={sparkColor} height={26} width={140} />
      </div>
    </Card>
  );
}
