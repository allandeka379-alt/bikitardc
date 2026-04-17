'use client';

// ─────────────────────────────────────────────
// Customer CRM — directory + filters + quick
// actions. Replaces the read-only residents list
// with a counter-desk-style view.
// ─────────────────────────────────────────────

import {
  AlertTriangle,
  ArrowRight,
  CircleDollarSign,
  FileBadge2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
  UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { VerificationDrawer } from '@/components/erp/verification-drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatRelative } from '@/lib/format';
import { useCrmStore } from '@/lib/stores/crm';
import { useErpStore } from '@/lib/stores/erp';
import { applicationsForOwner } from '@/mocks/fixtures/applications';
import {
  outstandingPenaltyTotal,
  PENALTIES,
  penaltiesForOwner,
} from '@/mocks/fixtures/penalties';
import { PROPERTIES, tierOf } from '@/mocks/fixtures/properties';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import {
  VERIFICATIONS,
  VERIFICATION_KIND_LABEL,
  type Verification,
} from '@/mocks/fixtures/verifications';
import { cn } from '@/lib/cn';

type CustomerRow = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  properties: typeof PROPERTIES;
  balance: number;
  overdueCount: number;
  penaltyTotal: number;
  penaltyCount: number;
  openAppsCount: number;
  lastActivity?: string;
};

export default function CrmDirectoryPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const filter = sp.get('filter');
  const initialTab = filter === 'pending-verifications' ? 'verifications' : 'directory';
  const [query, setQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'all' | 'overdue' | 'has-balance' | 'has-penalty' | 'open-apps'>('all');
  const [drawerV, setDrawerV] = useState<Verification | null>(null);

  const verificationStatus = useErpStore((s) => s.verificationStatus);
  const runtimePenalties = useCrmStore((s) => s.runtimePenalties);
  const runtimeApplications = useCrmStore((s) => s.runtimeApplications);

  // Build a merged list of penalties and apps so the filters reflect runtime state.
  const allPenalties = useMemo(
    () => [...runtimePenalties, ...PENALTIES],
    [runtimePenalties],
  );

  const customers: CustomerRow[] = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    for (const p of PROPERTIES) {
      const existing = map.get(p.ownerId);
      if (existing) {
        existing.properties.push(p);
        existing.balance += p.balanceUsd;
        if (tierOf(p) === 'overdue') existing.overdueCount += 1;
      } else {
        map.set(p.ownerId, {
          id: p.ownerId,
          name: p.ownerName,
          properties: [p],
          balance: p.balanceUsd,
          overdueCount: tierOf(p) === 'overdue' ? 1 : 0,
          penaltyTotal: 0,
          penaltyCount: 0,
          openAppsCount: 0,
        });
      }
    }

    // Decorate with last activity, penalties, apps, contact info
    for (const r of map.values()) {
      const tx = TRANSACTIONS.filter((t) => t.ownerId === r.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
      r.lastActivity = tx?.createdAt;

      const pensActive = penaltiesForOwner(r.id, allPenalties).filter((p) => p.status === 'active');
      r.penaltyCount = pensActive.length;
      r.penaltyTotal = outstandingPenaltyTotal(r.id, allPenalties);

      const apps = [
        ...runtimeApplications.filter((a) => a.ownerId === r.id),
        ...applicationsForOwner(r.id),
      ];
      r.openAppsCount = apps.filter(
        (a) => a.stage !== 'issued' && a.stage !== 'rejected' && a.stage !== 'approved',
      ).length;

      const demo = DEMO_USERS.find((u) => u.id === r.id);
      r.phone = demo?.phone;
      r.email = demo?.email;
    }

    return Array.from(map.values()).sort((a, b) => b.balance - a.balance);
  }, [allPenalties, runtimeApplications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      // Text query
      const hay = [
        c.name,
        c.id,
        c.phone ?? '',
        c.email ?? '',
        ...c.properties.map((p) => p.stand),
        ...c.properties.map((p) => p.address),
      ]
        .join(' ')
        .toLowerCase();
      if (q && !hay.includes(q)) return false;

      if (activeChip === 'overdue'     && c.overdueCount === 0) return false;
      if (activeChip === 'has-balance' && c.balance <= 0) return false;
      if (activeChip === 'has-penalty' && c.penaltyCount === 0) return false;
      if (activeChip === 'open-apps'   && c.openAppsCount === 0) return false;

      return true;
    });
  }, [customers, query, activeChip]);

  const runtimeVerif = useErpStore((s) => s.runtimeVerifications);
  const pending = [...runtimeVerif, ...VERIFICATIONS].filter(
    (v) => (verificationStatus[v.id] ?? v.status) === 'pending',
  );

  // Top-strip KPIs
  const totalBalance = customers.reduce((s, c) => s + c.balance, 0);
  const totalOverdue = customers.filter((c) => c.overdueCount > 0).length;
  const totalPenalties = customers.reduce((s, c) => s + c.penaltyTotal, 0);
  const totalOpenApps = customers.reduce((s, c) => s + c.openAppsCount, 0);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-2.5 py-0.5 text-micro font-semibold uppercase tracking-wide text-brand-primary">
              <Users className="h-3 w-3" /> Customer CRM
            </div>
            <h1 className="text-h1 text-ink">Customers</h1>
            <p className="mt-1 text-small text-muted">
              Counter desk — search a customer to view bills, record payments, apply for licences, raise or waive penalties.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pending.length > 0 && initialTab !== 'verifications' && (
              <Button
                variant="gold"
                size="sm"
                onClick={() => router.push('/erp/crm?filter=pending-verifications')}
                leadingIcon={<ShieldAlert className="h-4 w-4" />}
              >
                {pending.length} pending verifications
              </Button>
            )}
            <Button variant="secondary" size="sm" leadingIcon={<UserPlus className="h-4 w-4" />} disabled>
              New customer
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI strip */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi Icon={Users}             label="Customers"             value={customers.length.toString()} />
        <Kpi Icon={CircleDollarSign}  label="Outstanding"           value={formatCurrency(totalBalance)} tone="danger" sub={`${totalOverdue} with overdue balances`} />
        <Kpi Icon={ShieldAlert}        label="Penalties outstanding" value={formatCurrency(totalPenalties)} tone="warning" />
        <Kpi Icon={FileBadge2}         label="Applications open"     value={totalOpenApps.toString()} tone="info" />
      </div>

      <Tabs
        defaultValue={initialTab}
        onValueChange={(v) => {
          if (v === 'verifications') router.push('/erp/crm?filter=pending-verifications');
          else router.push('/erp/crm');
        }}
      >
        <TabsList>
          <TabsTrigger value="directory">
            <Users className="h-3.5 w-3.5" />
            Directory
          </TabsTrigger>
          <TabsTrigger value="verifications">
            <ShieldAlert className="h-3.5 w-3.5" />
            Verifications
            {pending.length > 0 && (
              <Badge tone="warning" className="ml-1">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <Card className="overflow-hidden">
            {/* Search + filter chips */}
            <div className="flex flex-col gap-3 border-b border-line px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    placeholder="Search by name, stand, phone, email, owner ID…"
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <span className="ml-auto text-micro text-muted">
                  {filtered.length} of {customers.length}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'overdue', 'has-balance', 'has-penalty', 'open-apps'] as const).map((chip) => {
                  const count =
                    chip === 'all' ? customers.length :
                    chip === 'overdue' ? customers.filter((c) => c.overdueCount > 0).length :
                    chip === 'has-balance' ? customers.filter((c) => c.balance > 0).length :
                    chip === 'has-penalty' ? customers.filter((c) => c.penaltyCount > 0).length :
                    customers.filter((c) => c.openAppsCount > 0).length;
                  const label =
                    chip === 'all' ? 'All' :
                    chip === 'overdue' ? 'Overdue' :
                    chip === 'has-balance' ? 'Has balance' :
                    chip === 'has-penalty' ? 'Has penalty' :
                    'Open applications';
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setActiveChip(chip)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-micro font-semibold transition-colors',
                        activeChip === chip
                          ? 'border-brand-primary bg-brand-primary text-white'
                          : 'border-line bg-card text-muted hover:text-ink',
                      )}
                    >
                      {label}
                      <span
                        className={cn(
                          'rounded-full px-1.5 text-[10px]',
                          activeChip === chip ? 'bg-white/20 text-white' : 'bg-line/70 text-muted',
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-left">Properties</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3 text-right">Penalties</th>
                    <th className="px-5 py-3 text-right">Open apps</th>
                    <th className="px-5 py-3 text-left">Last activity</th>
                    <th className="px-5 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="group cursor-pointer border-b border-line last:border-b-0 hover:bg-surface/60"
                      onClick={() => router.push(`/erp/crm/${r.id}`)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid h-8 w-8 place-items-center rounded-full bg-brand-primary/10 text-micro font-semibold text-brand-primary"
                            aria-hidden
                          >
                            {r.name
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((n) => n[0]?.toUpperCase())
                              .join('')}
                          </span>
                          <div>
                            <div className="text-small font-medium text-ink">{r.name}</div>
                            <div className="text-micro text-muted">
                              {r.phone ?? r.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.properties.map((p) => (
                            <Badge key={p.id} tone="neutral">
                              {p.stand}
                            </Badge>
                          ))}
                          {r.overdueCount > 0 && (
                            <Badge tone="danger">
                              <AlertTriangle className="h-3 w-3" /> {r.overdueCount} overdue
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={cn(
                            'text-small font-semibold tabular-nums',
                            r.balance > 0 ? 'text-danger' : 'text-success',
                          )}
                        >
                          {formatCurrency(r.balance)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {r.penaltyCount > 0 ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="text-small font-semibold tabular-nums text-warning">
                              {formatCurrency(r.penaltyTotal)}
                            </span>
                            <span className="text-[10px] text-muted">
                              {r.penaltyCount} active
                            </span>
                          </div>
                        ) : (
                          <span className="text-micro text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {r.openAppsCount > 0 ? (
                          <Badge tone="info">{r.openAppsCount}</Badge>
                        ) : (
                          <span className="text-micro text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {r.lastActivity ? formatRelative(r.lastActivity) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <ArrowRight className="h-4 w-4 text-muted transition-transform duration-base ease-out-expo group-hover:translate-x-0.5 group-hover:text-brand-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="grid place-items-center p-12 text-small text-muted">
                  No customers match this search.
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="verifications">
          {pending.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="h-8 w-8" />}
              title="No pending verifications."
              description="Manual property-link requests land here for review. The queue is cleared — nice work."
              action={
                <Button asChild variant="secondary">
                  <Link href="/erp/crm">Back to directory</Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3">
              {pending.map((v) => (
                <li key={v.id}>
                  <Card
                    className="group cursor-pointer p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-md"
                    onClick={() => setDrawerV(v)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge tone="warning">Pending</Badge>
                          <span className="text-micro text-muted">
                            {VERIFICATION_KIND_LABEL[v.kind]}
                          </span>
                          <span className="text-micro text-muted">· {v.reference}</span>
                        </div>
                        <h3 className="text-body font-semibold text-ink">{v.applicantName}</h3>
                        <p className="mt-1 text-small text-muted">{v.relationship}</p>
                        <p className="mt-1.5 text-micro text-muted">
                          Submitted {formatRelative(v.submittedAt)} · {v.supportingDocs.length} documents
                        </p>
                      </div>
                      <Button
                        variant="gold"
                        size="sm"
                        trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}
                      >
                        Review
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <VerificationDrawer verification={drawerV} onClose={() => setDrawerV(null)} />
    </div>
  );
}

function Kpi({
  Icon,
  label,
  value,
  sub,
  tone,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: 'danger' | 'warning' | 'info';
}) {
  const toneClass =
    tone === 'danger'  ? 'bg-danger/10 text-danger' :
    tone === 'warning' ? 'bg-warning/10 text-warning' :
    tone === 'info'    ? 'bg-info/10 text-info' :
                         'bg-brand-primary/10 text-brand-primary';
  const valClass =
    tone === 'danger'  ? 'text-danger' :
    tone === 'warning' ? 'text-warning' :
                         'text-ink';
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-9 w-9 place-items-center rounded-md', toneClass)} aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
          <div className={cn('text-h3 font-bold tabular-nums', valClass)}>{value}</div>
          {sub && <div className="text-[10px] text-muted">{sub}</div>}
        </div>
      </div>
    </Card>
  );
}
