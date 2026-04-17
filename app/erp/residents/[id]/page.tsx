'use client';

// ─────────────────────────────────────────────
// Resident 360 view — spec §3.2 CRM unified profile.
// Tabs: Overview / Properties / Payments / Applications / Audit.
// ─────────────────────────────────────────────

import { ArrowLeft, Bell, CalendarClock, FileBadge2, LifeBuoy, Mail, Phone, Receipt as ReceiptIcon, ShieldAlert, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { RecentActivity } from '@/components/portal/recent-activity';
import { Badge } from '@/components/ui/badge';
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
import { useArrangementsForOwner } from '@/lib/stores/arrangements';
import { useDpaForOwner } from '@/lib/stores/dpa';
import { useNotificationsForOwner } from '@/lib/stores/notifications';

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
  // Cross-module feeds — all hooks MUST be called unconditionally before any
  // early return, to satisfy the Rules of Hooks.
  const arrangements = useArrangementsForOwner(id);
  const dpa = useDpaForOwner(id);
  const notifications = useNotificationsForOwner(id);

  if (properties.length === 0 && !DEMO_USERS.find((u) => u.id === id)) {
    return notFound();
  }

  const transactions = transactionsForOwner(id);
  const applications = applicationsForOwner(id);
  const serviceRequests = SERVICE_REQUESTS.filter((r) => r.reporterName === ownerName);

  const demoUser = DEMO_USERS.find((u) => u.id === id);
  const totalOutstanding = properties.reduce((s, p) => s + p.balanceUsd, 0);
  const overdue = properties.filter((p) => tierOf(p) === 'overdue').length;
  const ytdPaid = transactions
    .filter((t) => t.status === 'succeeded')
    .reduce((s, t) => s + t.amount, 0);
  const unreadNotifications = notifications.filter((n) => !n.readAt).length;
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
                <p className="mt-1 font-mono text-micro text-muted">{id}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="brand">Resident</Badge>
                  {overdue > 0 && (
                    <Badge tone="danger">
                      <TriangleAlert className="h-3 w-3" />
                      {overdue} overdue
                    </Badge>
                  )}
                  {totalOutstanding === 0 && <Badge tone="success">Paid up</Badge>}
                  {arrangements.some((a) => a.status === 'approved') && <Badge tone="info">Arrangement approved</Badge>}
                  {dpa.length > 0 && <Badge tone="warning"><ShieldAlert className="h-3 w-3" />DPA request</Badge>}
                </div>
                {demoUser && (
                  <div className="mt-3 flex flex-wrap gap-4 text-micro text-muted">
                    <span className="inline-flex items-center gap-1.5"><Mail  className="h-3 w-3" />{demoUser.email}</span>
                    {demoUser.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3 w-3" />{demoUser.phone}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-row sm:flex-wrap sm:gap-6">
              <Stat label="Outstanding"  value={formatCurrency(totalOutstanding)} tone={totalOutstanding > 0 ? 'danger' : 'success'} />
              <Stat label="YTD paid"     value={formatCurrency(ytdPaid)}          tone="success" />
              <Stat label="Properties"   value={`${properties.length}`} />
              <Stat label="Applications" value={`${applications.length}`} />
              <Stat label="Requests"     value={`${serviceRequests.length}`} />
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
          <TabsTrigger value="arrangements">
            Arrangements <Badge tone="neutral" className="ml-1">{arrangements.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications {unreadNotifications > 0 && <Badge tone="danger" className="ml-1">{unreadNotifications}</Badge>}
            {unreadNotifications === 0 && <Badge tone="neutral" className="ml-1">{notifications.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="dpa">
            DPA {dpa.length > 0 && <Badge tone="warning" className="ml-1">{dpa.length}</Badge>}
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

        <TabsContent value="arrangements">
          {arrangements.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-8 w-8" />}
              title="No payment arrangements on file."
            />
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
                        <div className="mt-0.5 text-micro text-muted">
                          Requested {formatDate(a.requestedAt)} · {a.propertyLabel}
                        </div>
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
                      <div className="mt-0.5 text-micro text-muted">
                        Submitted {formatDate(d.submittedAt)} · due by {formatDate(d.dueBy)}
                      </div>
                    </div>
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
