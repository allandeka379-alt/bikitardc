// Procurement module hub.

'use client';

import { ArrowRight, ClipboardList, FileSignature, Handshake, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { CONTRACTS, burnPct, daysToExpiry } from '@/mocks/fixtures/contracts';
import { countByStage, TENDERS } from '@/mocks/fixtures/procurement-tenders';
import { REQUISITIONS, countByStatus, totalUsd } from '@/mocks/fixtures/requisitions';
import { cn } from '@/lib/cn';

export default function ProcurementHubPage() {
  const reqs = countByStatus();
  const pendingReqs = reqs.submitted + reqs.approved + reqs['po-raised'] + reqs['grv-received'];
  const activeContracts = CONTRACTS.filter((c) => c.status === 'active').length;
  const expiring = CONTRACTS.filter((c) => c.status === 'expiring' || daysToExpiry(c) <= 60 && daysToExpiry(c) > 0).length;
  const openTenders = TENDERS.filter((t) => t.stage !== 'contract-signed' && t.stage !== 'cancelled').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Procurement</h1>
          <p className="mt-1 text-small text-muted">
            Requisitions, PRAZ-compliant tenders, supplier contracts and three-way matching — one procurement spine.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open requisitions"     value={pendingReqs.toString()} sub={`${reqs.submitted} awaiting CFO approval`} href="/erp/procurement/requisitions" Icon={ClipboardList} tone={reqs.submitted > 0 ? 'warning' : 'info'} />
        <Kpi label="Active tenders"        value={openTenders.toString()} sub={`${(countByStage().evaluation ?? 0)} under evaluation`} href="/erp/procurement/tenders"      Icon={FileSignature} tone="brand" />
        <Kpi label="Active contracts"      value={activeContracts.toString()} sub={`${expiring} expiring \u2264 60 days`} href="/erp/procurement/contracts"    Icon={Handshake}     tone={expiring > 0 ? 'warning' : 'success'} />
        <Kpi label="FY requisitioned"      value={formatCurrency(REQUISITIONS.reduce((s, r) => s + totalUsd(r), 0))} sub={`${REQUISITIONS.length} requisitions YTD`} href="/erp/procurement/requisitions" Icon={ShoppingCart} tone="info" />
      </div>

      {/* Top contracts + quick links */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ScrollReveal delay={60}>
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h2 className="text-h3 text-ink">Contract burn</h2>
                <p className="text-micro text-muted">Consumption against contract ceilings.</p>
              </div>
              <Link href="/erp/procurement/contracts" className="text-micro font-semibold text-brand-primary hover:underline">See all</Link>
            </div>
            <ul className="divide-y divide-line">
              {CONTRACTS.slice(0, 5).map((c) => {
                const pct = burnPct(c) * 100;
                return (
                  <li key={c.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate-line text-small font-semibold text-ink">{c.title}</div>
                        <div className="text-micro text-muted">{c.supplierName} · {c.ownerEmployee}</div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-small font-semibold text-ink">{formatCurrency(c.consumedUsd)}</div>
                        <div className="text-micro text-muted">of {formatCurrency(c.ceilingUsd)}</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
                      <span className={cn('block h-full rounded-full', pct >= 85 ? 'bg-warning' : 'bg-brand-primary')} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-muted">
                      <span>{Math.round(pct)}% used</span>
                      <span>{c.status}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="grid gap-3">
            <ModuleTile title="Requisitions"       body={`${REQUISITIONS.length} requisitions on file.`}                  href="/erp/procurement/requisitions" Icon={ClipboardList} />
            <ModuleTile title="Tenders & RFQs"      body={`${TENDERS.length} tenders, ${countByStage().evaluation ?? 0} in evaluation.`} href="/erp/procurement/tenders"      Icon={FileSignature} />
            <ModuleTile title="Contracts"          body={`${activeContracts} active · ${expiring} expiring soon.`}         href="/erp/procurement/contracts"    Icon={Handshake} />
            <ModuleTile title="Suppliers (Creditors)" body="Unified with Finance: PRAZ / VAT / 3-way match."                href="/erp/finance/creditors"       Icon={ShoppingCart} />
          </div>
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

function ModuleTile({ title, body, href, Icon }: { title: string; body: string; href: string; Icon: React.ElementType }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-lg border border-line bg-card p-4 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden><Icon className="h-5 w-5" /></span>
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
