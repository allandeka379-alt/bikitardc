// ─────────────────────────────────────────────
// Billing runs — list of every automated billing
// cycle across the council's revenue sources,
// grouped by period. Supports creation of a new
// run via a wizard and drilling into a specific
// run for approval / posting.
// ─────────────────────────────────────────────

'use client';

import { Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { ModuleTabs } from '@/components/erp/module-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  BILLING_RUNS,
  STATUS_LABEL,
  STATUS_TONE,
  type BillingRun,
  type BillingRunStatus,
} from '@/mocks/fixtures/billing-runs';
import { findRevenueSource } from '@/mocks/fixtures/revenue-sources';
import { cn } from '@/lib/cn';

const STATUS_ORDER: BillingRunStatus[] = ['draft', 'approved', 'posted', 'notified', 'failed'];

export default function BillingPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<BillingRunStatus | 'all'>('all');

  const rows = useMemo(() => {
    let r = [...BILLING_RUNS].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (status !== 'all') r = r.filter((x) => x.status === status);
    const ql = q.trim().toLowerCase();
    if (ql) {
      r = r.filter((x) => {
        const source = findRevenueSource(x.source);
        return (
          x.id.toLowerCase().includes(ql) ||
          x.period.toLowerCase().includes(ql) ||
          x.generatedBy.toLowerCase().includes(ql) ||
          (source?.label ?? '').toLowerCase().includes(ql)
        );
      });
    }
    return r;
  }, [q, status]);

  const draftCount = BILLING_RUNS.filter((r) => r.status === 'draft').length;
  const approvedCount = BILLING_RUNS.filter((r) => r.status === 'approved').length;
  const postedCount = BILLING_RUNS.filter((r) => r.status === 'posted' || r.status === 'notified').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Revenue &amp; Billing</h1>
            <p className="mt-1 text-small text-muted">
              Automated generation of statements across property rates, unit tax, market fees, CAMPFIRE and more.
            </p>
          </div>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link href="/erp/billing/new">New billing run</Link>
          </Button>
        </div>
      </ScrollReveal>

      <ModuleTabs
        items={[
          { href: '/erp/billing',             label: 'Billing runs' },
          { href: '/erp/billing/market-fees', label: 'Market stalls' },
          { href: '/erp/billing/beer-hall',   label: 'Beer halls' },
          { href: '/erp/billing/campfire',    label: 'CAMPFIRE' },
          { href: '/erp/payments',            label: 'Payments' },
          { href: '/erp/payments/reconcile',  label: 'Reconciliation', badge: 2 },
          { href: '/erp/arrangements',        label: 'Arrangements' },
          { href: '/erp/adjustments',         label: 'Adjustments' },
        ]}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatusPill label="Draft / awaiting review" count={draftCount} tone="warning" />
        <StatusPill label="Approved · awaiting post" count={approvedCount} tone="info" />
        <StatusPill label="Posted this cycle"         count={postedCount}   tone="success" />
      </div>

      {/* Quick links to related registers */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Link href="/erp/billing/market-fees"  className="group flex items-center justify-between rounded-lg border border-line bg-card p-4 hover:shadow-card-sm">
          <span className="text-small font-semibold text-ink group-hover:text-brand-primary">Market stall register</span>
          <Badge tone="brand">Market fees</Badge>
        </Link>
        <Link href="/erp/billing/beer-hall"    className="group flex items-center justify-between rounded-lg border border-line bg-card p-4 hover:shadow-card-sm">
          <span className="text-small font-semibold text-ink group-hover:text-brand-primary">Beer hall outlets</span>
          <Badge tone="brand">Beer hall</Badge>
        </Link>
        <Link href="/erp/billing/campfire"     className="group flex items-center justify-between rounded-lg border border-line bg-card p-4 hover:shadow-card-sm">
          <span className="text-small font-semibold text-ink group-hover:text-brand-primary">CAMPFIRE quotas &amp; off-takes</span>
          <Badge tone="brand">Natural resource</Badge>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search by source, period or user…"
              className="pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BillingRunStatus | 'all')}
            className="rounded-md border border-line bg-white px-3 py-2 text-small text-ink"
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Run</th>
                <th className="px-5 py-3 text-left">Period</th>
                <th className="px-5 py-3 text-right">Accounts</th>
                <th className="px-5 py-3 text-right">Total USD</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Generated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <RunRow key={r.id} run={r} />
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-small text-muted">No billing runs match the current filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RunRow({ run }: { run: BillingRun }) {
  const source = findRevenueSource(run.source);
  return (
    <tr className="border-b border-line last:border-b-0 hover:bg-surface/60">
      <td className="px-5 py-3">
        <Link href={`/erp/billing/${run.id}`} className="font-semibold text-ink hover:text-brand-primary">
          {source?.label ?? run.source}
        </Link>
        <div className="font-mono text-micro text-muted">{run.id}</div>
      </td>
      <td className="px-5 py-3 text-muted">{run.period}</td>
      <td className="px-5 py-3 text-right tabular-nums text-muted">{run.accountCount.toLocaleString()}</td>
      <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink">{formatCurrency(run.totalUsd)}</td>
      <td className="px-5 py-3">
        <div className="flex flex-col gap-1">
          <Badge tone={STATUS_TONE[run.status]} dot>{STATUS_LABEL[run.status]}</Badge>
          {run.errorCount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-danger">{run.errorCount} errors</span>
          )}
        </div>
      </td>
      <td className="px-5 py-3 text-muted">
        <div>{formatDate(run.createdAt)}</div>
        <div className="text-micro">{run.generatedBy}</div>
      </td>
    </tr>
  );
}

function StatusPill({ label, count, tone }: { label: string; count: number; tone: 'warning' | 'info' | 'success' }) {
  return (
    <Card className="p-4">
      <div className="text-micro font-semibold uppercase tracking-wide text-muted">{label}</div>
      <div className={cn(
        'mt-1 text-h2 font-bold tabular-nums',
        tone === 'warning' ? 'text-warning' : tone === 'info' ? 'text-info' : 'text-success',
      )}>
        {count}
      </div>
    </Card>
  );
}
