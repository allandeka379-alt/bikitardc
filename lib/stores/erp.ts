'use client';

// ─────────────────────────────────────────────
// ERP runtime store
//
// Holds the staff-side mutations made during a
// demo: verification decisions, matched payment
// pairs, kanban movement, request assignments /
// status changes, and the ever-growing audit log.
//
// Persisted so a reviewer can close the browser,
// reopen, and still see their actions reflected.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APPLICATIONS, type ApplicationStage } from '@/mocks/fixtures/applications';
import { AUDIT_SEED, type AuditActionKind, type AuditEntry } from '@/mocks/fixtures/audit-log';
import {
  SERVICE_REQUESTS,
  STATUS_LABEL,
  type RequestStatus,
  type ServiceRequest,
} from '@/mocks/fixtures/service-requests';
import { DEMO_USERS } from '@/mocks/fixtures/users';
import type { Verification, VerificationStatus } from '@/mocks/fixtures/verifications';
import { useApplicationStore } from './application';
import { useNotificationsStore } from './notifications';

// Look up a demo user id by the resident's full name.
// Used so staff-side mutations can fire notifications
// to the affected citizen.
function userIdByName(name: string): string | undefined {
  return DEMO_USERS.find((u) => u.fullName === name)?.id;
}

export interface MatchedPair {
  id: string;
  ourTxId: string;
  ecocashRowId: string;
  matchedAt: string;
  matchedBy: string;
}

interface ErpState {
  verificationStatus: Record<string, VerificationStatus>;
  runtimeVerifications: Verification[];
  matchedPairs: MatchedPair[];
  requestAssignments: Record<string, string>;
  requestStatus: Record<string, RequestStatus>;
  applicationStage: Record<string, ApplicationStage>;
  runtimeRequests: ServiceRequest[];
  audit: AuditEntry[];

  approveVerification: (id: string, actorName: string, subject: string) => void;
  rejectVerification: (id: string, actorName: string, subject: string) => void;
  submitVerification: (v: Verification) => void;
  matchPayment: (ourTxId: string, ecocashRowId: string, actorName: string) => void;
  unmatchPayment: (ourTxId: string) => void;
  setRequestStatus: (id: string, status: RequestStatus, actorName: string) => void;
  setRequestAssignment: (id: string, team: string, actorName: string) => void;
  setApplicationStage: (id: string, stage: ApplicationStage, actorName: string) => void;
  submitServiceRequest: (req: ServiceRequest) => void;
  addAudit: (entry: Omit<AuditEntry, 'id' | 'at'>) => void;
  reset: () => void;
}

function uid() {
  return `al_${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

export const useErpStore = create<ErpState>()(
  persist(
    (set, get) => ({
      verificationStatus: {},
      runtimeVerifications: [],
      matchedPairs: [],
      requestAssignments: {},
      requestStatus: {},
      applicationStage: {},
      runtimeRequests: [],
      audit: AUDIT_SEED,

      addAudit: (entry) =>
        set({ audit: [{ id: uid(), at: now(), ...entry }, ...get().audit] }),

      approveVerification: (id, actorName, subject) =>
        set({
          verificationStatus: { ...get().verificationStatus, [id]: 'approved' },
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: 'verification-approved' as AuditActionKind,
              subject,
            },
            ...get().audit,
          ],
        }),

      rejectVerification: (id, actorName, subject) =>
        set({
          verificationStatus: { ...get().verificationStatus, [id]: 'rejected' },
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: 'verification-rejected',
              subject,
            },
            ...get().audit,
          ],
        }),

      submitVerification: (v) => {
        if (get().runtimeVerifications.some((x) => x.id === v.id)) return;
        set({
          runtimeVerifications: [v, ...get().runtimeVerifications],
          audit: [
            {
              id: uid(),
              at: now(),
              actorName: v.applicantName,
              actorRole: 'Resident',
              action: 'request-assigned',
              subject: `${v.reference} property-link requested`,
              note: v.relationship,
            },
            ...get().audit,
          ],
        });
        useNotificationsStore.getState().push({
          ownerId: v.applicantId,
          event: 'application-stage',
          tone: 'info',
          title: `Verification ${v.reference} submitted`,
          body: 'A rates clerk will review within 48 working hours.',
          href: '/portal/properties',
          channels: ['app', 'sms'],
        });
      },

      matchPayment: (ourTxId, ecocashRowId, actorName) =>
        set({
          matchedPairs: [
            ...get().matchedPairs,
            { id: uid(), ourTxId, ecocashRowId, matchedAt: now(), matchedBy: actorName },
          ],
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: 'payment-matched',
              subject: `${ourTxId} ↔ ${ecocashRowId}`,
            },
            ...get().audit,
          ],
        }),

      unmatchPayment: (ourTxId) =>
        set({ matchedPairs: get().matchedPairs.filter((p) => p.ourTxId !== ourTxId) }),

      setRequestStatus: (id, status, actorName) => {
        set({
          requestStatus: { ...get().requestStatus, [id]: status },
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: status === 'resolved' ? 'request-resolved' : 'request-assigned',
              subject: `${id} → ${status}`,
            },
            ...get().audit,
          ],
        });

        // Notify the reporter
        const req =
          get().runtimeRequests.find((r) => r.id === id) ??
          SERVICE_REQUESTS.find((r) => r.id === id);
        if (!req) return;
        const ownerId = userIdByName(req.reporterName);
        if (!ownerId) return;
        useNotificationsStore.getState().push({
          ownerId,
          event: 'request-update',
          tone: status === 'resolved' ? 'success' : 'info',
          title: `Your report is now ${STATUS_LABEL[status].toLowerCase()}`,
          body: `${req.reference} — ${req.title}`,
          href: '/portal/requests',
          channels: ['app', 'sms', 'whatsapp'],
        });
      },

      setRequestAssignment: (id, team, actorName) =>
        set({
          requestAssignments: { ...get().requestAssignments, [id]: team },
          // If unassigned was open, bump to assigned
          requestStatus: {
            ...get().requestStatus,
            [id]: get().requestStatus[id] === 'resolved' ? 'resolved' : 'assigned',
          },
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: 'request-assigned',
              subject: `${id} → ${team}`,
            },
            ...get().audit,
          ],
        }),

      setApplicationStage: (id, stage, actorName) => {
        set({
          applicationStage: { ...get().applicationStage, [id]: stage },
          audit: [
            {
              id: uid(),
              at: now(),
              actorName,
              actorRole: 'Rates Clerk',
              action: 'application-advanced',
              subject: `${id} → ${stage}`,
            },
            ...get().audit,
          ],
        });

        // Look up the application (either runtime or fixture)
        const app =
          useApplicationStore.getState().runtimeApps.find((a) => a.id === id) ??
          APPLICATIONS.find((a) => a.id === id);
        if (!app) return;
        const friendly = stage.replace('-', ' ');
        useNotificationsStore.getState().push({
          ownerId: app.ownerId,
          event: 'application-stage',
          tone: stage === 'approved' || stage === 'issued' ? 'success' : stage === 'rejected' ? 'danger' : 'info',
          title: `Application ${app.reference} is now ${friendly}`,
          body: `${app.title} — advanced by ${actorName}`,
          href: `/portal/applications/${app.reference}`,
          channels: ['app', 'sms', 'whatsapp'],
        });
      },

      submitServiceRequest: (req) => {
        if (get().runtimeRequests.some((r) => r.id === req.id)) return;
        set({
          runtimeRequests: [req, ...get().runtimeRequests],
          audit: [
            {
              id: uid(),
              at: now(),
              actorName: req.reporterName,
              actorRole: 'Resident',
              action: 'request-assigned',
              subject: `${req.reference} submitted`,
              note: req.title,
            },
            ...get().audit,
          ],
        });

        const ownerId = userIdByName(req.reporterName);
        if (!ownerId) return;
        useNotificationsStore.getState().push({
          ownerId,
          event: 'request-update',
          tone: 'info',
          title: `Ticket ${req.reference} created`,
          body: `Routed to ${req.assignedTeam ?? 'the relevant team'} with ${req.slaHours}h SLA.`,
          href: '/portal/requests',
          channels: ['app', 'sms'],
        });
      },

      reset: () =>
        set({
          verificationStatus: {},
          runtimeVerifications: [],
          matchedPairs: [],
          requestAssignments: {},
          requestStatus: {},
          applicationStage: {},
          runtimeRequests: [],
          audit: AUDIT_SEED,
        }),
    }),
    { name: 'bikita-erp' },
  ),
);
