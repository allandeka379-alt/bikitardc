'use client';

// ─────────────────────────────────────────────
// Citizen-side Data Protection Act rights page
// (spec §3.3). Submit access / correction /
// deletion / objection requests; see the history
// of your own.
// ─────────────────────────────────────────────

import {
  Database,
  Download,
  Edit3,
  FileText,
  Send,
  Shield,
  Slash,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import {
  DPA_DESCRIPTION,
  DPA_LABEL,
  useDpaForOwner,
  useDpaStore,
  type DpaRightKind,
  type DpaStatus,
} from '@/lib/stores/dpa';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import { formatDate, formatRelative } from '@/lib/format';
import { cn } from '@/lib/cn';

const KIND_META: Record<DpaRightKind, { Icon: LucideIcon; tint: string }> = {
  access:     { Icon: Download, tint: 'bg-brand-primary/10 text-brand-primary' },
  correction: { Icon: Edit3,    tint: 'bg-info/10 text-info' },
  deletion:   { Icon: Trash2,   tint: 'bg-danger/10 text-danger' },
  objection:  { Icon: Slash,    tint: 'bg-warning/10 text-warning' },
};

const STATUS_TONE: Record<DpaStatus, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  'in-progress': 'info',
  fulfilled: 'success',
  rejected: 'danger',
};

export default function DataRightsPage() {
  const { hydrated, userId, fullName, email } = useCurrentUser();
  const mine = useDpaForOwner(userId);
  const submit = useDpaStore((s) => s.submit);

  const [kind, setKind] = useState<DpaRightKind>('access');
  const [scope, setScope] = useState('All fields the council holds about me');
  const [reason, setReason] = useState('');

  if (!hydrated) return null;
  const me = DEMO_USERS.find((u) => u.id === userId);

  const send = () => {
    if (!userId) return;
    if (!scope.trim() || !reason.trim()) {
      return toast({ title: 'Scope and reason are required.', tone: 'danger' });
    }
    const r = submit({
      kind,
      applicantId: userId,
      applicantName: fullName ?? 'Resident',
      applicantEmail: email ?? me?.email ?? 'noreply@demo.bikita',
      scope: scope.trim(),
      reason: reason.trim(),
    });
    toast({
      title: `Request ${r.reference} lodged`,
      description: `Statutory response by ${formatDate(r.dueBy)}.`,
      tone: 'success',
    });
    setScope('All fields the council holds about me');
    setReason('');
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6">
          <h1 className="text-h1 text-ink">Data Protection rights</h1>
          <p className="mt-1 text-small text-muted">
            Exercise your rights under the Zimbabwe Data Protection Act. The council will respond
            within 30 calendar days.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="text-h3 text-ink">Lodge a request</h2>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {(Object.keys(DPA_LABEL) as DpaRightKind[]).map((k) => {
              const meta = KIND_META[k];
              const active = kind === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={cn(
                    'flex items-start gap-3 rounded-md border px-3 py-3 text-left transition-all',
                    active
                      ? 'border-brand-primary bg-brand-primary/5 shadow-ring-brand'
                      : 'border-line bg-card hover:border-brand-primary/25',
                  )}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-md ${meta.tint}`}>
                    <meta.Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-small font-semibold text-ink">{DPA_LABEL[k]}</div>
                    <div className="text-micro text-muted">{DPA_DESCRIPTION[k]}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4">
            <div>
              <Label htmlFor="dpa-scope">Scope</Label>
              <Input
                id="dpa-scope"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Statements between Jan–Apr 2026, or phone number only"
              />
            </div>
            <div>
              <Label htmlFor="dpa-reason">Reason</Label>
              <textarea
                id="dpa-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="A short explanation helps us process quickly. Required by law in some cases."
                className="block w-full rounded-sm border border-line bg-card px-3.5 py-2.5 text-body text-ink placeholder:text-muted/70 focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
              />
            </div>
            <Button onClick={send} leadingIcon={<Send className="h-4 w-4" />}>
              Submit request
            </Button>
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-md border border-info/20 bg-info/8 p-3 text-small text-info">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              The Data Protection Officer reviews every request. For deletion we keep statutory records
              (e.g. rates history) for 7 years as required by law; we'll tell you exactly what stays.
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted" />
              <h3 className="text-small font-semibold text-ink">My requests</h3>
            </div>
            <Badge tone="brand">{mine.length}</Badge>
          </div>
          {mine.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState icon={<Database className="h-8 w-8" />} title="No requests on file." />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {mine.map((r) => (
                <li key={r.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                        <span className="font-mono text-[10px] text-muted">{r.reference}</span>
                      </div>
                      <div className="mt-1 text-small font-semibold text-ink">{DPA_LABEL[r.kind]}</div>
                      <div className="text-micro text-muted">
                        Submitted {formatRelative(r.submittedAt)} · due by {formatDate(r.dueBy)}
                      </div>
                      {r.staffNote && (
                        <p className="mt-1 rounded-sm bg-surface/60 px-2.5 py-1.5 text-micro text-ink">
                          {r.staffNote}
                        </p>
                      )}
                    </div>
                    {r.status === 'fulfilled' && r.artifactLabel && (
                      <Button size="sm" variant="secondary" leadingIcon={<Download className="h-3.5 w-3.5" />}>
                        {r.artifactLabel.split('-').slice(-1)[0]?.split('.')[0] ?? 'Download'}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
