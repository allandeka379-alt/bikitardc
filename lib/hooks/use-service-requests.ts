'use client';

// Unifies the static SERVICE_REQUESTS fixture with
// runtime citizen-submitted reports and the ERP
// store's status/assignment overrides.
// All ERP and citizen views that list requests
// should read through here.

import { useMemo } from 'react';
import { useErpStore } from '@/lib/stores/erp';
import {
  SERVICE_REQUESTS,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';

export function useAllServiceRequests(): ServiceRequest[] {
  const runtime = useErpStore((s) => s.runtimeRequests);
  const statusOverrides = useErpStore((s) => s.requestStatus);
  const assignments = useErpStore((s) => s.requestAssignments);

  return useMemo(() => {
    const merged: ServiceRequest[] = [...runtime, ...SERVICE_REQUESTS];
    return merged.map((r) => ({
      ...r,
      status: (statusOverrides[r.id] ?? r.status) as RequestStatus,
      assignedTeam: assignments[r.id] ?? r.assignedTeam,
    }));
  }, [runtime, statusOverrides, assignments]);
}

export function useServiceRequestsForReporter(name: string | null): ServiceRequest[] {
  const all = useAllServiceRequests();
  if (!name) return [];
  return all.filter((r) => r.reporterName === name);
}

/** Auto-route category → default team, spec §3.1. */
export function teamForCategory(category: ServiceRequest['category']): string {
  switch (category) {
    case 'water':             return 'Water & Sanitation';
    case 'road':              return 'Roads';
    case 'refuse':            return 'Refuse';
    case 'drainage':          return 'Water & Sanitation';
    case 'illegal-structure': return 'Urban Planning';
    case 'streetlight':       return 'Electrical';
    case 'health':            return 'Public Health';
  }
}
