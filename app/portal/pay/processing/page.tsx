'use client';

// ─────────────────────────────────────────────
// Payment step 2 — processing.
//
// Simulates a 4s wait with an animated progress
// ring and "Check your phone" copy. Applies the
// 90/10 success / failure split from spec §9.2,
// honours the dev-toolbar force override, then
// routes based on the subject type:
//   • property   → dashboard balance updates
//   • application → fee paid + returnTo route
// ─────────────────────────────────────────────

import { AnimatedSpinner } from '@/components/portal/animated-spinner';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { toast } from '@/components/ui/use-toast';
import { useApplicationStore } from '@/lib/stores/application';
import { useDemoStore } from '@/lib/stores/demo';
import { useNotificationsStore } from '@/lib/stores/notifications';
import { usePaymentStore } from '@/lib/stores/payment';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { formatCurrency } from '@/lib/format';
import { CHANNEL_LABEL, type Transaction } from '@/mocks/fixtures/transactions';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const PROCESSING_MS = 4000;

export default function PaymentProcessingPage() {
  const router = useRouter();
  const session = usePaymentStore((s) => s.session);
  const markProcessing = usePaymentStore((s) => s.markProcessing);
  const finish = usePaymentStore((s) => s.finish);
  const forceOutcome = usePaymentStore((s) => s.forceOutcome);
  const setForceOutcome = usePaymentStore((s) => s.setForceOutcome);
  const applyPayment = useDemoStore((s) => s.applyPayment);
  const markFeePaid = useApplicationStore((s) => s.markFeePaid);
  const pushNotification = useNotificationsStore((s) => s.push);
  const { userId } = useCurrentUser();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (!session) {
      router.replace('/portal/dashboard');
      return;
    }
    ran.current = true;
    markProcessing();

    const timer = setTimeout(() => {
      let result: 'succeeded' | 'failed' | 'timeout';
      if (forceOutcome) {
        result = forceOutcome;
        setForceOutcome(null); // one-shot override
      } else {
        const roll = Math.random();
        // 90% succeed, 8% fail, 2% timeout — spec §9.2
        result = roll < 0.9 ? 'succeeded' : roll < 0.98 ? 'failed' : 'timeout';
      }

      finish({
        status: result,
        failureCode:
          result === 'succeeded'
            ? undefined
            : result === 'failed'
              ? 'GATEWAY_DECLINED'
              : 'GATEWAY_TIMEOUT',
      });

      if (result === 'succeeded' && userId) {
        if (session.subject.type === 'property') {
          const tx: Transaction = {
            id: `tx_${Math.random().toString(36).slice(2, 10)}`,
            reference: session.reference,
            propertyId: session.subject.id,
            ownerId: userId,
            amount: session.amount,
            currency: session.currency,
            channel: session.channel,
            status: 'succeeded',
            createdAt: new Date().toISOString(),
          };
          applyPayment(tx);
          pushNotification({
            ownerId: userId,
            event: 'payment-success',
            tone: 'success',
            title: `Payment of ${formatCurrency(session.amount, session.currency)} received`,
            body: `Reference ${session.reference} — paid via ${CHANNEL_LABEL[session.channel]}. Receipt saved to your documents vault.`,
            href: '/portal/documents',
            channels: ['app', 'sms', 'whatsapp'],
          });
        }
        if (session.subject.type === 'application') {
          markFeePaid(session.subject.id);
          pushNotification({
            ownerId: userId,
            event: 'payment-success',
            tone: 'success',
            title: `Application fee of ${formatCurrency(session.amount, session.currency)} paid`,
            body: `Reference ${session.reference} — your application is now with the council for review.`,
            href: session.returnTo ?? '/portal/applications',
            channels: ['app', 'sms', 'whatsapp'],
          });
        }
      }

      if (result === 'succeeded') {
        router.replace('/portal/pay/success');
      } else {
        toast({
          title:
            result === 'timeout'
              ? 'Gateway timed out. Please try again.'
              : 'Payment was declined. Please try again.',
          tone: 'danger',
        });
        // Navigate back to a sensible place based on subject.
        const back =
          session.subject.type === 'property'
            ? `/portal/pay/${session.subject.id}`
            : (session.returnTo ?? '/portal/applications');
        router.replace(back);
      }
    }, PROCESSING_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  const isApplication = session.subject.type === 'application';

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mb-8 flex justify-center">
        <Logo size={40} />
      </div>
      <Card className="flex flex-col items-center gap-4 p-8 text-center sm:p-10">
        <AnimatedSpinner />

        <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">
          {isApplication ? 'Processing your application fee' : 'Processing your payment'}
        </h1>

        {session.channel === 'ecocash' || session.channel === 'onemoney' || session.channel === 'innbucks' ? (
          <p className="max-w-prose text-body text-muted">
            Check your phone — you should get a prompt on{' '}
            <span className="font-medium text-ink">{session.phone}</span> to approve{' '}
            <span className="font-semibold tabular-nums text-ink">
              {formatCurrency(session.amount, session.currency)}
            </span>{' '}
            via {CHANNEL_LABEL[session.channel]}.
          </p>
        ) : (
          <p className="max-w-prose text-body text-muted">
            Contacting {CHANNEL_LABEL[session.channel]} — this takes a few seconds.
          </p>
        )}

        <div className="mt-4 grid w-full gap-2 rounded-md bg-surface p-4 text-left">
          <DetailRow label="Reference" value={session.reference} />
          <DetailRow label="Method" value={CHANNEL_LABEL[session.channel]} />
          <DetailRow
            label={isApplication ? 'Application' : 'Property'}
            value={session.subject.label ?? session.subject.id}
          />
          <DetailRow
            label="Amount"
            value={formatCurrency(session.amount, session.currency)}
          />
        </div>

        <p className="mt-2 text-micro text-muted">
          Do not close this page — we'll redirect you automatically.
        </p>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-small">
      <span className="text-muted">{label}</span>
      <span className="font-medium tabular-nums text-ink">{value}</span>
    </div>
  );
}
