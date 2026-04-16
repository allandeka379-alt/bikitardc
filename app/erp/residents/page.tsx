'use client';

// ─────────────────────────────────────────────
// Residents directory (spec §6.2 screen #13).
//
// Two modes driven by the `?filter=` query:
//   • default: full directory (search + filters)
//   • pending-verifications: Journey C landing
//     view showing the pending-link queue
// ─────────────────────────────────────────────

import { ArrowRight, Search, ShieldAlert, Users } from 'lucide-react';
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
import { useErpStore } from '@/lib/stores/erp';
import { PROPERTIES } from '@/mocks/fixtures/properties';
import { TRANSACTIONS } from '@/mocks/fixtures/transactions';
import {
  VERIFICATIONS,
  VERIFICATION_KIND_LABEL,
  type Verification,
} from '@/mocks/fixtures/verifications';
import { cn } from '@/lib/cn';

export default function ResidentsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const filter = sp.get('filter');
  const initialTab = filter === 'pending-verifications' ? 'verifications' : 'directory';
  const [query, setQuery] = useState('');
  const [drawerV, setDrawerV] = useState<Verification | null>(null);

  const verificationStatus = useErpStore((s) => s.verificationStatus);

  // Roll up residents from the properties fixture.
  const residents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; properties: typeof PROPERTIES; balance: number; lastActivity?: string }>();
    for (const p of PROPERTIES) {
      const existing = map.get(p.ownerId);
      if (existing) {
        existing.properties.push(p);
        existing.balance += p.balanceUsd;
      } else {
        map.set(p.ownerId, {
          id: p.ownerId,
          name: p.ownerName,
          properties: [p],
          balance: p.balanceUsd,
        });
      }
    }
    // Decorate with last activity from transactions.
    for (const r of map.values()) {
      const tx = TRANSACTIONS.filter((t) => t.ownerId === r.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
      r.lastActivity = tx?.createdAt;
    }
    return Array.from(map.values()).sort((a, b) => b.balance - a.balance);
  }, []);

  const filtered = useMemo(
    () =>
      residents.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.properties.some((p) => p.stand.toLowerCase().includes(query.toLowerCase())),
      ),
    [residents, query],
  );

  const runtimeVerif = useErpStore((s) => s.runtimeVerifications);
  const pending = [...runtimeVerif, ...VERIFICATIONS].filter(
    (v) => (verificationStatus[v.id] ?? v.status) === 'pending',
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Residents</h1>
            <p className="mt-1 text-small text-muted">
              Manage resident records, linked properties, and manual verifications.
            </p>
          </div>
          {pending.length > 0 && initialTab !== 'verifications' && (
            <Button
              variant="gold"
              size="sm"
              onClick={() => router.push('/erp/residents?filter=pending-verifications')}
              leadingIcon={<ShieldAlert className="h-4 w-4" />}
            >
              {pending.length} pending verifications
            </Button>
          )}
        </div>
      </ScrollReveal>

      <Tabs
        defaultValue={initialTab}
        onValueChange={(v) => {
          if (v === 'verifications') router.push('/erp/residents?filter=pending-verifications');
          else router.push('/erp/residents');
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
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Search by name or stand number…"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <span className="ml-auto text-micro text-muted">
                {filtered.length} of {residents.length} residents
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-small">
                <thead>
                  <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 text-left">Resident</th>
                    <th className="px-5 py-3 text-left">Properties</th>
                    <th className="px-5 py-3 text-right">Outstanding</th>
                    <th className="px-5 py-3 text-left">Last activity</th>
                    <th className="px-5 py-3" aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="group cursor-pointer border-b border-line last:border-b-0 hover:bg-surface/60"
                      onClick={() => router.push(`/erp/residents/${r.id}`)}
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
                            <div className="text-micro text-muted">{r.id}</div>
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
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="verifications">
          {pending.length === 0 ? (
            <EmptyState
              icon={<ShieldAlert className="h-8 w-8" />}
              title="No pending verifications."
              description="Manual property-link requests land here for review. The queue is cleared — nice work."
              action={
                <Button asChild variant="secondary">
                  <Link href="/erp/residents">Back to directory</Link>
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
                      <Button variant="gold" size="sm" trailingIcon={<ArrowRight className="h-3.5 w-3.5" />}>
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
