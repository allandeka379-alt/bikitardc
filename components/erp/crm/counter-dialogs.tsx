'use client';

// ─────────────────────────────────────────────
// Counter-desk dialogs for the CRM customer 360.
//
//   • RecordPaymentDialog    — cash / EcoCash / bank
//   • RaisePenaltyDialog     — new penalty
//   • WaivePenaltyDialog     — waive an existing
//   • ApplyLicenceDialog     — submit on behalf
//   • AddNoteDialog          — log an interaction
//
// Every dialog persists its state via the CRM
// store (or the demo store for cash receipts) so
// the changes survive a page reload.
// ─────────────────────────────────────────────

import * as Dialog from '@radix-ui/react-dialog';
import { CircleDollarSign, FileBadge2, Pencil, ShieldAlert, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useCrmStore } from '@/lib/stores/crm';
import { useDemoStore } from '@/lib/stores/demo';
import { useErpStore } from '@/lib/stores/erp';
import {
  type ApplicationType,
  APPLICATION_TYPE_LABEL,
} from '@/mocks/fixtures/applications';
import type { Penalty, PenaltyReason } from '@/mocks/fixtures/penalties';
import { PENALTY_REASON_LABEL } from '@/mocks/fixtures/penalties';
import type { Property } from '@/mocks/fixtures/properties';
import { FEE_SCHEDULE } from '@/mocks/fixtures/rate-cards';
import type { PaymentChannel, Transaction } from '@/mocks/fixtures/transactions';

// ─── Shared dialog shell ─────────────────────

interface ShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

function DialogShell({ open, onOpenChange, title, subtitle, icon, children, footer }: ShellProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed inset-x-4 top-1/2 z-[60] -translate-y-1/2 rounded-lg bg-card shadow-card-lg sm:left-1/2 sm:w-full sm:max-w-[520px] sm:-translate-x-1/2',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-primary/10 text-brand-primary" aria-hidden>
                {icon}
              </span>
              <div>
                <Dialog.Title className="text-body font-semibold text-ink">{title}</Dialog.Title>
                {subtitle && <Dialog.Description className="mt-0.5 text-micro text-muted">{subtitle}</Dialog.Description>}
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-line p-4">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Record payment dialog ────────────────────

export function RecordPaymentDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
  properties,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string;
  properties: Property[];
}) {
  const applyPayment = useDemoStore((s) => s.applyPayment);
  const addAudit = useErpStore((s) => s.addAudit);
  const { fullName } = useCurrentUser();
  const hasProps = properties.length > 0;
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [amountText, setAmountText] = useState('');
  const [channel, setChannel] = useState<PaymentChannel>('cash');
  const [note, setNote] = useState('');

  const amount = Number(amountText || '0');
  const isValid = amount > 0 && !!propertyId;

  const submit = () => {
    if (!isValid) return;
    const reference = `TX-COUNTER-${Date.now().toString(36).toUpperCase()}`;
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      reference,
      propertyId,
      ownerId,
      amount,
      currency: 'USD',
      channel,
      status: 'succeeded',
      createdAt: new Date().toISOString(),
      note: note || `Counter receipt by ${fullName ?? 'Clerk'}`,
    };
    applyPayment(tx);
    addAudit({
      actorName: fullName ?? 'Rates Clerk',
      actorRole: 'Rates Clerk',
      action: 'payment-recorded',
      subject: `${reference} · ${formatCurrency(amount)} · ${ownerName}`,
    });
    toast({ title: 'Payment recorded', description: `${reference} — ${formatCurrency(amount)}.`, tone: 'success' });
    onOpenChange(false);
    setAmountText('');
    setNote('');
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Record payment"
      subtitle={`Counter receipt for ${ownerName}`}
      icon={<CircleDollarSign className="h-5 w-5" />}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!isValid}>Record payment</Button>
        </>
      }
    >
      {!hasProps ? (
        <p className="text-small text-muted">This customer has no linked properties — link one before recording payments.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <Label>Property</Label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.stand} — {p.address} · bal {formatCurrency(p.balanceUsd)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="crm-pay-amount">Amount (USD)</Label>
              <Input
                id="crm-pay-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value.replace(/[^\d.]/g, ''))}
              />
            </div>
            <div>
              <Label htmlFor="crm-pay-channel">Channel</Label>
              <select
                id="crm-pay-channel"
                className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                value={channel}
                onChange={(e) => setChannel(e.target.value as PaymentChannel)}
              >
                <option value="cash">Cash</option>
                <option value="ecocash">EcoCash</option>
                <option value="onemoney">OneMoney</option>
                <option value="paynow">Paynow</option>
                <option value="bank">Bank transfer</option>
                <option value="zimswitch">ZimSwitch</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="crm-pay-note">Note (optional)</Label>
            <Input
              id="crm-pay-note"
              placeholder="Cheque ref, receipt details…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      )}
    </DialogShell>
  );
}

// ─── Raise penalty dialog ─────────────────────

export function RaisePenaltyDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
  properties,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string;
  properties: Property[];
}) {
  const raise = useCrmStore((s) => s.raisePenalty);
  const addAudit = useErpStore((s) => s.addAudit);
  const { fullName } = useCurrentUser();
  const [reason, setReason] = useState<PenaltyReason>('late-payment-interest');
  const [amountText, setAmountText] = useState('');
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id ?? '');
  const [note, setNote] = useState('');

  const amount = Number(amountText || '0');
  const isValid = amount > 0;

  const submit = () => {
    if (!isValid) return;
    const pen = raise({
      ownerId,
      propertyId: propertyId || undefined,
      reason,
      amountUsd: amount,
      note,
      appliedBy: fullName ?? 'Rates Clerk',
    });
    addAudit({
      actorName: fullName ?? 'Rates Clerk',
      actorRole: 'Rates Clerk',
      action: 'penalty-raised',
      subject: `${pen.reference} · ${formatCurrency(amount)} · ${ownerName}`,
    });
    toast({ title: 'Penalty raised', description: `${pen.reference} recorded.`, tone: 'info' });
    onOpenChange(false);
    setAmountText('');
    setNote('');
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Raise penalty"
      subtitle={`Against ${ownerName}`}
      icon={<ShieldAlert className="h-5 w-5" />}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!isValid} variant="gold">Raise</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label>Reason</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            value={reason}
            onChange={(e) => setReason(e.target.value as PenaltyReason)}
          >
            {(Object.keys(PENALTY_REASON_LABEL) as PenaltyReason[]).map((k) => (
              <option key={k} value={k}>{PENALTY_REASON_LABEL[k]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="crm-pen-amount">Amount (USD)</Label>
            <Input
              id="crm-pen-amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </div>
          <div>
            <Label>Property (optional)</Label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">— none —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.stand}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="crm-pen-note">Note</Label>
          <Input
            id="crm-pen-note"
            placeholder="Reference bylaw / incident details…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </DialogShell>
  );
}

// ─── Waive penalty dialog ─────────────────────

export function WaivePenaltyDialog({
  open,
  onOpenChange,
  penalty,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  penalty: Penalty | null;
}) {
  const waive = useCrmStore((s) => s.waivePenalty);
  const addAudit = useErpStore((s) => s.addAudit);
  const { fullName } = useCurrentUser();
  const [reason, setReason] = useState('');
  const isValid = reason.trim().length >= 4;

  const submit = () => {
    if (!penalty || !isValid) return;
    waive(penalty.id, {
      waivedBy: fullName ?? 'Rates Clerk',
      waiverReason: reason.trim(),
    });
    addAudit({
      actorName: fullName ?? 'Rates Clerk',
      actorRole: 'Rates Clerk',
      action: 'penalty-waived',
      subject: `${penalty.reference} — ${formatCurrency(penalty.amountUsd)}`,
    });
    toast({ title: 'Penalty waived', description: `${penalty.reference} cleared.`, tone: 'success' });
    onOpenChange(false);
    setReason('');
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Waive penalty"
      subtitle={penalty ? `${penalty.reference} · ${formatCurrency(penalty.amountUsd)}` : undefined}
      icon={<ShieldAlert className="h-5 w-5" />}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!isValid}>Waive</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-small text-muted">Waivers are logged in the audit trail and require a reason.</p>
        <div>
          <Label htmlFor="crm-waive-reason">Waiver reason</Label>
          <Input
            id="crm-waive-reason"
            placeholder="e.g. First-time offender, compassionate grounds…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>
    </DialogShell>
  );
}

// ─── Apply for licence dialog ─────────────────

const LICENCE_TYPES: ApplicationType[] = [
  'business-licence',
  'building-plan',
  'market-stall',
  'residential-stand',
  'liquor-licence',
  'burial-order',
  'hawkers-permit',
  'rates-clearance',
];

function suggestedFee(type: ApplicationType): number {
  const map: Partial<Record<string, string>> = {
    'business-licence':  'fs_bl_new',
    'building-plan':     'fs_bp',
    'market-stall':      'fs_market',
    'residential-stand': 'fs_stand',
    'liquor-licence':    'fs_liquor',
    'burial-order':      'fs_burial',
    'hawkers-permit':    'fs_hawkers',
    'rates-clearance':   'fs_clearance',
  };
  const fee = FEE_SCHEDULE.find((f) => f.id === map[type]);
  return fee?.amountUsd ?? 0;
}

export function ApplyLicenceDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
  properties,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string;
  properties: Property[];
}) {
  const submitApp = useCrmStore((s) => s.submitApplication);
  const addAudit = useErpStore((s) => s.addAudit);
  const { fullName } = useCurrentUser();
  const [type, setType] = useState<ApplicationType>('business-licence');
  const [propertyId, setPropertyId] = useState<string>(properties[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [feePaid, setFeePaid] = useState(true);
  const fee = useMemo(() => suggestedFee(type), [type]);

  const submit = () => {
    const app = submitApp({
      ownerId,
      propertyId: propertyId || undefined,
      type,
      feeUsd: feePaid ? fee : 0,
      note,
      submittedBy: fullName ?? 'Rates Clerk',
    });
    addAudit({
      actorName: fullName ?? 'Rates Clerk',
      actorRole: 'Rates Clerk',
      action: 'application-submitted',
      subject: `${app.reference} · ${APPLICATION_TYPE_LABEL[type]} · ${ownerName}`,
    });
    toast({
      title: 'Application submitted',
      description: `${app.reference} — routed to the review queue.`,
      tone: 'success',
    });
    onOpenChange(false);
    setNote('');
    setFeePaid(true);
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Apply for licence"
      subtitle={`On behalf of ${ownerName}`}
      icon={<FileBadge2 className="h-5 w-5" />}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Submit</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label>Application type</Label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            value={type}
            onChange={(e) => setType(e.target.value as ApplicationType)}
          >
            {LICENCE_TYPES.map((t) => (
              <option key={t} value={t}>{APPLICATION_TYPE_LABEL[t]}</option>
            ))}
          </select>
        </div>
        {properties.length > 0 && (
          <div>
            <Label>Related property (optional)</Label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">— none —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.stand} — {p.address}</option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center justify-between rounded-md border border-line bg-surface/50 p-3">
          <div>
            <div className="text-small font-medium text-ink">Fee</div>
            <div className="text-micro text-muted">{formatCurrency(fee)} — suggested from the fee schedule</div>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-small text-ink">
            <input type="checkbox" checked={feePaid} onChange={(e) => setFeePaid(e.target.checked)} />
            Fee paid at counter
          </label>
        </div>
        <div>
          <Label htmlFor="crm-app-note">Counter note (optional)</Label>
          <Input
            id="crm-app-note"
            placeholder="Anything the reviewer should know…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>
    </DialogShell>
  );
}

// ─── Add interaction note dialog ──────────────

export function AddNoteDialog({
  open,
  onOpenChange,
  ownerId,
  ownerName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownerId: string;
  ownerName: string;
}) {
  const add = useCrmStore((s) => s.addNote);
  const { fullName } = useCurrentUser();
  const [kind, setKind] = useState<'call' | 'counter' | 'letter' | 'email' | 'note'>('counter');
  const [body, setBody] = useState('');
  const isValid = body.trim().length >= 3;

  const submit = () => {
    if (!isValid) return;
    add({
      ownerId,
      authorName: fullName ?? 'Rates Clerk',
      body: body.trim(),
      kind,
    });
    toast({ title: 'Note saved', description: `Logged against ${ownerName}.`, tone: 'success' });
    onOpenChange(false);
    setBody('');
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Log interaction"
      subtitle={`Against ${ownerName}`}
      icon={<Pencil className="h-5 w-5" />}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!isValid}>Save note</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {(['counter', 'call', 'email', 'letter', 'note'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-full border px-3 py-1 text-micro font-semibold uppercase tracking-wide transition-colors',
                kind === k
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-line bg-card text-muted hover:text-ink',
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div>
          <Label htmlFor="crm-note-body">Note</Label>
          <textarea
            id="crm-note-body"
            rows={4}
            className="mt-1 w-full rounded-md border border-line bg-card p-3 text-small text-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            placeholder="Interaction details…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </DialogShell>
  );
}

// Small Badge pass-through so the dialog file is one stop for imports.
export { Badge };
