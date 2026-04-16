'use client';

// ─────────────────────────────────────────────
// Resident 360 view — spec §3.2 CRM unified profile.
// Tabs: Overview / Properties / Payments / Applications / Audit.
// ─────────────────────────────────────────────

import { ArrowLeft, FileBadge2, LifeBuoy, Receipt as ReceiptIcon, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { RecentActivity } from '@/components/portal/recent-activity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErpStore } from '@/lib/stores/erp';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import {
  APPLICATION_TYPE_LABEL,
  applicationsForOwner,
} from '@/mocks/fixtures/applications';
import { AUDIT_ACTION_LABEL } from '@/mocks/fixtures/audit-log';
import { propertiesForOwner, tierOf } from '@/mocks/fixtures/properties';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { transactionsForOwner } from '@/mocks/fixtures/transactions';
import { DEMO_USERS } from '@/mocks/fixtures/users';

export default function Resident360Page() {
  const { id } = useParams<{ id: string }>();
  const properties = propertiesForOwner(id);
  const ownerName =
    properties[0]?.ownerName ??
    DEMO_USERS.find((u) => u.id === id)?.fullName ??
    id;
  // Filter OUTSIDE the Zustand selector so we don't return a fresh array
  // from the selector on every render (which would trigger an infinite loop).
  const auditAll = useErpStore((s) => s.audit);
  const audit = auditAll.filter((a) => a.subject.includes(id) || a.actorName === ownerName);

  if (properties.length === 0 && !DEMO_USERS.find((u) => u.id === id)) {
    return notFound();
  }

  const transactions = transactionsForOwner(id);
  const applications = applicationsForOwner(id);
  const serviceRequests = SERVICE_REQUESTS.filter((r) => r.reporterName === ownerName);

  const totalOutstanding = properties.reduce((s, p) => s + p.balanceUsd, 0);
  const overdue = properties.filter((p) => tierOf(p) === 'overdue').length;
  const propertyMap: Record<string, string> = Object.fromEntries(
    properties.map((p) => [p.id, p.address]),
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <Link
          href="/erp/residents"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to residents
        </Link>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal>
        <Card className="mb-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-primary/10 text-h3 font-semibold text-brand-primary" aria-hidden>
                {ownerName.split(/\s+/).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')}
              </span>
              <div>
                <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">{ownerName}</h1>
                <p className="mt-1 text-small text-muted">{id}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="brand">Resident</Badge>
                  {overdue > 0 && (
                    <Badge tone="danger">
                      <TriangleAlert className="h-3 w-3" />
                      {overdue} overdue
                    </Badge>
                  )}
                  {totalOutstanding === 0 && <Badge tone="success">Paid up</Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Stat label="Outstanding" value={formatCurrency(totalOutstanding)} tone={totalOutstanding > 0 ? 'danger' : 'success'} />
              <Stat label="Properties" value={`${properties.length}`} />
              <Stat label="Applications" value={`${applications.length}`} />
              <Stat label="Requests" value={`${serviceRequests.length}`} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">
            Properties <Badge tone="neutral" className="ml-1">{properties.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payments <Badge tone="neutral" className="ml-1">{transactions.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="applications">
            Applications <Badge tone="neutral" className="ml-1">{applications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests <Badge tone="neutral" className="ml-1">{serviceRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <Card className="p-5">
              <h3 className="text-h3 text-ink">Properties summary</h3>
              <ul className="mt-3 divide-y divide-line">
                {properties.map((p) => {
                  const tier = tierOf(p);
                  return (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <div className="text-small font-semibold text-ink">{p.stand}</div>
                        <div className="text-micro text-muted">{p.address}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className={
                            tier === 'clear'
                              ? 'text-small font-semibold tabular-nums text-success'
                              : tier === 'overdue'
                                ? 'text-small font-semibold tabular-nums text-danger'
                                : 'text-small font-semibold tabular-nums text-warning'
                          }
                        >
                          {formatCurrency(p.balanceUsd)}
                        </div>
                        <div className="text-micro text-muted">next {formatDate(p.nextDueAt)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="text-h3 text-ink">Active applications</h3>
              {applications.length === 0 ? (
                <p className="mt-2 text-small text-muted">None.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {applications.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="truncate-line text-small font-medium text-ink">{a.title}</div>
                        <div className="text-micro text-muted">
                          {APPLICATION_TYPE_LABEL[a.type]} · {a.reference}
                        </div>
                      </div>
                      <Badge
                        tone={
                          a.stage === 'approved' || a.stage === 'issued'
                            ? 'success'
                            : a.stage === 'rejected'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {a.stage.replace('-', ' ')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
              {properties.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/portal/property/${p.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface/60"
                  >
                    <div className="min-w-0">
                      <div className="text-small font-semibold text-ink">{p.stand}</div>
                      <div className="truncate-line text-micro text-muted">
                        {p.address} · {p.ward} · {p.classKind}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-small font-semibold tabular-nums text-ink">
                        {formatCurrency(p.balanceUsd)}
                      </div>
                      <div className="text-micro text-muted">next {formatDate(p.nextDueAt)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <RecentActivity transactions={transactions} propertyMap={propertyMap} title="All payments" />
        </TabsContent>

        <TabsContent value="applications">
          {applications.length === 0 ? (
            <EmptyState
              icon={<FileBadge2 className="h-8 w-8" />}
              title="No applications on file."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {applications.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-small font-semibold text-ink">{a.title}</div>
                      <div className="text-micro text-muted">
                        {APPLICATION_TYPE_LABEL[a.type]} · {a.reference}
                      </div>
                    </div>
                    <Badge
                      tone={
                        a.stage === 'approved' || a.stage === 'issued'
                          ? 'success'
                          : a.stage === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {a.stage.replace('-', ' ')}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {serviceRequests.length === 0 ? (
            <EmptyState
              icon={<LifeBuoy className="h-8 w-8" />}
              title="No service requests reported."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {serviceRequests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-small font-semibold text-ink">{r.title}</div>
                      <div className="text-micro text-muted">
                        {r.reference} · {r.ward} · {formatRelative(r.createdAt)}
                      </div>
                    </div>
                    <Badge tone={r.status === 'resolved' ? 'success' : 'warning'}>{r.status}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit">
          {audit.length === 0 ? (
            <EmptyState
              icon={<ReceiptIcon className="h-8 w-8" />}
              title="No audit entries yet for this resident."
            />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {audit.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-small font-medium text-ink">{AUDIT_ACTION_LABEL[a.action]}</div>
                      <div className="text-micro text-muted">{a.subject}</div>
                    </div>
                    <time className="text-micro text-muted">{formatRelative(a.at)}</time>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'danger' | 'success';
}) {
  return (
    <div>
      <div className="text-micro text-muted">{label}</div>
      <div
        className={
          tone === 'danger'
            ? 'text-h3 font-bold tabular-nums text-danger'
            : tone === 'success'
              ? 'text-h3 font-bold tabular-nums text-success'
              : 'text-h3 font-bold tabular-nums text-ink'
        }
      >
        {value}
      </div>
    </div>
  );
}
