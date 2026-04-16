// ─────────────────────────────────────────────
// Rate cards & fee schedules — spec §3.2
// "Rate card management per property class"
// Demo-Visual and "Rate card & fee schedule
// management" Demo-Visual.
//
// Monthly rates per property class plus a fees
// schedule for services / licences that are
// collected at application time.
// ─────────────────────────────────────────────

export type PropertyClass = 'residential' | 'commercial' | 'agricultural';

export interface RateCardLine {
  kind: 'rates' | 'unit-tax' | 'development-levy' | 'refuse';
  label: string;
  residential: number;
  commercial: number;
  agricultural: number;
  note?: string;
}

export const RATE_CARD: RateCardLine[] = [
  { kind: 'rates',             label: 'Property rates (per month)',      residential: 55, commercial: 90, agricultural: 30 },
  { kind: 'unit-tax',          label: 'Unit tax (per residential unit)', residential:  8, commercial:  0, agricultural:  0, note: 'Residential only.' },
  { kind: 'development-levy',  label: 'Development levy',                 residential: 12.5, commercial: 18, agricultural:  6 },
  { kind: 'refuse',            label: 'Refuse collection',                 residential: 12, commercial: 20, agricultural:  0, note: 'Waived for undeveloped stands.' },
];

export interface FeeScheduleItem {
  id: string;
  category: 'licence' | 'permit' | 'clearance' | 'other';
  label: string;
  amountUsd: number;
  renewalMonths?: number;
  note?: string;
}

export const FEE_SCHEDULE: FeeScheduleItem[] = [
  { id: 'fs_bl_new',      category: 'licence',   label: 'Business licence — new',     amountUsd:  25, renewalMonths: 12 },
  { id: 'fs_bl_renew',    category: 'licence',   label: 'Business licence — renewal', amountUsd:  20, renewalMonths: 12 },
  { id: 'fs_bl_transfer', category: 'licence',   label: 'Business licence — transfer', amountUsd:  15 },
  { id: 'fs_liquor',      category: 'licence',   label: 'Liquor licence',               amountUsd:  40, renewalMonths: 12 },
  { id: 'fs_hawkers',     category: 'licence',   label: "Hawkers' permit",              amountUsd:   8, renewalMonths:  6 },
  { id: 'fs_bp',          category: 'permit',    label: 'Building plan review',         amountUsd:  60 },
  { id: 'fs_burial',      category: 'permit',    label: 'Burial order',                 amountUsd:  20 },
  { id: 'fs_market',      category: 'permit',    label: 'Market stall allocation',      amountUsd:  10, renewalMonths:  3 },
  { id: 'fs_stand',       category: 'permit',    label: 'Residential stand application', amountUsd: 15 },
  { id: 'fs_clearance',   category: 'clearance', label: 'Rates clearance certificate',  amountUsd:   0, note: 'Free when account is fully settled.' },
];

export const FEE_CATEGORY_LABEL: Record<FeeScheduleItem['category'], string> = {
  licence:   'Licences',
  permit:    'Permits',
  clearance: 'Clearances',
  other:     'Other',
};
