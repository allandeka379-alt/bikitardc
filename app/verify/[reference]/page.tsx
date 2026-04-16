'use client';

// ─────────────────────────────────────────────
// Public QR verification page
//
// Both PDF receipts and PDF certificates encode a
// link to /verify/:reference. We look the reference
// up in:
//   1. static TRANSACTIONS / APPLICATIONS fixtures
//   2. the runtime demo store (payments + apps
//      created during this session)
// and render a branded "verified" stamp with the
// subject-appropriate details, or an "unverified"
// state if no match is found.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  CheckCircle2,
  FileBadge2,
  ShieldAlert,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { useApplicationStore } from '@/lib/stores/application';
import { useDemoStore } from '@/lib/stores/demo';
import { useErpStore } from '@/lib/stores/erp';
import { formatDate } from '@/lib/format';
import { APPLICATIONS, APPLICATION_TYPE_LABEL, type Application } from '@/mocks/fixtures/applications';
import { findProperty } from '@/mocks/fixtures/properties';
import {
  CHANNEL_LABEL,
  TRANSACTIONS,
  type Transaction,
} from '@/mocks/fixtures/transactions';
import { DEMO_USERS } from '@/mocks/fixtures/users';

export default function VerifyReferencePage() {
  const params = useParams<{ reference: string }>();
  const hydrated = useHydrated();
  const extras = useDemoStore((s) => s.extraTransactions);
  const runtimeApps = useApplicationStore((s) => s.runtimeApps);
  const stageOverrides = useErpStore((s) => s.applicationStage);
  const feePaid = useApplicationStore((s) => s.feePaid);

  const reference = decodeURIComponent(params.reference ?? '');

  const tx: Transaction | undefined =
    TRANSACTIONS.find((t) => t.reference === reference) ??
    (hydrated ? extras.find((t) => t.reference === reference) : undefined);

  const baseApp = [...runtimeApps, ...APPLICATIONS].find((a) => a.reference === reference);
  const app: Application | undefined = baseApp
    ? {
        ...baseApp,
        stage: stageOverrides[baseApp.id] ?? baseApp.stage,
        feePaid: feePaid[baseApp.id] ?? baseApp.feePaid,
      }
    : undefined;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="mx-auto flex max-w-[720px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
      </header>

      <main className="mx-auto max-w-[560px] px-5 pb-16 pt-4 sm:px-8">
        {!hydrated ? (
          <Card className="p-8" />
        ) : tx ? (
          <ReceiptVerified tx={tx} />
        ) : app ? (
          <ApplicationVerified app={app} />
        ) : (
          <UnverifiedCard reference={reference} />
        )}
      </main>
    </div>
  );
}

function ReceiptVerified({ tx }: { tx: Transaction }) {
  const property = findProperty(tx.propertyId);
  return (
    <>
      <Stamp tone="success" Icon={ShieldCheck} />
      <h1 className="text-center text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
        Receipt verified
      </h1>
      <p className="mt-2 text-center text-small text-muted">
        This receipt was issued by Bikita Rural District Council.
      </p>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-4">
          <div>
            <div className="text-micro text-muted">Amount</div>
            <div className="text-[22px] font-bold tabular-nums text-ink">
              {tx.currency} {tx.amount.toFixed(2)}
            </div>
          </div>
          <Badge tone="success">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </Badge>
        </div>
        <dl className="divide-y divide-line px-5 text-small">
          <Row label="Reference" value={tx.reference} />
          <Row label="Paid at" value={formatDate(tx.createdAt)} />
          <Row label="Method" value={CHANNEL_LABEL[tx.channel]} />
          {property && <Row label="Property" value={`${property.stand} · ${property.address}`} />}
        </dl>
      </Card>

      <DemoFooter />
    </>
  );
}

function ApplicationVerified({ app }: { app: Application }) {
  const issued = app.stage === 'issued' || app.stage === 'approved';
  const owner = DEMO_USERS.find((u) => u.id === app.ownerId);
  const validTo = new Date();
  validTo.setFullYear(validTo.getFullYear() + 1);

  if (!issued || !app.feePaid) {
    return (
      <>
        <Stamp tone="warning" Icon={FileBadge2} />
        <h1 className="text-center text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
          Application exists but isn't yet issued
        </h1>
        <p className="mt-2 text-center text-small text-muted">
          Reference <span className="font-semibold">{app.reference}</span> is on record but the certificate
          hasn't been issued yet. Current stage:{' '}
          <span className="font-semibold">{app.stage.replace('-', ' ')}</span>.
        </p>
        <Card className="mt-6 overflow-hidden">
          <dl className="divide-y divide-line px-5 text-small">
            <Row label="Reference" value={app.reference} />
            <Row label="Type" value={APPLICATION_TYPE_LABEL[app.type]} />
            <Row label="Stage" value={app.stage.replace('-', ' ')} />
            <Row label="Fee" value={app.feePaid ? 'Paid' : 'Pending'} />
          </dl>
        </Card>
        <DemoFooter />
      </>
    );
  }

  return (
    <>
      <Stamp tone="success" Icon={FileBadge2} />
      <h1 className="text-center text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
        Certificate verified
      </h1>
      <p className="mt-2 text-center text-small text-muted">
        This certificate was issued by Bikita Rural District Council.
      </p>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-4">
          <div>
            <div className="text-micro text-muted">Type</div>
            <div className="text-h3 font-bold text-ink">{APPLICATION_TYPE_LABEL[app.type]}</div>
          </div>
          <Badge tone="success">
            <CheckCircle2 className="h-3 w-3" />
            Issued
          </Badge>
        </div>
        <dl className="divide-y divide-line px-5 text-small">
          <Row label="Reference" value={app.reference} />
          <Row label="Title" value={app.title} />
          {owner && <Row label="Issued to" value={owner.fullName} />}
          <Row label="Valid until" value={formatDate(validTo)} />
          <Row label="Fee" value={`USD ${app.feeUsd.toFixed(2)} — Paid`} />
        </dl>
      </Card>

      <DemoFooter />
    </>
  );
}

function UnverifiedCard({ reference }: { reference: string }) {
  return (
    <>
      <Stamp tone="warning" Icon={ShieldAlert} />
      <h1 className="text-center text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
        We couldn't verify this document
      </h1>
      <p className="mt-2 text-center text-small text-muted">
        Reference <span className="font-semibold">{reference}</span> was not found in our records. If this
        is from a recent payment or application, the document may only exist on the issuing device.
      </p>
      <DemoFooter />
    </>
  );
}

function Stamp({
  tone,
  Icon,
}: {
  tone: 'success' | 'warning';
  Icon: LucideIcon;
}) {
  return (
    <div className="mb-5 flex items-center justify-center">
      <span
        className={
          tone === 'success'
            ? 'grid h-14 w-14 place-items-center rounded-full bg-success text-white shadow-card-md'
            : 'grid h-14 w-14 place-items-center rounded-full bg-warning text-white shadow-card-md'
        }
      >
        <Icon className="h-7 w-7" strokeWidth={2.2} />
      </span>
    </div>
  );
}

function DemoFooter() {
  return (
    <p className="mt-6 text-center text-micro text-muted">DEMO — Not a live verification service.</p>
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
