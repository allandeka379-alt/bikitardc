// Council workflow hub.

'use client';

import { ArrowRight, CalendarClock, CheckSquare, ClipboardList, Gavel } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import {
  ACTION_ITEMS,
  COUNCIL_MEETINGS,
  KIND_LABEL,
  MEETING_STATUS_LABEL,
  MEETING_STATUS_TONE,
  RESOLUTIONS,
  openActions,
} from '@/mocks/fixtures/council';
import { cn } from '@/lib/cn';

export default function CouncilHubPage() {
  const open = openActions();
  const overdue = ACTION_ITEMS.filter((a) => a.status === 'overdue').length;
  const upcoming = COUNCIL_MEETINGS.filter((m) => m.status === 'scheduled').sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
  const passedThisCycle = RESOLUTIONS.filter((r) => r.status === 'passed' || r.status === 'actioned').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Council workflow</h1>
          <p className="mt-1 text-small text-muted">
            Agenda builder, resolutions tracker and action-item follow-through for every council sitting.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Upcoming meetings"  value={upcoming.length.toString()}      sub={upcoming[0] ? `Next: ${formatDate(upcoming[0].startsAt)}` : 'None scheduled'} href="/erp/council/meetings"    Icon={CalendarClock} tone="brand" />
        <Kpi label="Open actions"       value={open.length.toString()}          sub={`${overdue} overdue`}                                                        href="/erp/council/actions"     Icon={CheckSquare}    tone={overdue > 0 ? 'warning' : 'info'} />
        <Kpi label="Resolutions passed" value={passedThisCycle.toString()}      sub={`Last 30 days`}                                                               href="/erp/council/resolutions" Icon={Gavel}          tone="success" />
        <Kpi label="Minutes drafted"    value={COUNCIL_MEETINGS.filter((m) => m.status === 'minuted' || m.status === 'ratified').length.toString()} sub="Awaiting ratification" href="/erp/council/meetings" Icon={ClipboardList} tone="info" />
      </div>

      {/* Upcoming + actions */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ScrollReveal delay={60}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Upcoming meetings</h2>
              <Link href="/erp/council/meetings" className="text-micro font-semibold text-brand-primary hover:underline">See all</Link>
            </div>
            <ul className="divide-y divide-line">
              {upcoming.map((m) => (
                <li key={m.id} className="py-3">
                  <Link href={`/erp/council/meetings/${m.id}`} className="block hover:text-brand-primary">
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">{KIND_LABEL[m.kind]}</Badge>
                      <Badge tone={MEETING_STATUS_TONE[m.status]}>{MEETING_STATUS_LABEL[m.status]}</Badge>
                    </div>
                    <div className="mt-1 text-small font-semibold text-ink">{m.title}</div>
                    <div className="text-micro text-muted">{formatDate(m.startsAt)} · {m.venue}</div>
                  </Link>
                </li>
              ))}
              {upcoming.length === 0 && <li className="py-4 text-center text-small text-muted">No meetings scheduled.</li>}
            </ul>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-h3 text-ink">Open action items</h2>
              <Link href="/erp/council/actions" className="text-micro font-semibold text-brand-primary hover:underline">See all</Link>
            </div>
            <ul className="divide-y divide-line">
              {open.slice(0, 6).map((a) => (
                <li key={a.id} className="py-3 text-small">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-micro text-muted">{a.reference}</span>
                    {a.status === 'overdue' && <Badge tone="danger">Overdue</Badge>}
                  </div>
                  <div className="mt-0.5 text-ink">{a.description}</div>
                  <div className="mt-0.5 flex items-center justify-between text-micro text-muted">
                    <span>{a.owner}</span>
                    <span>Due {formatDate(a.dueAt)}</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-line">
                    <span className={cn('block h-full rounded-full', a.status === 'overdue' ? 'bg-danger' : a.progressPct >= 80 ? 'bg-success' : 'bg-brand-primary')} style={{ width: `${a.progressPct}%` }} />
                  </div>
                </li>
              ))}
              {open.length === 0 && <li className="py-4 text-center text-small text-muted">No open actions.</li>}
            </ul>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, href, Icon, tone }: { label: string; value: string; sub: string; href: string; Icon: React.ElementType; tone: 'brand' | 'info' | 'warning' | 'success' }) {
  const toneClass = tone === 'brand' ? 'bg-brand-primary/10 text-brand-primary' : tone === 'warning' ? 'bg-warning/10 text-warning' : tone === 'success' ? 'bg-success/10 text-success' : 'bg-info/10 text-info';
  return (
    <Link href={href} className="group flex flex-col gap-2 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)} aria-hidden><Icon className="h-4 w-4" /></span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:text-brand-primary" />
      </div>
      <div className="text-micro font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="text-h2 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Link>
  );
}
