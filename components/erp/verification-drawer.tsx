'use client';

// ─────────────────────────────────────────────
// Review drawer for a pending verification.
//
// Journey C step 4-5: clerk opens a case → reviews
// the documents → clicks Approve → toast confirms →
// audit log entry added.
// ─────────────────────────────────────────────

import * as Dialog from '@radix-ui/react-dialog';
import { Check, File, IdCard, ShieldCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useErpStore } from '@/lib/stores/erp';
import { formatDate } from '@/lib/format';
import { findProperty } from '@/mocks/fixtures/properties';
import {
  VERIFICATION_KIND_LABEL,
  type Verification,
} from '@/mocks/fixtures/verifications';
import { cn } from '@/lib/cn';

interface Props {
  verification: Verification | null;
  onClose: () => void;
}

const DOC_ICON = {
  id:     <IdCard className="h-4 w-4" />,
  letter: <File className="h-4 w-4" />,
  bill:   <File className="h-4 w-4" />,
  other:  <File className="h-4 w-4" />,
} as const;

export function VerificationDrawer({ verification, onClose }: Props) {
  const open = !!verification;
  const approve = useErpStore((s) => s.approveVerification);
  const reject = useErpStore((s) => s.rejectVerification);
  const { fullName } = useCurrentUser();

  const subjectProp = verification ? findProperty(verification.subjectPropertyId) : undefined;

  const handleApprove = () => {
    if (!verification) return;
    const actor = fullName ?? 'Rates Clerk';
    const subject = `${verification.reference} — ${verification.applicantName} → ${subjectProp?.stand ?? verification.subjectPropertyId}`;
    approve(verification.id, actor, subject);
    toast({
      title: 'Approved',
      description: `${verification.reference} — access granted.`,
      tone: 'success',
    });
    onClose();
  };

  const handleReject = () => {
    if (!verification) return;
    const actor = fullName ?? 'Rates Clerk';
    const subject = `${verification.reference} — ${verification.applicantName}`;
    reject(verification.id, actor, subject);
    toast({
      title: 'Rejected',
      description: `${verification.reference} — applicant notified.`,
      tone: 'danger',
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-[60] flex h-dvh w-full max-w-[520px] flex-col bg-card shadow-card-lg',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-right-6',
          )}
        >
          {verification && (
            <>
              <div className="flex items-start justify-between border-b border-line px-5 py-4">
                <div className="min-w-0">
                  <Badge tone="warning" className="mb-2">
                    Pending review
                  </Badge>
                  <Dialog.Title className="text-h3 text-ink">
                    {verification.reference}
                  </Dialog.Title>
                  <Dialog.Description className="mt-0.5 text-small text-muted">
                    {VERIFICATION_KIND_LABEL[verification.kind]} · submitted {formatDate(verification.submittedAt)}
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  className="grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface hover:text-ink"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <Section label="Applicant">
                  <div className="text-body font-semibold text-ink">{verification.applicantName}</div>
                  <div className="text-small text-muted">{verification.relationship}</div>
                </Section>

                <Section label="Subject property">
                  <div className="text-body font-semibold text-ink">
                    {subjectProp?.stand ?? verification.subjectPropertyId}
                  </div>
                  <div className="text-small text-muted">{subjectProp?.address ?? ''}</div>
                  <div className="mt-1 text-micro text-muted">
                    Owner of record: {subjectProp?.ownerName ?? '—'} · {subjectProp?.ward ?? ''} ward
                  </div>
                </Section>

                <Section label="Reason">
                  <p className="text-small text-ink">{verification.note}</p>
                </Section>

                <Section label={`Supporting documents (${verification.supportingDocs.length})`}>
                  <ul className="grid gap-2">
                    {verification.supportingDocs.map((doc, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-md border border-line bg-surface/60 px-3 py-2.5"
                      >
                        <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                          {DOC_ICON[doc.type]}
                        </span>
                        <div className="flex-1 text-small">
                          <div className="font-medium text-ink">{doc.label}</div>
                          <div className="text-micro text-muted">{doc.type.toUpperCase()} · click to preview</div>
                        </div>
                        <Badge tone="success" dot>
                          Uploaded
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Section>

                <div className="mt-4 flex items-start gap-2 rounded-md border border-brand-primary/20 bg-brand-primary/5 p-3 text-small text-brand-primary">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <p>
                    Approving grants the applicant view and pay access to the subject property. A full
                    audit entry is recorded and the applicant is notified by SMS and WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
                <Button variant="secondary" onClick={handleReject} leadingIcon={<X className="h-4 w-4" />}>
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  leadingIcon={<Check className="h-4 w-4" />}
                >
                  Approve
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        {label}
      </div>
      {children}
    </section>
  );
}
