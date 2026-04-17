'use client';

// ─────────────────────────────────────────────
// Customer 360 — CRM counter desk view.
//
// Everything a clerk needs to serve a customer
// in person: outstanding balance with breakdown,
// per-bill detail, full payment history, active
// licences, penalty ledger with waive/mark-paid,
// service requests, arrangements, interaction
// notes and audit trail.
//
// Counter actions sit in a sticky action bar:
//   Record payment · Raise penalty · Apply for
//   licence · Log interaction.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  Bell,
  CalendarClock,
  CircleDollarSign,
  FileBadge2,
  LifeBuoy,
  Mail,
  MessageSquarePlus,
  Pencil,
  Phone,
  Printer,
  Receipt as ReceiptIcon,
  ShieldAlert,
  Stamp,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import {
  AddNoteDialog,
  ApplyLicenceDialog,
  RaisePenaltyDialog,
  RecordPaymentDialog,
  WaivePenaltyDialog,
} from '@/components/erp/crm/counter-dialogs';
import { RecentActivity } from '@/components/portal/recent-activity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErpStore } from '@/lib/stores/erp';
import {
  useApplicationsForOwner,
  useNotesForOwner,
  usePenaltyCountsForOwner,
} from '@/lib/stores/crm';
import {
  usePropertiesForOwner,
  useTransactionsForOwner,
} from '@/lib/stores/demo';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import { APPLICATION_TYPE_LABEL } from '@/mocks/fixtures/applications';
import { AUDIT_ACTION_LABEL } from '@/mocks/fixtures/audit-log';
import {
  PENALTY_REASON_LABEL,
  PENALTY_STATUS_LABEL,
  type Penalty,
} from '@/mocks/fixtures/penalties';
import { tierOf } from '@/mocks/fixtures/properties';
import { linesForProperty } from '@/mocks/fixtures/statements';
import { SERVICE_REQUESTS } from '@/mocks/fixtures/service-requests';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import { useArrangementsForOwner } from '@/lib/stores/arrangements';
import { useDpaForOwner } from '@/lib/stores/dpa';
import { useNotificationsForOwner } from '@/lib/stores/notifications';
import { cn } from '@/lib/cn';

export default function Customer360Page() {
  const { id } = useParams<{ id: string }>();
  const properties = usePropertiesForOwner(id);
  const fallbackOwner = DEMO_USERS.find((u) => u.id === id);
  const ownerName = properties[0]?.ownerName ?? fallbackOwner?.fullName ?? id;

  const auditAll = useErpStore((s) => s.audit);
  const audit = auditAll.filter((a) => a.subject.includes(id) || a.actorName === ownerName);

  const arrangements = useArrangementsForOwner(id);
  const dpa = useDpaForOwner(id);
  const notifications = useNotificationsForOwner(id);
  const transactions = useTransactionsForOwner(id);
  const applications = useApplicationsForOwner(id);
  const notes = useNotesForOwner(id);
  const penaltyCounts = usePenaltyCountsForOwner(id);

  const [payOpen, setPayOpen] = useState(false);
  const [penOpen, setPenOpen] = useState(false);
  const [waiveP, setWaiveP] = useState<Penalty | null>(null);
  const [appOpen, setAppOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  if (properties.length === 0 && !fallbackOwner) return notFound();

  const serviceRequests = SERVICE_REQUESTS.filter((r) => r.reporterName === ownerName);
  const totalOutstanding = properties.reduce((s, p) => s + p.balanceUsd, 0);
  const overdueCount = properties.filter((p) => tierOf(p) === 'overdue').length;
  const ytdPaid = transactions
    .filter((t) => t.status === 'succeeded')
    .reduce((s, t) => s + t.amount, 0);

  const activePenalties = penaltyCounts.active;
  const penaltyOutstanding = penaltyCounts.outstandingUsd;
  const grandOutstanding = totalOutstanding + penaltyOutstanding;

  const propertyMap: Record<string, string> = Object.fromEntries(
    properties.map((p) => [p.id, p.address]),
  );
  const propertyStand: Record<string, string> = Object.fromEntries(
    properties.map((p) => [p.id, p.stand]),
  );

  const openApplications = applications.filter(
    (a) => a.stage !== 'issued' && a.stage !== 'rejected' && a.stage !== 'approved',
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <Link
          href="/erp/crm"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
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
                <p className="mt-1 font-mono text-micro text-muted">{id}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="brand">Customer</Badge>
                  {overdueCount > 0 && (
                    <Badge tone="danger">
                      <TriangleAlert className="h-3 w-3" />
                      {overdueCount} overdue
                    </Badge>
                  )}
                  {activePenalties.length > 0 && (
                    <Badge tone="warning">
                      <ShieldAlert className="h-3 w-3" />
                      {activePenalties.length} penalty{activePenalties.length === 1 ? '' : 'ies'}
                    </Badge>
                  )}
                  {grandOutstanding === 0 && <Badge tone="success">Paid up</Badge>}
                  {arrangements.some((a) => a.status === 'approved') && <Badge tone="info">Arrangement approved</Badge>}
                </div>
                {fallbackOwner && (
                  <div className="mt-3 flex flex-wrap gap-4 text-micro text-muted">
                    <span className="inline-flex items-center gap-1.5"><Mail  className="h-3 w-3" />{fallbackOwner.email}</span>
                    {fallbackOwner.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{fallbackOwner.phone}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:flex-wrap sm:gap-6">
              <Stat label="Total outstanding" value={formatCurrency(grandOutstanding)} tone={grandOutstanding > 0 ? 'danger' : 'success'} />
              <Stat label="Bills"            value={formatCurrency(totalOutstanding)} />
              <Stat label="Penalties"        value={formatCurrency(penaltyOutstanding)} tone={penaltyOutstanding > 0 ? 'warning' : undefined} />
              <Stat label="YTD paid"         value={formatCurrency(ytdPaid)} tone="success" />
              <Stat label="Properties"       value={properties.length.toString()} />
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Counter action bar */}
      <div className="sticky top-[64px] z-40 mb-4 -mx-4 flex flex-wrap gap-2 border-y border-line bg-surface/80 px-4 py-3 backdrop-blur sm:top-0 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <Button
          onClick={() => setPayOpen(true)}
          leadingIcon={<CircleDollarSign className="h-4 w-4" />}
        >
          Record payment
        </Button>
        <Button
          variant="gold"
          onClick={() => setPenOpen(true)}
          leadingIcon={<ShieldAlert className="h-4 w-4" />}
        >
          Raise penalty
        </Button>
        <Button
          variant="secondary"
          onClick={() => setAppOpen(true)}
          leadingIcon={<FileBadge2 className="h-4 w-4" />}
        >
          Apply for licence
        </Button>
        <Button
          variant="secondary"
          onClick={() => setNoteOpen(true)}
          leadingIcon={<MessageSquarePlus className="h-4 w-4" />}
        >
          Log interaction
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.print()}
          leadingIcon={<Printer className="h-4 w-4" />}
          className="ml-auto"
        >
          Print statement
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bills">Bills <Badge tone="neutral" className="ml-1">{properties.length}</Badge></TabsTrigger>
          <TabsTrigger value="payments">Payments <Badge tone="neutral" className="ml-1">{transactions.length}</Badge></TabsTrigger>
          <TabsTrigger value="licences">Licences <Badge tone="neutral" className="ml-1">{applications.length}</Badge></TabsTrigger>
          <TabsTrigger value="penalties">
            Penalties {activePenalties.length > 0
              ? <Badge tone="warning" className="ml-1">{activePenalties.length}</Badge>
              : <Badge tone="neutral" className="ml-1">{penaltyCounts.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="requests">Requests <Badge tone="neutral" className="ml-1">{serviceRequests.length}</Badge></TabsTrigger>
          <TabsTrigger value="arrangements">Arrangements <Badge tone="neutral" className="ml-1">{arrangements.length}</Badge></TabsTrigger>
          <TabsTrigger value="notes">Notes <Badge tone="neutral" className="ml-1">{notes.length}</Badge></TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="dpa">
            DPA {dpa.length > 0 && <Badge tone="warning" className="ml-1">{dpa.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="text-h3 text-ink">Outstanding breakdown</h3>
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
                          className={cn(
                            'text-small font-semibold tabular-nums',
                            tier === 'clear'
                              ? 'text-success'
                              : tier === 'overdue'
                                ? 'text-danger'
                                : 'text-warning',
                          )}
                        >
                          {formatCurrency(p.balanceUsd)}
                        </div>
                        <div className="text-micro text-muted">next {formatDate(p.nextDueAt)}</div>
                      </div>
                    </li>
                  );
                })}
                {penaltyOutstanding > 0 && (
                  <li className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <div className="text-small font-semibold text-ink">Penalties & charges</div>
                      <div className="text-micro text-muted">{activePenalties.length} active</div>
                    </div>
                    <div className="text-right">
                      <div className="text-small font-semibold tabular-nums text-warning">
                        {formatCurrency(penaltyOutstanding)}
                      </div>
                    </div>
                  </li>
                )}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-small font-semibold text-ink">Total due now</span>
                <span className={cn('text-h3 font-bold tabular-nums', grandOutstanding > 0 ? 'text-danger' : 'text-success')}>
                  {formatCurrency(grandOutstanding)}
                </span>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-h3 text-ink">Open licences & permits</h3>
              {openApplications.length === 0 ? (
                <p className="mt-2 text-small text-muted">None in flight.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {openApplications.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="truncate-line text-small font-medium text-ink">{a.title}</div>
                        <div className="text-micro text-muted">{APPLICATION_TYPE_LABEL[a.type]} · {a.reference}</div>
                      </div>
                      <Badge tone="warning">{a.stage.replace('-', ' ')}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* BILLS — itemised statement per property */}
        <TabsContent value="bills">
          {properties.length === 0 ? (
            <EmptyState icon={<ReceiptIcon className="h-8 w-8" />} title="No properties linked." />
          ) : (
            <div className="flex flex-col gap-4">
              {properties.map((p) => {
                const lines = linesForProperty(p.id);
                const total = lines.reduce((s, l) => s + l.amount, 0);
                return (
                  <Card key={p.id} className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                      <div>
                        <div className="text-small font-semibold text-ink">{p.stand} — {p.address}</div>
                        <div className="text-micro text-muted">{p.ward} · {p.classKind}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-small text-muted">Current balance</div>
                        <div className={cn('text-body font-bold tabular-nums', p.balanceUsd > 0 ? 'text-danger' : 'text-success')}>
                          {formatCurrency(p.balanceUsd)}
                        </div>
                      </div>
                    </div>
                    {lines.length === 0 ? (
                      <div className="p-5 text-small text-muted">No statement lines on file.</div>
                    ) : (
                      <ul className="divide-y divide-line text-small">
                        {lines.map((l) => (
                          <li key={l.id} className="flex items-start justify-between gap-3 px-5 py-2.5">
                            <div className="min-w-0">
                              <div className="font-medium text-ink">{l.description}</div>
                              <div className="text-micro text-muted">{l.period} · {l.explainer}</div>
                            </div>
                            <div className={cn('shrink-0 font-semibold tabular-nums', l.amount < 0 ? 'text-success' : 'text-ink')}>
                              {formatCurrency(l.amount)}
                            </div>
                          </li>
                        ))}
                        <li className="flex items-center justify-between gap-3 bg-surface/60 px-5 py-3 text-small">
                          <span className="font-semibold text-ink">Statement total</span>
                          <span className="font-bold tabular-nums text-ink">{formatCurrency(total)}</span>
                        </li>
                      </ul>
                    )}
                    <div className="flex items-center justify-end gap-2 border-t border-line bg-surface/40 px-5 py-3">
                      <Button size="sm" variant="secondary" onClick={() => setPayOpen(true)} leadingIcon={<CircleDollarSign className="h-3.5 w-3.5" />}>
                        Record payment
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments">
          {transactions.length === 0 ? (
            <EmptyState icon={<CircleDollarSign className="h-8 w-8" />} title="No payments on record." />
          ) : (
            <RecentActivity transactions={transactions} propertyMap={propertyMap} title="All payments" />
          )}
        </TabsContent>

        {/* LICENCES */}
        <TabsContent value="licences">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-small text-muted">Applications & permits on file. Clerks can submit new applications on behalf of the customer.</p>
            <Button size="sm" onClick={() => setAppOpen(true)} leadingIcon={<FileBadge2 className="h-3.5 w-3.5" />}>
              Apply for licence
            </Button>
          </div>
          {applications.length === 0 ? (
            <EmptyState icon={<FileBadge2 className="h-8 w-8" />} title="No applications on file." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {applications.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-small font-semibold text-ink">{a.title}</div>
                      <div className="text-micro text-muted">
                        {APPLICATION_TYPE_LABEL[a.type]} · {a.reference} · submitted {formatRelative(a.submittedAt)}
                        {a.propertyId && propertyStand[a.propertyId] ? ` · ${propertyStand[a.propertyId]}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                      {a.feePaid && (
                        <Badge tone="neutral">
                          <Stamp className="h-3 w-3" /> fee paid
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* PENALTIES */}
        <TabsContent value="penalties">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-small text-muted">Fines, interest and surcharges. Active penalties add to the customer&apos;s total due.</p>
            <Button size="sm" variant="gold" onClick={() => setPenOpen(true)} leadingIcon={<ShieldAlert className="h-3.5 w-3.5" />}>
              Raise penalty
            </Button>
          </div>
          {penaltyCounts.all.length === 0 ? (
            <EmptyState icon={<ShieldAlert className="h-8 w-8" />} title="No penalties on file." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {penaltyCounts.all.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-micro text-muted">{p.reference}</span>
                        <Badge
                          tone={
                            p.status === 'active'   ? 'warning' :
                            p.status === 'paid'     ? 'success' :
                            p.status === 'waived'   ? 'info'    :
                                                      'danger'
                          }
                        >
                          {PENALTY_STATUS_LABEL[p.status]}
                        </Badge>
                        <span className="text-micro text-muted">{PENALTY_REASON_LABEL[p.reason]}</span>
                      </div>
                      <div className="mt-1 text-small font-semibold text-ink">
                        {formatCurrency(p.amountUsd)}
                        {p.propertyId && propertyStand[p.propertyId] ? ` · ${propertyStand[p.propertyId]}` : ''}
                      </div>
                      {p.note && <div className="mt-0.5 text-micro text-muted">{p.note}</div>}
                      <div className="mt-1 text-[10px] text-muted">
                        Raised {formatRelative(p.appliedAt)} by {p.appliedBy}
                        {p.waivedAt && (
                          <>
                            {' · '}Waived {formatRelative(p.waivedAt)} by {p.waivedBy}
                            {p.waiverReason && <span> — &ldquo;{p.waiverReason}&rdquo;</span>}
                          </>
                        )}
                      </div>
                    </div>
                    {p.status === 'active' && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setWaiveP(p)}>
                          Waive
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* REQUESTS */}
        <TabsContent value="requests">
          {serviceRequests.length === 0 ? (
            <EmptyState icon={<LifeBuoy className="h-8 w-8" />} title="No service requests reported." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {serviceRequests.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="text-small font-semibold text-ink">{r.title}</div>
                      <div className="text-micro text-muted">{r.reference} · {r.ward} · {formatRelative(r.createdAt)}</div>
                    </div>
                    <Badge tone={r.status === 'resolved' ? 'success' : 'warning'}>{r.status}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* ARRANGEMENTS */}
        <TabsContent value="arrangements">
          {arrangements.length === 0 ? (
            <EmptyState icon={<CalendarClock className="h-8 w-8" />} title="No payment arrangements on file." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {arrangements.map((a) => {
                  const installmentCount = a.installments.length;
                  const avgMonthly = installmentCount > 0 ? a.totalUsd / installmentCount : 0;
                  return (
                    <li key={a.id} className="flex items-start justify-between gap-4 px-5 py-3 text-small">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-micro text-muted">{a.reference}</span>
                          <Badge tone={a.status === 'approved' ? 'success' : a.status === 'pending' ? 'warning' : a.status === 'completed' ? 'info' : 'danger'}>{a.status}</Badge>
                        </div>
                        <div className="mt-1 font-semibold text-ink">
                          {formatCurrency(a.totalUsd)} over {installmentCount} installment{installmentCount === 1 ? '' : 's'}
                        </div>
                        <div className="mt-0.5 text-micro text-muted">Requested {formatDate(a.requestedAt)} · {a.propertyLabel}</div>
                      </div>
                      <div className="text-right tabular-nums">
                        <div className="text-small font-semibold text-ink">{formatCurrency(avgMonthly)}</div>
                        <div className="text-micro text-muted">per installment</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* NOTES */}
        <TabsContent value="notes">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-small text-muted">Interaction log — calls, counter visits, emails and letters.</p>
            <Button size="sm" onClick={() => setNoteOpen(true)} leadingIcon={<Pencil className="h-3.5 w-3.5" />}>
              Log interaction
            </Button>
          </div>
          {notes.length === 0 ? (
            <EmptyState icon={<Pencil className="h-8 w-8" />} title="No interactions recorded yet." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {notes.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-5 py-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-[10px] font-semibold uppercase text-brand-primary" aria-hidden>
                      {n.kind[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-small font-semibold text-ink">{n.authorName}</span>
                        <Badge tone="neutral">{n.kind}</Badge>
                        <time className="text-micro text-muted">{formatRelative(n.createdAt)}</time>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-small text-ink/90">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications sent yet." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {notifications.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-5 py-3 text-small">
                    <span className={
                      n.tone === 'success' ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-success' :
                      n.tone === 'warning' ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-warning' :
                      n.tone === 'danger'  ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-danger'  :
                                             'mt-1 h-2 w-2 shrink-0 rounded-full bg-info'
                    } aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{n.title}</span>
                        {!n.readAt && <Badge tone="danger">Unread</Badge>}
                      </div>
                      <p className="mt-0.5 text-micro text-muted">{n.body}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
                        <time>{formatRelative(n.createdAt)}</time>
                        {n.channels.length > 0 && (
                          <>
                            <span aria-hidden>·</span>
                            <span className="uppercase tracking-wide">{n.channels.join(' · ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* DPA */}
        <TabsContent value="dpa">
          {dpa.length === 0 ? (
            <EmptyState icon={<ShieldAlert className="h-8 w-8" />} title="No data-rights requests on file." />
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-line">
                {dpa.map((d) => (
                  <li key={d.id} className="flex items-start justify-between gap-4 px-5 py-3 text-small">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-micro text-muted">{d.reference}</span>
                        <Badge tone={d.status === 'fulfilled' ? 'success' : d.status === 'rejected' ? 'danger' : d.status === 'in-progress' ? 'info' : 'warning'}>{d.status}</Badge>
                        <Badge tone="neutral">{d.kind}</Badge>
                      </div>
                      <div className="mt-1 text-ink">{d.reason || 'No reason provided.'}</div>
                      <div className="mt-0.5 text-micro text-muted">Submitted {formatDate(d.submittedAt)} · due by {formatDate(d.dueBy)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit">
          {audit.length === 0 ? (
            <EmptyState icon={<ReceiptIcon className="h-8 w-8" />} title="No audit entries yet for this customer." />
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

      {/* Counter dialogs */}
      <RecordPaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        ownerId={id}
        ownerName={ownerName}
        properties={properties}
      />
      <RaisePenaltyDialog
        open={penOpen}
        onOpenChange={setPenOpen}
        ownerId={id}
        ownerName={ownerName}
        properties={properties}
      />
      <WaivePenaltyDialog
        open={!!waiveP}
        onOpenChange={(o) => !o && setWaiveP(null)}
        penalty={waiveP}
      />
      <ApplyLicenceDialog
        open={appOpen}
        onOpenChange={setAppOpen}
        ownerId={id}
        ownerName={ownerName}
        properties={properties}
      />
      <AddNoteDialog
        open={noteOpen}
        onOpenChange={setNoteOpen}
        ownerId={id}
        ownerName={ownerName}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'danger' | 'success' | 'warning' }) {
  const toneClass =
    tone === 'danger'  ? 'text-danger' :
    tone === 'success' ? 'text-success' :
    tone === 'warning' ? 'text-warning' :
                         'text-ink';
  return (
    <div>
      <div className="text-micro text-muted">{label}</div>
      <div className={cn('text-h3 font-bold tabular-nums', toneClass)}>{value}</div>
    </div>
  );
}
