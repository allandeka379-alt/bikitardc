'use client';

// ─────────────────────────────────────────────
// ERP application detail — staff counterpart to
// /portal/applications/[reference]. Lets a clerk
// review, advance or reject an application and
// schedule an inspection; uses the shared
// StatusTimeline + fires notifications back to
// the citizen on every stage change.
// ─────────────────────────────────────────────

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  FastForward,
  FileBadge2,
  FileText,
  MessageSquare,
  Rewind,
  TriangleAlert,
  User2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { StatusTimeline, type TimelineStage } from '@/components/portal/status-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useApplicationByReference } from '@/lib/stores/application';
import { useErpStore } from '@/lib/stores/erp';
import { formatDate, formatRelative } from '@/lib/format';
import {
  APPLICATION_TYPE_LABEL,
  STAGE_ORDER,
  type ApplicationStage,
} from '@/mocks/fixtures/applications';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import { cn } from '@/lib/cn';

const STAGE_LABEL: Record<ApplicationStage, string> = {
  submitted:              'Submitted',
  'under-review':          'Under review',
  'inspection-scheduled':  'Inspection scheduled',
  approved:               'Approved',
  issued:                 'Issued',
  rejected:               'Rejected',
};

const OFFICERS = [
  'Mai Moyo · Rates Clerk',
  'Chipo Ndlovu · Revenue Officer',
  'Garikai Musara · Works Supervisor',
  'Rumbidzai Huni · Administrator',
];

export default function ErpApplicationDetailPage() {
  const { reference } = useParams<{ reference: string }>();
  const app = useApplicationByReference(decodeURIComponent(reference ?? ''));
  const { fullName } = useCurrentUser();
  const setStage = useErpStore((s) => s.setApplicationStage);

  const [assignedOfficer, setAssignedOfficer] = useState<string>(OFFICERS[0]!);
  const [inspectionDate, setInspectionDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<{ by: string; at: string; body: string }[]>([]);

  const stages: TimelineStage[] = useMemo(() => {
    if (!app) return [];
    return STAGE_ORDER.map((s) => {
      const ev = app.events.find((e) => e.stage === s);
      return {
        id: s,
        label: STAGE_LABEL[s],
        timestamp: ev ? formatRelative(ev.at) : undefined,
        note: ev?.note,
      };
    });
  }, [app]);

  if (!app) return notFound();

  const currentIndex = STAGE_ORDER.indexOf(app.stage);
  const nextStage: ApplicationStage | null =
    currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
      ? STAGE_ORDER[currentIndex + 1]!
      : null;
  const prevStage: ApplicationStage | null =
    currentIndex > 0 ? STAGE_ORDER[currentIndex - 1]! : null;

  const actor = fullName ?? 'Rates Clerk';
  const applicant = DEMO_USERS.find((u) => u.id === app.ownerId);

  const advance = () => {
    if (!nextStage) return;
    setStage(app.id, nextStage, actor);
    toast({
      title: `Advanced to ${STAGE_LABEL[nextStage]}`,
      description: `${app.reference} — ${applicant?.fullName ?? 'applicant'} notified.`,
      tone: 'success',
    });
  };

  const rewind = () => {
    if (!prevStage) return;
    setStage(app.id, prevStage, actor);
    toast({
      title: `Rewound to ${STAGE_LABEL[prevStage]}`,
      description: `${app.reference}`,
      tone: 'info',
    });
  };

  const reject = () => {
    setStage(app.id, 'rejected', actor);
    toast({
      title: 'Application rejected',
      description: `${app.reference} — applicant notified with next-step guidance.`,
      tone: 'danger',
    });
  };

  const schedule = () => {
    if (!inspectionDate) {
      toast({ title: 'Pick a date first.', tone: 'danger' });
      return;
    }
    if (app.stage !== 'inspection-scheduled') {
      setStage(app.id, 'inspection-scheduled', actor);
    }
    toast({
      title: 'Inspection scheduled',
      description: `${app.reference} — ${new Date(inspectionDate).toLocaleDateString('en-ZW', { day: '2-digit', month: 'short', year: 'numeric' })} with ${assignedOfficer.split(' · ')[0]}.`,
      tone: 'success',
    });
    setInspectionDate('');
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    setNotes((n) => [
      { by: actor, at: new Date().toISOString(), body: noteText.trim() },
      ...n,
    ]);
    setNoteText('');
    toast({ title: 'Internal note saved.', tone: 'success' });
  };

  const isRejected = app.stage === 'rejected';
  const isIssued = app.stage === 'issued';

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <Link
          href="/erp/applications"
          className="mb-4 inline-flex items-center gap-1.5 text-small font-medium text-muted hover:text-brand-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to kanban
        </Link>
      </ScrollReveal>

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
                Applicant{' '}
                {applicant ? (
                  <Link
                    href={`/erp/residents/${applicant.id}`}
                    className="font-medium text-brand-primary hover:underline"
                  >
                    {applicant.fullName}
                  </Link>
                ) : (
                  app.ownerId
                )}{' '}
                · submitted {formatDate(app.submittedAt)}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge
                  tone={
                    isRejected
                      ? 'danger'
                      : isIssued || app.stage === 'approved'
                        ? 'success'
                        : 'warning'
                  }
                >
                  {STAGE_LABEL[app.stage]}
                </Badge>
                {app.feePaid ? (
                  <Badge tone="success">Fee paid · ${app.feeUsd.toFixed(2)}</Badge>
                ) : (
                  <Badge tone="warning">Fee pending · ${app.feeUsd.toFixed(2)}</Badge>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={rewind}
                disabled={!prevStage || isRejected}
                leadingIcon={<Rewind className="h-3.5 w-3.5" />}
              >
                Rewind
              </Button>
              <Button
                size="sm"
                onClick={advance}
                disabled={!nextStage || isRejected}
                leadingIcon={<FastForward className="h-3.5 w-3.5" />}
              >
                {nextStage ? `Advance to ${STAGE_LABEL[nextStage]}` : 'Fully issued'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={reject}
                disabled={isRejected || isIssued}
                leadingIcon={<X className="h-3.5 w-3.5" />}
              >
                Reject
              </Button>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* Timeline + supporting docs + notes */}
        <div className="flex flex-col gap-4">
          <ScrollReveal>
            <Card className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted" />
                <h2 className="text-h3 text-ink">Progress</h2>
              </div>
              {isRejected ? (
                <div className="flex items-start gap-3 rounded-md border border-danger/20 bg-danger/5 p-4 text-small text-danger">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Application rejected. Applicant notified with next-step guidance.</p>
                </div>
              ) : (
                <StatusTimeline stages={stages} currentIndex={currentIndex === -1 ? 0 : currentIndex} />
              )}
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={60}>
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted" />
                <h2 className="text-h3 text-ink">Supporting documents</h2>
              </div>
              <p className="text-small text-muted">
                Uploaded by the applicant during submission. Demo documents — click to preview would open a
                read-only viewer in production.
              </p>
              <ul className="mt-3 grid gap-2">
                {['National ID — applicant', 'Lease agreement', 'Tax clearance'].map((d) => (
                  <li
                    key={d}
                    className="flex items-center gap-3 rounded-md border border-line bg-surface/50 px-3 py-2.5"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-primary/10 text-brand-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="flex-1 text-small">
                      <div className="font-medium text-ink">{d}</div>
                      <div className="text-micro text-muted">PDF · Uploaded on submission</div>
                    </div>
                    <Badge tone="success" dot>
                      Verified
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted" />
                <h2 className="text-h3 text-ink">Internal notes</h2>
              </div>
              <div className="mb-3">
                <Label htmlFor="note" className="sr-only">
                  Add note
                </Label>
                <textarea
                  id="note"
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Notes here are visible to staff only."
                  className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-small text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={addNote} disabled={!noteText.trim()}>
                    Add note
                  </Button>
                </div>
              </div>
              {notes.length === 0 ? (
                <p className="text-micro text-muted">
                  No staff notes yet. Notes are internal and not visible to the applicant.
                </p>
              ) : (
                <ul className="grid gap-2">
                  {notes.map((n, i) => (
                    <li key={i} className="rounded-md border border-line bg-surface/50 p-3">
                      <div className="flex items-center justify-between text-micro text-muted">
                        <span className="font-semibold text-ink">{n.by}</span>
                        <time>{formatRelative(n.at)}</time>
                      </div>
                      <p className="mt-1 text-small text-ink">{n.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </ScrollReveal>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-4">
          <ScrollReveal delay={60}>
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted" />
                <h2 className="text-h3 text-ink">Inspection</h2>
              </div>
              <div className="grid gap-3">
                <div>
                  <Label>Assigned officer</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {OFFICERS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setAssignedOfficer(o)}
                        className={cn(
                          'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                          assignedOfficer === o
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-line bg-card text-ink hover:border-brand-primary/30',
                        )}
                      >
                        {o.split(' · ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="inspectionDate">Inspection date</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                  />
                </div>
                <Button onClick={schedule} leadingIcon={<CalendarClock className="h-4 w-4" />}>
                  Schedule inspection
                </Button>
                <p className="text-micro text-muted">
                  Scheduling automatically moves the application to "Inspection scheduled" and notifies the
                  applicant.
                </p>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Card className="p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <User2 className="h-4 w-4 text-muted" />
                <h2 className="text-h3 text-ink">Applicant</h2>
              </div>
              {applicant ? (
                <dl className="space-y-2 text-small">
                  <Row label="Name" value={applicant.fullName} />
                  <Row label="Email" value={applicant.email} />
                  <Row label="Phone" value={applicant.phone} />
                  <Row label="Role" value={applicant.role} />
                </dl>
              ) : (
                <p className="text-small text-muted">Applicant details are on their resident profile.</p>
              )}
              {applicant && (
                <div className="mt-4">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/erp/residents/${applicant.id}`}>Open 360 view</Link>
                  </Button>
                </div>
              )}
            </Card>
          </ScrollReveal>

          {isIssued && (
            <ScrollReveal delay={180}>
              <Card className="p-5 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <FileBadge2 className="h-4 w-4 text-muted" />
                  <h2 className="text-h3 text-ink">Certificate</h2>
                </div>
                <div className="flex items-start gap-2 rounded-md border border-success/20 bg-success/5 p-3 text-small text-success">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Certificate issued. The applicant can download it from their portal — it carries a
                    QR-verifiable signature.
                  </span>
                </div>
              </Card>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] truncate-line text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
