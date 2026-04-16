'use client';

// Side panel used by both the map and list views
// to show one service-request's full detail and
// let the clerk assign a team or change status.

import * as Dialog from '@radix-ui/react-dialog';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Share2,
  Timer,
  User2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useErpStore } from '@/lib/stores/erp';
import { formatRelative } from '@/lib/format';
import {
  CATEGORY_LABEL,
  slaHealth,
  STATUS_LABEL,
  TEAM_LIST,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { cn } from '@/lib/cn';

interface Props {
  request: ServiceRequest | null;
  onClose: () => void;
}

const STATUS_TONE: Record<RequestStatus, 'danger' | 'warning' | 'info' | 'success' | 'gold'> = {
  open: 'danger',
  assigned: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  reopened: 'gold',
};

const SLA_TONE = {
  'on-track': 'success',
  'at-risk':  'warning',
  breached:   'danger',
} as const;

export function ServiceRequestPanel({ request, onClose }: Props) {
  const open = !!request;
  const { fullName } = useCurrentUser();
  const assignments = useErpStore((s) => s.requestAssignments);
  const requestStatus = useErpStore((s) => s.requestStatus);
  const setRequestAssignment = useErpStore((s) => s.setRequestAssignment);
  const setRequestStatus = useErpStore((s) => s.setRequestStatus);

  const currentStatus = request
    ? ((requestStatus[request.id] ?? request.status) as RequestStatus)
    : 'open';
  const currentTeam = request ? (assignments[request.id] ?? request.assignedTeam) : undefined;
  const health = request ? slaHealth(request) : 'on-track';
  const actor = fullName ?? 'Rates Clerk';

  const assign = (team: string) => {
    if (!request) return;
    setRequestAssignment(request.id, team, actor);
    toast({
      title: 'Assigned',
      description: `${request.reference} → ${team}`,
      tone: 'success',
    });
  };

  const transition = (next: RequestStatus) => {
    if (!request) return;
    setRequestStatus(request.id, next, actor);
    toast({
      title: `Status: ${STATUS_LABEL[next]}`,
      description: `${request.reference}`,
      tone: next === 'resolved' ? 'success' : 'info',
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[58] bg-ink/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[60] flex h-dvh w-full max-w-[480px] flex-col bg-card shadow-card-lg data-[state=open]:animate-in data-[state=open]:slide-in-from-right-6">
          {request && (
          <>
          <div className="flex items-start justify-between border-b border-line px-5 py-4">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge tone={STATUS_TONE[currentStatus]}>{STATUS_LABEL[currentStatus]}</Badge>
                <Badge tone={SLA_TONE[health]}>
                  <Timer className="h-3 w-3" />
                  {health.replace('-', ' ')}
                </Badge>
                <span className="text-micro text-muted">· {request.reference}</span>
              </div>
              <Dialog.Title className="text-h3 text-ink">{request.title}</Dialog.Title>
              <Dialog.Description className="mt-0.5 text-small text-muted">
                {CATEGORY_LABEL[request.category]} · {request.ward} ward
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
            {request.photoUrl && (
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-md border border-line bg-surface">
                <Image
                  src={request.photoUrl}
                  alt=""
                  fill
                  sizes="(max-width: 500px) 100vw, 480px"
                  className="object-cover"
                />
              </div>
            )}

            <Section label="Description">
              <p className="text-small text-ink">{request.description}</p>
            </Section>

            <Section label="Reporter">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-small text-ink">
                  <User2 className="h-3.5 w-3.5 text-muted" aria-hidden />
                  {request.reporterName}
                </div>
                <div className="flex items-center gap-2 text-small text-muted">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {request.reporterPhone}
                </div>
                <div className="flex items-center gap-2 text-small text-muted">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {request.lat.toFixed(4)}, {request.lng.toFixed(4)}
                </div>
              </div>
            </Section>

            <Section label="Priority & SLA">
              <div className="flex flex-wrap gap-2">
                <Badge tone={request.priority === 'critical' ? 'danger' : request.priority === 'high' ? 'warning' : 'neutral'}>
                  {request.priority.toUpperCase()}
                </Badge>
                <Badge tone="neutral">SLA {request.slaHours}h</Badge>
                <Badge tone="neutral">Reported {formatRelative(request.createdAt)}</Badge>
              </div>
            </Section>

            <Section label="Assigned team">
              <div className="flex flex-wrap gap-1.5">
                {TEAM_LIST.map((team) => (
                  <button
                    key={team}
                    type="button"
                    onClick={() => assign(team)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                      currentTeam === team
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-line bg-card text-ink hover:border-brand-primary/30',
                    )}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </Section>

            {request.satisfaction && (
              <Section label="Resident satisfaction">
                <div className="flex items-center gap-1 text-brand-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < request.satisfaction! ? 'text-brand-accent' : 'text-muted/50'}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-micro text-muted">
                    {request.satisfaction} / 5
                  </span>
                </div>
              </Section>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-4">
            <Button variant="ghost" size="sm" leadingIcon={<Share2 className="h-3.5 w-3.5" />}>
              Share
            </Button>
            <div className="flex gap-2">
              {currentStatus !== 'in-progress' && currentStatus !== 'resolved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => transition('in-progress')}
                >
                  Mark in-progress
                </Button>
              )}
              {currentStatus !== 'resolved' && (
                <Button
                  size="sm"
                  onClick={() => transition('resolved')}
                  leadingIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Resolve
                </Button>
              )}
              {currentStatus === 'resolved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => transition('reopened')}
                >
                  Re-open
                </Button>
              )}
            </div>
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
