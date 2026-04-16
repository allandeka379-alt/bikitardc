'use client';

// ─────────────────────────────────────────────
// Property transfer wizard (spec §3.2 "Property
// transfer workflow" Demo-Visual).
//
// Lodges an owner-change verification into the
// ERP queue. A clerk approves, after which the
// ownership timeline can be back-filled.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileSignature,
  IdCard,
  Send,
  ShieldCheck,
  User2,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DocUploader, type UploadedFile } from '@/components/portal/doc-uploader';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stepper } from '@/components/ui/stepper';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { usePropertyWithOverrides } from '@/lib/stores/demo';
import { useErpStore } from '@/lib/stores/erp';
import { formatCurrency } from '@/lib/format';
import type { Verification } from '@/mocks/fixtures/verifications';

type TransferReason = 'sale' | 'inheritance' | 'gift' | 'subdivision';

const REASONS: { id: TransferReason; label: string; desc: string }[] = [
  { id: 'sale',         label: 'Sale',          desc: 'A deed of sale has been signed.' },
  { id: 'inheritance',  label: 'Inheritance',   desc: 'Estate devolved after a passing.' },
  { id: 'gift',         label: 'Gift',          desc: 'Passed to a family member at no cost.' },
  { id: 'subdivision',  label: 'Subdivision',   desc: 'Parent stand split into new stands.' },
];

const STEPS = [
  { id: 'new-owner',  label: 'New owner' },
  { id: 'reason',     label: 'Reason' },
  { id: 'documents',  label: 'Documents' },
  { id: 'confirm',    label: 'Confirm' },
];

interface FormState {
  newOwnerName: string;
  newOwnerId: string;
  newOwnerPhone: string;
  newOwnerEmail: string;
  reason: TransferReason | null;
  priceUsd: number;
  documents: UploadedFile[];
  note: string;
}

const EMPTY: FormState = {
  newOwnerName: '',
  newOwnerId: '',
  newOwnerPhone: '',
  newOwnerEmail: '',
  reason: null,
  priceUsd: 0,
  documents: [],
  note: '',
};

export default function PropertyTransferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, userId, fullName } = useCurrentUser();
  const property = usePropertyWithOverrides(id);
  const submit = useErpStore((s) => s.submitVerification);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  if (!hydrated) return null;
  if (!property) return notFound();
  if (userId && property.ownerId !== userId) return notFound();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (s: number): string | null => {
    if (s === 0) {
      if (!form.newOwnerName.trim()) return 'Add the new owner\'s full name.';
      if (!form.newOwnerId.trim()) return 'National ID number is required.';
      if (!/^[+\d\s]{7,}$/.test(form.newOwnerPhone)) return 'Add a valid phone number.';
    }
    if (s === 1) {
      if (!form.reason) return 'Pick a reason for the transfer.';
      if (form.reason === 'sale' && form.priceUsd <= 0) return 'Enter the sale price.';
    }
    if (s === 2) {
      if (form.documents.length < 1) return 'Upload at least the deed / affidavit.';
    }
    return null;
  };

  const advance = () => {
    const err = validate(step);
    if (err) return toast({ title: err, tone: 'danger' });
    if (step < STEPS.length - 1) setStep(step + 1);
    else actuallySubmit();
  };

  const actuallySubmit = () => {
    if (!userId || !form.reason) return;
    setSubmitting(true);

    const now = new Date().toISOString();
    const ref = `TR-${new Date().getFullYear()}-${String(3000 + Math.floor(Math.random() * 999))}`;
    const v: Verification = {
      id: `v_tr_${Math.random().toString(36).slice(2, 10)}`,
      reference: ref,
      kind: 'owner-change',
      applicantId: userId,
      applicantName: fullName ?? 'Resident',
      subjectPropertyId: property.id,
      relationship:
        form.reason === 'sale'
          ? `Sale to ${form.newOwnerName} — ${formatCurrency(form.priceUsd)}`
          : `${form.reason} to ${form.newOwnerName}`,
      note: form.note.trim() || `Proposed new owner: ${form.newOwnerName}, ID ${form.newOwnerId}.`,
      supportingDocs: form.documents.map((d) => ({ label: d.name, type: 'letter' })),
      submittedAt: now,
      status: 'pending',
    };

    submit(v);
    setTimeout(() => {
      toast({
        title: `Transfer ${ref} lodged`,
        description: 'A clerk will verify the documents within 48 working hours.',
        tone: 'success',
      });
      router.replace(`/portal/property/${property.id}`);
    }, 300);
  };

  return (
    <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href={`/portal/property/${property.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to property
      </Link>

      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Transfer {property.stand}</h1>
          <p className="mt-1 text-small text-muted">
            Lodge a change of ownership. Once approved, the new owner inherits the account and the
            ownership timeline is updated.
          </p>
        </div>
      </ScrollReveal>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 pb-5 pt-5">
          <Stepper steps={STEPS} current={step} />
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && <StepOwner form={form} set={set} />}
          {step === 1 && <StepReason form={form} set={set} />}
          {step === 2 && <StepDocs form={form} set={set} />}
          {step === 3 && <StepConfirm form={form} propertyStand={property.stand} />}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface/40 px-5 py-4">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            leadingIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <Button
            onClick={advance}
            loading={submitting}
            trailingIcon={
              step === STEPS.length - 1 ? <Send className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />
            }
          >
            {step === STEPS.length - 1 ? 'Lodge transfer' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StepOwner({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
        <User2 className="mr-1.5 inline h-4 w-4" />
        Who is taking ownership? The council will contact them directly to confirm.
      </div>
      <div>
        <Label htmlFor="newOwnerName">Full legal name</Label>
        <Input
          id="newOwnerName"
          value={form.newOwnerName}
          onChange={(e) => set('newOwnerName', e.target.value)}
          placeholder="e.g. Patience Moyo"
        />
      </div>
      <div>
        <Label htmlFor="newOwnerId">National ID / passport number</Label>
        <div className="relative">
          <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id="newOwnerId"
            className="pl-9"
            value={form.newOwnerId}
            onChange={(e) => set('newOwnerId', e.target.value)}
            placeholder="00-123456K00"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="newOwnerPhone">Phone</Label>
          <Input
            id="newOwnerPhone"
            type="tel"
            value={form.newOwnerPhone}
            onChange={(e) => set('newOwnerPhone', e.target.value)}
            placeholder="+263 77 123 4567"
          />
        </div>
        <div>
          <Label htmlFor="newOwnerEmail">Email (optional)</Label>
          <Input
            id="newOwnerEmail"
            type="email"
            value={form.newOwnerEmail}
            onChange={(e) => set('newOwnerEmail', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function StepReason({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="grid gap-4">
      <div>
        <Label>Reason for transfer</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {REASONS.map((r) => {
            const active = form.reason === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => set('reason', r.id)}
                className={
                  active
                    ? 'rounded-md border border-brand-primary bg-brand-primary/5 px-3 py-2.5 text-left shadow-ring-brand'
                    : 'rounded-md border border-line bg-card px-3 py-2.5 text-left transition-colors hover:border-brand-primary/25'
                }
                aria-pressed={active}
              >
                <div className="text-small font-semibold text-ink">{r.label}</div>
                <div className="text-micro text-muted">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
      {form.reason === 'sale' && (
        <div className="max-w-xs">
          <Label htmlFor="price">Sale price (USD)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step={100}
            value={form.priceUsd}
            onChange={(e) => set('priceUsd', Number(e.target.value))}
          />
        </div>
      )}
      <div>
        <Label htmlFor="note">Anything else to know? (optional)</Label>
        <textarea
          id="note"
          rows={3}
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
        />
      </div>
    </div>
  );
}

function StepDocs({
  form,
  set,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <DocUploader
      value={form.documents}
      onChange={(d) => set('documents', d)}
      expected={[
        { label: 'Deed of sale / affidavit of gift',        hint: 'Signed by both parties and a commissioner of oaths.' },
        { label: "Both parties' national IDs" },
        { label: 'Rates clearance from this portal',        hint: 'Automatically generated when the account is settled.' },
        { label: 'Probate / letters of administration',     hint: 'For inheritance transfers only.' },
      ]}
    />
  );
}

function StepConfirm({ form, propertyStand }: { form: FormState; propertyStand: string }) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start gap-3 rounded-md border border-success/20 bg-success/5 p-4 text-small text-success">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          You're about to lodge a transfer for <span className="font-semibold">{propertyStand}</span> to{' '}
          <span className="font-semibold">{form.newOwnerName}</span>. This creates an owner-change
          verification in the council's queue. You'll be notified when it's processed.
        </p>
      </div>
      <Card className="p-4">
        <dl className="space-y-2 text-small">
          <Row label="Stand" value={propertyStand} />
          <Row label="New owner" value={form.newOwnerName} />
          <Row label="ID" value={form.newOwnerId} />
          <Row label="Phone" value={form.newOwnerPhone} />
          <Row
            label="Reason"
            value={
              form.reason === 'sale'
                ? `Sale at ${formatCurrency(form.priceUsd)}`
                : (form.reason ?? '—')
            }
          />
          <Row label="Documents" value={`${form.documents.length} uploaded`} />
        </dl>
      </Card>
      <div className="rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
        <ShieldCheck className="mr-1.5 inline h-4 w-4" />
        Outstanding rates must be cleared before a transfer can be formally recorded. If the account
        isn't clear, the clerk will flag this back to you.
      </div>
      <div className="inline-flex items-center gap-2 text-micro text-muted">
        <FileSignature className="h-3.5 w-3.5" /> By submitting you confirm the information above is
        correct.
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] text-right font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}
