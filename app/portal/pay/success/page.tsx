'use client';

// ─────────────────────────────────────────────
// Payment step 3 — success
//
// Two visual variants driven by session.subject.type:
//   • property   → Journey A receipt with PDF +
//     share, "Back to dashboard"
//   • application → Journey B fee-paid confirmation,
//     "View application" CTA leading to the timeline
//
// Resetting the payment session on unmount so the
// flow can run again cleanly.
// ─────────────────────────────────────────────

import { ArrowRight, Check, FileBadge2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DownloadReceiptButton } from '@/components/receipt/download-button';
import { ShareReceiptButton } from '@/components/receipt/share-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApplicationByReference } from '@/lib/stores/application';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePaymentStore } from '@/lib/stores/payment';
import { usePropertyWithOverrides } from '@/lib/stores/demo';
import { formatCurrency, formatDate } from '@/lib/format';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import { CHANNEL_LABEL, type Transaction } from '@/mocks/fixtures/transactions';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const session = usePaymentStore((s) => s.session);
  const clear = usePaymentStore((s) => s.clear);
  const { userId } = useCurrentUser();

  // Always call both hooks; we branch on subject type below.
  const property = usePropertyWithOverrides(
    session?.subject.type === 'property' ? session.subject.id : undefined,
  );
  const application = useApplicationByReference(
    session?.subject.type === 'application' ? (session.subject.label ?? '') : '',
  );

  useEffect(() => {
    if (!session || session.status !== 'succeeded') {
      router.replace('/portal/dashboard');
    }
    return () => {
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  const me = DEMO_USERS.find((u) => u.id === userId);
  const ownerName = me?.fullName ?? 'Resident';

  if (session.subject.type === 'application') {
    return <ApplicationSuccess session={session} ownerName={ownerName} application={application} />;
  }

  // Property / rates receipt
  if (!property) return null;

  const tx: Transaction = {
    id: session.transactionId ?? 'tx_new',
    reference: session.reference,
    propertyId: session.subject.id,
    ownerId: userId ?? '',
    amount: session.amount,
    currency: session.currency,
    channel: session.channel,
    status: 'succeeded',
    createdAt: session.completedAt ?? new Date().toISOString(),
  };

  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6 sm:py-14">
      <SuccessGlyph />

      <div className="text-center">
        <h1 className="text-h1 text-ink sm:text-[2rem] sm:leading-[2.5rem]">
          Payment successful.
        </h1>
        <p className="mt-2 text-body text-muted">
          Thanks, {ownerName.split(' ')[0]}. Your payment has been recorded against {property.stand}.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-4">
          <div>
            <div className="text-micro text-muted">Amount paid</div>
            <div className="text-[28px] font-bold tabular-nums text-ink">
              {formatCurrency(tx.amount, tx.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-micro text-muted">Reference</div>
            <div className="text-small font-semibold tabular-nums text-ink">{tx.reference}</div>
          </div>
        </div>

        <dl className="divide-y divide-line px-5 text-small">
          <Row label="Paid at" value={formatDate(tx.createdAt)} />
          <Row label="Method" value={CHANNEL_LABEL[tx.channel]} />
          <Row label="Property" value={`${property.stand} · ${property.address}`} />
          <Row label="New balance" value={formatCurrency(property.balanceUsd)} />
        </dl>

        <div className="flex flex-col gap-2 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <ShareReceiptButton transaction={tx} />
          <DownloadReceiptButton
            transaction={tx}
            property={property}
            ownerName={ownerName}
          />
        </div>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-md border border-success/20 bg-success/6 p-4 text-small text-success">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          A verified copy of this receipt has been saved to your{' '}
          <Link href="/portal/documents" className="font-semibold underline-offset-2 hover:underline">
            documents vault
          </Link>
          . You'll also receive a confirmation via SMS and WhatsApp.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg" trailingIcon={<ArrowRight className="h-4 w-4" />}>
          <Link href="/portal/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href={`/portal/property/${property.id}`}>Property details</Link>
        </Button>
      </div>
    </div>
  );
}

// ─── Application fee variant ─────────────────

function ApplicationSuccess({
  session,
  ownerName,
  application,
}: {
  session: import('@/lib/stores/payment').PaymentSession;
  ownerName: string;
  application?: import('@/mocks/fixtures/applications').Application;
}) {
  const returnTo = session.returnTo ?? '/portal/applications';
  return (
    <div className="mx-auto max-w-[640px] px-4 py-8 sm:px-6 sm:py-14">
      <SuccessGlyph />

      <div className="text-center">
        <h1 className="text-h1 text-ink sm:text-[2rem] sm:leading-[2.5rem]">
          Application submitted.
        </h1>
        <p className="mt-2 text-body text-muted">
          Thanks, {ownerName.split(' ')[0]}. Your application fee has been received and your file is
          now with the council.
        </p>
      </div>

      <Card className="mt-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-4">
          <div>
            <div className="text-micro text-muted">Fee paid</div>
            <div className="text-[28px] font-bold tabular-nums text-ink">
              {formatCurrency(session.amount, session.currency)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-micro text-muted">Application</div>
            <div className="text-small font-semibold tabular-nums text-ink">
              {application?.reference ?? session.subject.label ?? '—'}
            </div>
          </div>
        </div>

        <dl className="divide-y divide-line px-5 text-small">
          <Row label="Payment reference" value={session.reference} />
          <Row label="Paid at" value={formatDate(session.completedAt ?? new Date().toISOString())} />
          <Row label="Method" value={CHANNEL_LABEL[session.channel]} />
          {application && <Row label="Title" value={application.title} />}
        </dl>

        <div className="flex flex-col gap-2 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button asChild size="md" variant="secondary" leadingIcon={<FileBadge2 className="h-4 w-4" />}>
            <Link href="/portal/applications">All my applications</Link>
          </Button>
          <Button asChild size="md" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            <Link href={returnTo}>View application</Link>
          </Button>
        </div>
      </Card>

      <div className="mt-6 flex items-start gap-2 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-4 text-small text-brand-primary">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          You'll receive status updates by SMS and WhatsApp. The council SLA is 48 working hours for
          initial review.
        </p>
      </div>
    </div>
  );
}

function SuccessGlyph() {
  return (
    <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center">
      <span className="absolute inset-0 rounded-full border-2 border-success/25 animate-pulse-ring" />
      <span
        className="absolute inset-0 rounded-full border-2 border-success/15 animate-pulse-ring"
        style={{ animationDelay: '500ms' }}
      />
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-success text-white shadow-card-md">
        <Check className="h-8 w-8" strokeWidth={3} />
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] truncate-line text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
