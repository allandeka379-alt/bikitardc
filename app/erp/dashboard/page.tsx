'use client';

// ─────────────────────────────────────────────
// ERP dashboard — spec §6.2 screen #12.
// Shows 4 KPI tiles, monthly collections chart,
// revenue by source, SLA widget, recent activity.
//
// Journey C step 2: "Today's collections (USD
// 2 145.50), Open tickets (18), Pending
// verifications (3)." — we pin those figures.
// ─────────────────────────────────────────────

import { ArrowRight, Banknote, ClipboardList, LifeBuoy, Percent, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { KpiTile } from '@/components/erp/kpi-tile';
import { MonthlyCollectionsChart } from '@/components/erp/monthly-collections-chart';
import { RevenueBySourceChart } from '@/components/erp/revenue-by-source-chart';
import { SlaWidget } from '@/components/erp/sla-widget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useErpStore } from '@/lib/stores/erp';
import {
  MONTHLY_COLLECTIONS,
  REVENUE_BY_SOURCE,
  TODAYS_KPIS,
} from '@/mocks/fixtures/erp-kpis';
import { AUDIT_ACTION_LABEL } from '@/mocks/fixtures/audit-log';
import { formatRelative } from '@/lib/format';

export default function ErpDashboardPage() {
  const { hydrated, fullName } = useCurrentUser();
  const audit = useErpStore((s) => s.audit);

  if (!hydrated) return null;

  const firstName = (fullName ?? '').split(' ')[0] ?? '';
  const [collections, openTickets, pendingVerif, collectionRate] = TODAYS_KPIS;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Header */}
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-small text-muted">Welcome back{firstName ? `, ${firstName}` : ''}.</p>
            <h1 className="mt-1 text-h1 text-ink sm:text-[1.875rem] sm:leading-[2.375rem]">
              Revenue & operations today
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/erp/reports">View reports</Link>
            </Button>
            <Button asChild size="sm" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              <Link href="/erp/payments/reconcile">Go to reconciliation</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ScrollReveal delay={0}>
          <KpiTile kpi={collections!} icon={<Banknote className="h-5 w-5" />} tint="navy" href="/erp/payments" />
        </ScrollReveal>
        <ScrollReveal delay={60}>
          <KpiTile kpi={openTickets!} icon={<LifeBuoy className="h-5 w-5" />} tint="danger" href="/erp/requests" />
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <KpiTile
            kpi={pendingVerif!}
            icon={<ShieldCheck className="h-5 w-5" />}
            tint="gold"
            href="/erp/crm?filter=pending-verifications"
          />
        </ScrollReveal>
        <ScrollReveal delay={180}>
          <KpiTile kpi={collectionRate!} icon={<Percent className="h-5 w-5" />} tint="sky" />
        </ScrollReveal>
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        <ScrollReveal>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 pb-4 pt-5">
              <div>
                <h2 className="text-h3 text-ink">Monthly collections</h2>
                <p className="mt-0.5 text-small text-muted">Collected vs target, last 12 months</p>
              </div>
              <Badge tone="brand">USD</Badge>
            </div>
            <div className="px-2 pb-4 pt-2 sm:px-4">
              <MonthlyCollectionsChart data={MONTHLY_COLLECTIONS} />
            </div>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 pb-4 pt-5">
              <div>
                <h2 className="text-h3 text-ink">Revenue by source</h2>
                <p className="mt-0.5 text-small text-muted">Month-to-date</p>
              </div>
            </div>
            <div className="px-2 pb-4 pt-2 sm:px-4">
              <RevenueBySourceChart data={REVENUE_BY_SOURCE} />
            </div>
          </Card>
        </ScrollReveal>
      </div>

      {/* Ops row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <ScrollReveal>
          <SlaWidget />
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-h3 text-ink">Recent activity</h2>
              <Badge tone="brand">
                <ClipboardList className="h-3 w-3" />
                {audit.length}
              </Badge>
            </div>
            <ul className="divide-y divide-line">
              {audit.slice(0, 6).map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-small font-medium text-ink">
                        <span>{a.actorName}</span>
                        <span className="ml-2 text-micro font-normal text-muted">
                          {AUDIT_ACTION_LABEL[a.action]}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate-line text-micro text-muted">{a.subject}</div>
                    </div>
                    <time className="shrink-0 text-micro text-muted">
                      {formatRelative(a.at)}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
