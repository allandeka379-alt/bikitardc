// ─────────────────────────────────────────────
// Payroll runs (monthly) + per-employee payroll
// lines with PAYE, NSSA and NEC deductions.
//
// Tax tables are the simplified PAYE bands for
// USD earners (ZIMRA 2026):
//   0 – 100      USD: 0%
//   100.01 – 300 USD: 20%
//   300.01 – 1000 USD: 25%
//   1000.01 – 2000 USD: 30%
//   2000.01+           : 35%
//
// NSSA employee contribution = 4.5% on first 700
// NEC levy for local authorities = 1% of basic
// ─────────────────────────────────────────────

import { EMPLOYEES, type Employee } from './employees';

export type PayrollRunStatus = 'draft' | 'approved' | 'paid';

export interface PayrollRun {
  id: string;
  period: string;           // e.g. "2026-04"
  status: PayrollRunStatus;
  createdAt: string;
  createdBy: string;
  approvedAt: string | null;
  approvedBy: string | null;
  paidAt: string | null;
  employeeCount: number;
  grossUsd: number;
  netUsd: number;
  payeUsd: number;
  nssaUsd: number;
  necUsd: number;
}

export interface PayrollLine {
  id: string;
  runId: string;
  employeeId: string;
  basicUsd: number;
  allowanceUsd: number;
  grossUsd: number;
  payeUsd: number;
  nssaUsd: number;
  necUsd: number;
  otherDeductionsUsd: number;
  netUsd: number;
}

function payeFor(gross: number): number {
  let tax = 0;
  if (gross <= 100) return 0;
  const band1 = Math.min(gross, 300) - 100; if (band1 > 0) tax += band1 * 0.20;
  const band2 = Math.min(gross, 1000) - 300; if (band2 > 0) tax += band2 * 0.25;
  const band3 = Math.min(gross, 2000) - 1000; if (band3 > 0) tax += band3 * 0.30;
  const band4 = gross - 2000; if (band4 > 0) tax += band4 * 0.35;
  return Math.round(tax * 100) / 100;
}

function nssaFor(gross: number): number {
  return Math.round(Math.min(gross, 700) * 0.045 * 100) / 100;
}

function necFor(basic: number): number {
  return Math.round(basic * 0.01 * 100) / 100;
}

function buildLine(e: Employee, runId: string): PayrollLine {
  // Allowances: grade-based
  const allowance =
    e.grade.startsWith('E') ? 600 :
    e.grade.startsWith('D') ? 350 :
    e.grade.startsWith('C') ? 180 :
    e.grade.startsWith('B') ?  90 :
                               45;
  const gross = e.basicMonthlyUsd + allowance;
  const paye = payeFor(gross);
  const nssa = nssaFor(gross);
  const nec = necFor(e.basicMonthlyUsd);
  const other = 0;
  const net = Math.round((gross - paye - nssa - nec - other) * 100) / 100;
  return {
    id: `pl_${runId}_${e.id}`,
    runId,
    employeeId: e.id,
    basicUsd: e.basicMonthlyUsd,
    allowanceUsd: allowance,
    grossUsd: gross,
    payeUsd: paye,
    nssaUsd: nssa,
    necUsd: nec,
    otherDeductionsUsd: other,
    netUsd: net,
  };
}

export function linesForRun(runId: string): PayrollLine[] {
  return EMPLOYEES
    .filter((e) => e.status !== 'separated')
    .map((e) => buildLine(e, runId));
}

function totalsForRun(runId: string): Pick<PayrollRun, 'employeeCount' | 'grossUsd' | 'netUsd' | 'payeUsd' | 'nssaUsd' | 'necUsd'> {
  const lines = linesForRun(runId);
  return {
    employeeCount: lines.length,
    grossUsd: round(lines.reduce((s, l) => s + l.grossUsd, 0)),
    netUsd:   round(lines.reduce((s, l) => s + l.netUsd,   0)),
    payeUsd:  round(lines.reduce((s, l) => s + l.payeUsd,  0)),
    nssaUsd:  round(lines.reduce((s, l) => s + l.nssaUsd,  0)),
    necUsd:   round(lines.reduce((s, l) => s + l.necUsd,   0)),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export const PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'pr_2026_04',
    period: '2026-04',
    status: 'draft',
    createdAt: '2026-04-16T07:00:00Z',
    createdBy: 'Patience Dube',
    approvedAt: null,
    approvedBy: null,
    paidAt: null,
    ...totalsForRun('pr_2026_04'),
  },
  {
    id: 'pr_2026_03',
    period: '2026-03',
    status: 'paid',
    createdAt: '2026-03-20T07:00:00Z',
    createdBy: 'Patience Dube',
    approvedAt: '2026-03-22T10:00:00Z',
    approvedBy: 'Nobert Chigariro (CFO)',
    paidAt: '2026-03-25T09:00:00Z',
    ...totalsForRun('pr_2026_03'),
  },
  {
    id: 'pr_2026_02',
    period: '2026-02',
    status: 'paid',
    createdAt: '2026-02-20T07:00:00Z',
    createdBy: 'Patience Dube',
    approvedAt: '2026-02-22T09:30:00Z',
    approvedBy: 'Nobert Chigariro (CFO)',
    paidAt: '2026-02-25T09:00:00Z',
    ...totalsForRun('pr_2026_02'),
  },
];

export function findPayrollRun(id: string): PayrollRun | undefined {
  return PAYROLL_RUNS.find((r) => r.id === id);
}

export const RUN_STATUS_LABEL: Record<PayrollRunStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  paid: 'Paid',
};

export const RUN_STATUS_TONE: Record<PayrollRunStatus, 'warning' | 'info' | 'success'> = {
  draft: 'warning',
  approved: 'info',
  paid: 'success',
};
