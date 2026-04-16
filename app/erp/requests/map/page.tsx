'use client';

// ─────────────────────────────────────────────
// Service requests map — Journey D.
// Leaflet map with 25 colour-coded markers; click
// a marker to open the detail panel.
// The map is dynamically loaded (SSR-unsafe).
// ─────────────────────────────────────────────

import { List, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { ServiceRequestPanel } from '@/components/erp/service-request-panel';
import { MapLegend } from '@/components/erp/map-legend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAllServiceRequests } from '@/lib/hooks/use-service-requests';
import type { ServiceRequest } from '@/mocks/fixtures/service-requests';

const ServiceRequestMap = dynamic(() => import('@/components/erp/service-request-map'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[560px] w-full place-items-center rounded-lg border border-line bg-surface">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-brand-primary" />
    </div>
  ),
});

export default function RequestsMapPage() {
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const all = useAllServiceRequests();
  const openCount = all.filter((r) => r.status !== 'resolved').length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1 text-ink">Service requests</h1>
          <p className="mt-1 text-small text-muted">
            {all.length} total · {openCount} open across Bikita RDC.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary" size="sm" leadingIcon={<List className="h-3.5 w-3.5" />}>
            <Link href="/erp/requests">List view</Link>
          </Button>
          <Button size="sm" leadingIcon={<MapIcon className="h-3.5 w-3.5" />}>
            Map view
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="relative h-[calc(100dvh-220px)] min-h-[520px] w-full">
          <ServiceRequestMap onSelect={setSelected} selectedId={selected?.id} />

          {/* Legend overlay */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-[400]">
            <div className="pointer-events-auto">
              <MapLegend />
            </div>
          </div>

          {/* Counter chip */}
          <div className="pointer-events-none absolute right-4 top-4 z-[400]">
            <Badge tone="brand" className="text-small shadow-card-md">
              {all.length} markers
            </Badge>
          </div>
        </div>
      </Card>

      <ServiceRequestPanel request={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
