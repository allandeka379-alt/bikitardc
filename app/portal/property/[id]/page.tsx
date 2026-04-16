'use client';

// ─────────────────────────────────────────────
// Property detail — spec §6.2 screen #5.
// Tabs: Statement / Payments / Documents / Applications.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  FileBadge2,
  FolderLock,
  Leaf,
  MapPin,
  Receipt as ReceiptIcon,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { AlertStrip } from '@/components/portal/alert-strip';
import { BalancePill } from '@/components/portal/balance-pill';
import { ProgressRing } from '@/components/portal/progress-ring';
import { RecentActivity } from '@/components/portal/recent-activity';
import { AgeingBuckets } from '@/components/portal/ageing-buckets';
import { OwnershipTab } from '@/components/portal/ownership-tab';
import { StatementTable } from '@/components/portal/statement-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useAutoPayForProperty } from '@/lib/stores/autopay';
import { usePropertyWithOverrides, useTransactionsForProperty } from '@/lib/stores/demo';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  APPLICATION_TYPE_LABEL,
  applicationsForProperty,
} from '@/mocks/fixtures/applications';
import type { PropertyClass } from '@/mocks/fixtures/properties';
import { tierOf } from '@/mocks/fixtures/properties';

const CLASS_ICON: Record<PropertyClass, LucideIcon> = {
  residential: Building2,
  commercial: ReceiptIcon,
  agricultural: Leaf,
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const { hydrated, userId } = useCurrentUser();
  const property = usePropertyWithOverrides(params.id);
  const transactions = useTransactionsForProperty(params.id ?? '');
  const autoPay = useAutoPayForProperty(params.id ?? null);

  if (!hydrated) return null;
  if (!property) return notFound();

  // Light ownership gate: don't allow poking at other peoples' stuff.
  if (userId && property.ownerId !== userId) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-10">
        <EmptyState
          title="That property isn't linked to your account."
          description="Contact the council if you believe this is incorrect."
          action={
            <Button asChild variant="secondary">
              <Link href="/portal/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const tier = tierOf(property);
  const Icon = CLASS_ICON[property.classKind];
  const ytdPct =
    property.ytdBilled > 0 ? (property.ytdPaid / property.ytdBilled) * 100 : 100;

  const applications = applicationsForProperty(property.id);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      {/* Breadcrumb */}
      <ScrollReveal>
        <Link
          href="/portal/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
      </ScrollReveal>

      {/* Property header card */}
      <ScrollReveal>
        <Card className="mb-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-micro text-muted">
                <span className="inline-flex items-center gap-1">
                  <Icon className="h-3 w-3" aria-hidden /> {property.classKind}
                </span>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden /> {property.ward} ward
                </span>
                <span aria-hidden>·</span>
                <span>{property.areaSqm.toLocaleString()} m²</span>
              </div>
              <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
                {property.stand}
              </h1>
              <p className="mt-1 text-small text-muted">{property.address}</p>

              <div className="mt-5 flex flex-wrap items-end gap-6">
                <div>
                  <div className="text-micro text-muted">Outstanding balance</div>
                  <div
                    className={
                      tier === 'clear'
                        ? 'text-[32px] font-bold leading-10 tabular-nums text-success'
                        : tier === 'overdue'
                          ? 'text-[32px] font-bold leading-10 tabular-nums text-danger'
                          : 'text-[32px] font-bold leading-10 tabular-nums text-warning'
                    }
                  >
                    {formatCurrency(property.balanceUsd)}
                  </div>
                </div>
                <div>
                  <div className="text-micro text-muted">Next bill due</div>
                  <div className="text-body font-semibold text-ink">
                    {formatDate(property.nextDueAt)}
                  </div>
                </div>
                <BalancePill tier={tier} />
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <ProgressRing value={ytdPct} size={72} stroke={6} label="Year-to-date payment progress" />
              <span className="text-micro text-muted">YTD paid</span>
              <div className="flex flex-col gap-2 sm:items-end">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto"
                  trailingIcon={<ArrowRight className="h-4 w-4" />}
                >
                  <Link href={`/portal/pay/${property.id}`}>
                    {property.balanceUsd > 0 ? 'Pay now' : 'Pay ahead'}
                  </Link>
                </Button>
                {tier === 'overdue' && (
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/portal/property/${property.id}/arrangement`}>
                      Request arrangement
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/portal/property/${property.id}/auto-pay`}>
                    {autoPay?.active ? 'Auto-pay set ✓' : 'Set up auto-pay'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {property.balanceUsd > 0 && (
        <ScrollReveal delay={50}>
          <div className="mb-5">
            <AlertStrip
              tone={tier === 'overdue' ? 'danger' : 'warning'}
              title={`${formatCurrency(property.balanceUsd)} is currently outstanding.`}
              body="Pay via EcoCash, OneMoney, InnBucks, Paynow or bank transfer."
              href={`/portal/pay/${property.id}`}
              cta="Pay now"
            />
          </div>
        </ScrollReveal>
      )}

      {/* Tabs */}
      <Tabs defaultValue="statement">
        <ScrollReveal delay={80}>
          <TabsList className="mb-1 flex-wrap">
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="payments">
              Payments
              <Badge tone="neutral" className="ml-1">
                {transactions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="applications">
              Applications
              <Badge tone="neutral" className="ml-1">
                {applications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
          </TabsList>
        </ScrollReveal>

        <TabsContent value="statement">
          <div className="mb-4">
            <AgeingBuckets property={property} />
          </div>
          <StatementTable propertyId={property.id} />
        </TabsContent>

        <TabsContent value="payments">
          <RecentActivity transactions={transactions} title="All payments" />
        </TabsContent>

        <TabsContent value="documents">
          <EmptyState
            icon={<FolderLock className="h-8 w-8" />}
            title="No documents yet."
            description="Receipts and certificates for this property will appear here after your first payment."
          />
        </TabsContent>

        <TabsContent value="applications">
          {applications.length === 0 ? (
            <EmptyState
              icon={<FileBadge2 className="h-8 w-8" />}
              title="No applications linked to this property."
              description="Business licences and building plans tied to this stand will appear here."
              action={
                <Button asChild variant="secondary">
                  <Link href="/portal/apply/business-licence">Start an application</Link>
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {applications.map((app) => (
                <li key={app.id}>
                  <Link
                    href={`/portal/applications/${app.reference}`}
                    className="flex items-center justify-between rounded-lg border border-line bg-card px-4 py-3 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-sm"
                  >
                    <div className="min-w-0">
                      <div className="text-small font-semibold text-ink">{app.title}</div>
                      <div className="text-micro text-muted">
                        {APPLICATION_TYPE_LABEL[app.type]} · {app.reference}
                      </div>
                    </div>
                    <Badge
                      tone={
                        app.stage === 'approved' || app.stage === 'issued'
                          ? 'success'
                          : app.stage === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {app.stage.replace('-', ' ')}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="ownership">
          <OwnershipTab propertyId={property.id} propertyStand={property.stand} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
