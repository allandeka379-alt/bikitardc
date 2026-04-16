'use client';

// Citizen-side service requests list.
// Replaces the milestone-2 stub with a real list
// of the current user's reports, each opening the
// shared detail panel on tap.

import { Megaphone, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useServiceRequestsForReporter } from '@/lib/hooks/use-service-requests';
import { formatRelative } from '@/lib/format';
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  slaHealth,
  STATUS_LABEL,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { ServiceRequestPanel } from '@/components/erp/service-request-panel';

const STATUS_TONE: Record<RequestStatus, 'danger' | 'warning' | 'info' | 'success' | 'gold'> = {
  open: 'danger',
  assigned: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  reopened: 'gold',
};

export default function MyRequestsPage() {
  const { hydrated, fullName } = useCurrentUser();
  const mine = useServiceRequestsForReporter(fullName);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">My service requests</h1>
            <p className="mt-1 text-small text-muted">
              Issues you've reported. We'll text you when a team is assigned or the ticket resolves.
            </p>
          </div>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link href="/portal/report">Report a new issue</Link>
          </Button>
        </div>
      </ScrollReveal>

      {mine.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-8 w-8" />}
          title="You haven't reported any issues."
          description="Report a broken borehole, pothole, refuse collection or any other concern — we route it to the right team."
          action={
            <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
              <Link href="/portal/report">Report an issue</Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {mine.map((r, i) => {
            const health = slaHealth(r);
            return (
              <li key={r.id}>
                <ScrollReveal delay={i * 50}>
                  <Card
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelected(r);
                      }
                    }}
                    className="group cursor-pointer p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/25 hover:shadow-card-md"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLOR[r.category] }}
                        aria-hidden
                      />
                      <span className="text-micro font-semibold uppercase tracking-wide text-muted">
                        {CATEGORY_LABEL[r.category]}
                      </span>
                      <span className="text-micro text-muted">· {r.reference}</span>
                    </div>
                    <h3 className="text-body font-semibold text-ink">{r.title}</h3>
                    <p className="mt-1 line-clamp-2 text-small text-muted">{r.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                        <Badge
                          tone={
                            health === 'breached'
                              ? 'danger'
                              : health === 'at-risk'
                                ? 'warning'
                                : 'success'
                          }
                        >
                          SLA {health.replace('-', ' ')}
                        </Badge>
                        {r.assignedTeam && <Badge tone="neutral">{r.assignedTeam}</Badge>}
                      </div>
                      <time className="text-micro text-muted">{formatRelative(r.createdAt)}</time>
                    </div>
                  </Card>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      )}

      <ServiceRequestPanel request={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
