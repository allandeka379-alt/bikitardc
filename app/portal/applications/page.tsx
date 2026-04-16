'use client';

import { FileBadge2, Plus } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/lib/hooks/use-current-user';
import { useApplicationsForOwner } from '@/lib/stores/application';
import { formatDate } from '@/lib/format';
import { APPLICATION_TYPE_LABEL } from '@/mocks/fixtures/applications';

export default function ApplicationsPage() {
  const { hydrated, userId } = useCurrentUser();
  const apps = useApplicationsForOwner(userId);
  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <ScrollReveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-h1 text-ink">Applications</h1>
            <p className="mt-1 text-small text-muted">
              Licences, permits and clearances you've requested.
            </p>
          </div>
          <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
            <Link href="/portal/apply">New application</Link>
          </Button>
        </div>
      </ScrollReveal>

      {apps.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<FileBadge2 className="h-8 w-8" />}
          title="No applications yet."
          description="Start an application to receive a licence, permit or clearance."
          action={
            <Button asChild leadingIcon={<Plus className="h-4 w-4" />}>
              <Link href="/portal/apply">Start an application</Link>
            </Button>
          }
        />
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {apps.map((app) => (
            <li key={app.id}>
              <Link href={`/portal/applications/${app.reference}`}>
                <Card className="p-5 transition-all duration-base ease-out-expo hover:-translate-y-0.5 hover:border-brand-primary/20 hover:shadow-card-sm">
                  <div className="mb-1 text-micro text-muted">
                    {APPLICATION_TYPE_LABEL[app.type]} · {app.reference}
                  </div>
                  <div className="text-body font-semibold text-ink">{app.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-micro text-muted">
                      Submitted {formatDate(app.submittedAt)}
                    </span>
                    <Badge
                      tone={
                        app.stage === 'approved' || app.stage === 'issued'
                          ? 'success'
                          : app.stage === 'rejected'
                            ? 'danger'
                            : 'warning'
                      }
                    >
                      {app.stage.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
