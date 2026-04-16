// Works & asset management hub.

'use client';

import {
  ArrowRight,
  Building2,
  ClipboardList,
  Fuel,
  Truck,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { FLEET, FUEL_LOGS, totalsFleet } from '@/mocks/fixtures/fleet';
import {
  WORK_ORDERS,
  countByStatus,
  openCount,
} from '@/mocks/fixtures/work-orders';
import { cn } from '@/lib/cn';

export default function WorksHubPage() {
  const fleet = totalsFleet();
  const wo = countByStatus();
  const open = openCount();

  const fuelSpendMonth = FUEL_LOGS.reduce((s, f) => s + f.costUsd, 0);
  const recent = [...WORK_ORDERS].sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1)).slice(0, 6);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Works &amp; assets</h1>
          <p className="mt-1 text-small text-muted">
            Fleet, plant, work orders, road maintenance and water / sanitation infrastructure — one command centre.
          </p>
        </div>
      </ScrollReveal>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open work orders"    value={open.toString()}               sub={`${wo.open} unassigned · ${wo['in-progress']} in progress`}   href="/erp/works/work-orders"  Icon={ClipboardList} tone={open > 8 ? 'warning' : 'info'} />
        <Kpi label="Active fleet"        value={`${fleet.active}/${fleet.total}`} sub={`${fleet.serviceDue} due a service`}                        href="/erp/works/fleet"        Icon={Truck}          tone="brand" />
        <Kpi label="Fuel spend (MTD)"    value={formatCurrency(fuelSpendMonth)} sub={`${FUEL_LOGS.length} refills logged`}                        href="/erp/works/fleet"        Icon={Fuel}           tone="warning" />
        <Kpi label="Blocked items"       value={(wo.blocked ?? 0).toString()}   sub="parts / external suppliers"                                   href="/erp/works/work-orders"  Icon={Wrench}         tone={wo.blocked > 0 ? 'danger' : 'info'} />
      </div>

      {/* Recent WOs + modules */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal delay={60}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h2 className="text-h3 text-ink">Recent work orders</h2>
                <p className="text-micro text-muted">Latest 6 raised across all teams.</p>
              </div>
              <Link href="/erp/works/work-orders" className="text-micro font-semibold text-brand-primary hover:underline">See all</Link>
            </div>
            <ul className="divide-y divide-line">
              {recent.map((w) => (
                <li key={w.id}>
                  <Link href={`/erp/works/work-orders/${w.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-small hover:bg-surface/60">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-micro text-muted">{w.reference}</span>
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            w.priority === 'urgent' ? 'bg-danger/10 text-danger' :
                            w.priority === 'high'   ? 'bg-warning/10 text-warning' :
                            w.priority === 'medium' ? 'bg-info/10 text-info' :
                                                      'bg-line text-muted',
                          )}
                        >
                          {w.priority}
                        </span>
                      </div>
                      <div className="truncate-line font-semibold text-ink">{w.title}</div>
                      <div className="truncate-line text-micro text-muted">{w.team} · {w.location}</div>
                    </div>
                    <span className="shrink-0 text-micro text-muted">{w.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="grid gap-3">
            <ModuleTile title="Fleet & plant"     body={`${FLEET.length} vehicles incl. grader, backhoe and refuse truck.`} href="/erp/works/fleet"        Icon={Truck} />
            <ModuleTile title="Work orders"       body={`${WORK_ORDERS.length} total · ${open} open.`}                    href="/erp/works/work-orders"  Icon={ClipboardList} />
            <ModuleTile title="Maintenance plan"  body="Road grading, water/sewer and dam rehab schedule."                 href="/erp/works/maintenance" Icon={Wrench} />
            <ModuleTile title="Asset register"    body="Cross-links with Finance's fixed-asset module."                    href="/erp/finance/fixed-assets" Icon={Building2} />
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, href, Icon, tone }: { label: string; value: string; sub: string; href: string; Icon: React.ElementType; tone: 'brand' | 'info' | 'warning' | 'danger' }) {
  const toneClass =
    tone === 'brand'   ? 'bg-brand-primary/10 text-brand-primary' :
    tone === 'warning' ? 'bg-warning/10       text-warning'       :
    tone === 'danger'  ? 'bg-danger/10        text-danger'        :
                         'bg-info/10          text-info';
  return (
    <Link href={href} className="group flex flex-col gap-2 rounded-lg border border-line bg-card p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:shadow-card-md">
      <div className="flex items-center justify-between">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:text-brand-primary" />
      </div>
      <div className="text-micro font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="text-h2 font-bold tabular-nums text-ink">{value}</div>
      <div className="text-micro text-muted">{sub}</div>
    </Link>
  );
}

function ModuleTile({ title, body, href, Icon }: { title: string; body: string; href: string; Icon: React.ElementType }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-lg border border-line bg-card p-4 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-body font-semibold text-ink group-hover:text-brand-primary">
          {title}
          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <p className="mt-1 text-small text-muted">{body}</p>
      </div>
    </Link>
  );
}
