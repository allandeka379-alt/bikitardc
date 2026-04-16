'use client';

// ─────────────────────────────────────────────
// Application detail — Journey B step 5-7.
// Shows reference, title, stage timeline,
// fee status and (when issued) the certificate
// download.
// ─────────────────────────────────────────────

import { ArrowLeft, CheckCircle2, Clock, MessageSquare, ShieldCheck, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { CertificateDownloadButton } from '@/components/receipt/certificate-download-button';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StatusTimeline, type TimelineStage } from '@/components/portal/status-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useApplicationByReference } from '@/lib/stores/application';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { formatCurrency, formatDate, formatRelative } from '@/lib/format';
import {
  APPLICATION_TYPE_LABEL,
  STAGE_ORDER,
  type ApplicationStage,
} from '@/mocks/fixtures/applications';

const STAGE_LABEL: Record<ApplicationStage, string> = {
  submitted:              'Submitted',
  'under-review':          'Under review',
  'inspection-scheduled':  'Inspection scheduled',
  approved:               'Approved',
  issued:                 'Issued',
  rejected:               'Rejected',
};

const STAGE_DESCRIPTION: Record<ApplicationStage, string> = {
  submitted:              'Your application has been received by the council.',
  'under-review':         'A licensing officer is reviewing your documents.',
  'inspection-scheduled': 'A site inspection has been booked with a council officer.',
  approved:               'Your application has been approved. The certificate is being prepared.',
  issued:                 'Your certificate is ready — download below.',
  rejected:               'Unfortunately we could not approve this application.',
};

export default function ApplicationDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const app = useApplicationByReference(decodeURIComponent(reference ?? ''));
  const { hydrated, userId, fullName } = useCurrentUser();

  if (!hydrated) return null;
  if (!app) return notFound();
  if (userId && app.ownerId !== userId) {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-10">
        <EmptyState
          title="This application isn't on your account."
          description="Contact the council if you believe this is incorrect."
          action={
            <Button asChild variant="secondary">
              <Link href="/portal/applications">Back to my applications</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const currentIndex = STAGE_ORDER.indexOf(app.stage);
  const isRejected = app.stage === 'rejected';
  const isIssued = app.stage === 'issued' || app.stage === 'approved';

  const stages: TimelineStage[] = STAGE_ORDER.map((s, i) => {
    const ev = app.events.find((e) => e.stage === s);
    const active = i === currentIndex;
    const completed = i < currentIndex;
    return {
      id: s,
      label: STAGE_LABEL[s],
      description: active || completed ? STAGE_DESCRIPTION[s] : undefined,
      timestamp: ev ? formatRelative(ev.at) : undefined,
      note: ev?.note,
    };
  });

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/portal/applications"
        className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to my applications
      </Link>

      {/* Header */}
      <ScrollReveal>
        <Card className="mb-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-micro text-muted">
                <span>{APPLICATION_TYPE_LABEL[app.type]}</span>
                <span aria-hidden>·</span>
                <span className="font-mono text-ink">{app.reference}</span>
              </div>
              <h1 className="text-h1 text-ink sm:text-[1.75rem] sm:leading-[2.25rem]">{app.title}</h1>
              <p className="mt-1 text-small text-muted">
                Submitted {formatDate(app.submittedAt)} · Applicant {fullName}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge
                  tone={
                    isRejected
                      ? 'danger'
                      : app.stage === 'issued' || app.stage === 'approved'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {STAGE_LABEL[app.stage]}
                </Badge>
                {app.feePaid ? (
                  <Badge tone="success">Fee paid</Badge>
                ) : (
                  <Badge tone="warning">Fee pending</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="rounded-md border border-line bg-surface/60 px-4 py-2.5">
                <div className="text-micro text-muted">Fee</div>
                <div className="text-h3 font-bold tabular-nums text-ink">
                  {formatCurrency(app.feeUsd)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <ScrollReveal>
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted" />
              <h2 className="text-h3 text-ink">Progress</h2>
            </div>

            {isRejected ? (
              <div className="flex items-start gap-3 rounded-md border border-danger/20 bg-danger/5 p-4 text-small text-danger">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  This application was not approved. Reach out to the licensing office for guidance on
                  resubmitting.
                </p>
              </div>
            ) : (
              <StatusTimeline stages={stages} currentIndex={currentIndex === -1 ? 0 : currentIndex} />
            )}
          </Card>
        </ScrollReveal>

        <div className="flex flex-col gap-4">
          <ScrollReveal delay={60}>
            <Card className="p-5">
              <h3 className="text-h3 text-ink">Certificate</h3>
              {isIssued && app.feePaid ? (
                <>
                  <p className="mt-1 text-small text-muted">
                    Your licence certificate is available for download. It carries a QR code that third
                    parties can scan to verify.
                  </p>
                  <div className="mt-3">
                    <CertificateDownloadButton application={app} issuedTo={fullName ?? 'Resident'} />
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-small text-muted">
                    {isRejected
                      ? 'No certificate has been issued — the application was not approved.'
                      : "We'll generate your certificate once the application is approved."}
                  </p>
                  <div className="mt-3 rounded-md border border-dashed border-line bg-surface/50 p-3 text-small text-muted">
                    <ShieldCheck className="mb-1.5 inline h-4 w-4" />{' '}
                    Certificates carry a QR code so third parties can verify authenticity in one scan.
                  </div>
                </>
              )}
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Card className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted" />
                <h3 className="text-h3 text-ink">Council messages</h3>
              </div>
              <p className="text-small text-muted">
                You can reply to the council directly from here. Full threads ship in the next milestone.
              </p>
              <div className="mt-3 space-y-2 text-small">
                <Message
                  from="Licensing Office"
                  at={formatRelative(app.submittedAt)}
                  body="Thanks for your application. We'll review it within 48 working hours."
                />
                {currentIndex >= 1 && (
                  <Message
                    from="M. Moyo · Rates Clerk"
                    at="just now"
                    body="Reviewing your documents — everything looks in order so far."
                  />
                )}
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={180}>
            <Card className="p-5">
              <h3 className="text-h3 text-ink">Need help?</h3>
              <ul className="mt-3 flex flex-col gap-2 text-small">
                <li className="flex items-center justify-between">
                  <span className="text-muted">Call centre</span>
                  <a href="tel:+263392000000" className="font-medium text-brand-primary hover:underline">
                    +263 39 2 000 000
                  </a>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted">WhatsApp</span>
                  <span className="font-medium text-brand-primary">+263 77 000 0000</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-muted">SLA</span>
                  <span className="font-medium text-ink">48 working hours</span>
                </li>
              </ul>
            </Card>
          </ScrollReveal>
        </div>
      </div>

      <ScrollReveal delay={240}>
        <Card className="mt-4 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="text-small text-ink">
              You'll receive SMS and WhatsApp updates at every stage. Reach us any time by replying to
              the council via the messages panel above.
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}

function Message({ from, at, body }: { from: string; at: string; body: string }) {
  return (
    <div className="rounded-md border border-line bg-surface/50 p-3">
      <div className="flex items-center justify-between">
        <span className="text-micro font-semibold text-ink">{from}</span>
        <time className="text-micro text-muted">{at}</time>
      </div>
      <p className="mt-1 text-small text-ink">{body}</p>
    </div>
  );
}
