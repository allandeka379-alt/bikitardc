'use client';

// Service requests list view. Complements the map
// view at /erp/requests/map — same detail side
// panel, same mutation actions.

import { Filter, List, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ServiceRequestPanel } from '@/components/erp/service-request-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatRelative } from '@/lib/format';
import { useAllServiceRequests } from '@/lib/hooks/use-service-requests';
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  slaHealth,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { cn } from '@/lib/cn';

const STATUS_FILTERS: (RequestStatus | 'all')[] = ['all', 'open', 'assigned', 'in-progress', 'resolved', 'reopened'];

const STATUS_TONE: Record<RequestStatus, 'danger' | 'warning' | 'info' | 'success' | 'gold'> = {
  open: 'danger',
  assigned: 'warning',
  'in-progress': 'info',
  resolved: 'success',
  reopened: 'gold',
};

export default function RequestsListPage() {
  const sp = useSearchParams();
  const initialId = sp.get('id');
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const all = useAllServiceRequests();

  useEffect(() => {
    if (initialId) {
      const r = all.find((x) => x.id === initialId);
      if (r) setSelected(r);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  const rows = useMemo(() => {
    return all
      .map((r) => ({ ...r, effectiveStatus: r.status }))
      .filter((r) => {
        if (status !== 'all' && r.effectiveStatus !== status) return false;
        if (query && ![r.title, r.reference, r.ward].some((f) => f.toLowerCase().includes(query.toLowerCase()))) return false;
        return true;
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [query, status, all]);

  const breached = all.filter((r) => slaHealth(r) === 'breached' && r.status !== 'resolved');

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink">Service requests</h1>
          <p className="mt-1 text-small text-muted">
            {all.length} total · {breached.length} breached SLA
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" leadingIcon={<List className="h-3.5 w-3.5" />}>
            List view
          </Button>
          <Button asChild variant="secondary" size="sm" leadingIcon={<MapIcon className="h-3.5 w-3.5" />}>
            <Link href="/erp/requests/map">Map view</Link>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          <div className="relative max-w-sm flex-1">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search title, reference, ward…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-full border px-3 py-1 text-micro font-medium transition-colors',
                  status === s
                    ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                    : 'border-line bg-card text-ink hover:border-brand-primary/30',
                )}
              >
                {s === 'all' ? 'All' : STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-small">
            <thead>
              <tr className="border-b border-line bg-surface/60 text-micro font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Request</th>
                <th className="px-5 py-3 text-left">Ward</th>
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">SLA</th>
                <th className="px-5 py-3 text-left">Age</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const health = slaHealth(r);
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={cn(
                      'group cursor-pointer border-b border-line last:border-b-0 hover:bg-surface/60',
                      health === 'breached' && 'bg-danger/[0.02]',
                    )}
                  >
                    <td className="px-5 py-3">
                      <div className="font-mono text-[10px] text-muted">{r.reference}</div>
                      <div className="text-small font-medium text-ink">{r.title}</div>
                      <div className="text-micro text-muted">{CATEGORY_LABEL[r.category]}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{r.ward}</td>
                    <td className="px-5 py-3">
                      <Badge tone={r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : 'neutral'}>
                        {r.priority.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[r.effectiveStatus]}>
                        {STATUS_LABEL[r.effectiveStatus]}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={health === 'breached' ? 'danger' : health === 'at-risk' ? 'warning' : 'success'}>
                        {health.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">{formatRelative(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ServiceRequestPanel request={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
