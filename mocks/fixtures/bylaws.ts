// Searchable by-laws library — spec §3.1
// "Searchable by-laws library" Demo — Visual.

export type BylawCategory =
  | 'revenue'
  | 'planning'
  | 'environment'
  | 'public-health'
  | 'markets'
  | 'transport'
  | 'animals'
  | 'administration';

export interface Bylaw {
  id: string;
  slug: string;
  title: string;
  chapter: string; // e.g. "Chapter 5 — Stall licensing"
  category: BylawCategory;
  summary: string;
  effectiveFrom: string;
  amendedAt?: string;
  sections: { title: string; body: string }[];
  /** Some by-laws are tied to a specific ward. */
  scope: 'district' | 'ward';
  wardId?: string;
}

export const BYLAW_CATEGORY_LABEL: Record<BylawCategory, string> = {
  revenue:        'Rates & revenue',
  planning:       'Planning & building',
  environment:    'Environment',
  'public-health': 'Public health',
  markets:        'Markets & trade',
  transport:      'Transport & roads',
  animals:        'Animal & livestock',
  administration: 'Administration',
};

export const BYLAWS: Bylaw[] = [
  {
    id: 'bl_rates_2024',
    slug: 'rates-and-charges-2024',
    title: 'Rates & charges by-law (2024)',
    chapter: 'Chapter 1 — Rates & revenue',
    category: 'revenue',
    summary:
      'Sets the methodology for property rates, unit tax, refuse collection and development levy billed by the council.',
    effectiveFrom: '2024-01-01',
    amendedAt: '2025-07-01',
    scope: 'district',
    sections: [
      {
        title: '1.1 Scope',
        body: 'Applies to every rateable property within the district. Rateable property includes residential, commercial, agricultural and institutional stands.',
      },
      {
        title: '1.2 Billing cycle',
        body: 'Rates are billed on the 1st of each month. The due date is the last day of the month unless otherwise gazetted.',
      },
      {
        title: '1.3 Late payment',
        body: 'Interest of 1.5% per month accrues on overdue balances. Residents may apply for a payment arrangement under section 1.5.',
      },
      {
        title: '1.5 Payment arrangements',
        body: 'Upon written application, the council may approve an installment plan not exceeding six (6) months for overdue amounts. Interest pauses on the amount under plan while the resident remains in good standing.',
      },
    ],
  },
  {
    id: 'bl_business_licence_2023',
    slug: 'business-licensing-2023',
    title: 'Business licensing by-law (2023)',
    chapter: 'Chapter 3 — Licensing',
    category: 'markets',
    summary:
      'Governs the issuance, renewal and revocation of business licences — including the fees schedule and inspection requirements.',
    effectiveFrom: '2023-03-01',
    scope: 'district',
    sections: [
      { title: '3.1 Licence required', body: 'No person may operate a trade, calling or business within the district without a valid licence issued under this by-law.' },
      { title: '3.2 Application', body: 'Applications may be submitted in person at the council offices or online via the unified portal. The council shall process complete applications within 10 working days.' },
      { title: '3.3 Fees', body: 'Fees are set out in Schedule A and adjusted annually with council approval.' },
    ],
  },
  {
    id: 'bl_building_standards',
    slug: 'building-standards-2022',
    title: 'Building plans & permits by-law (2022)',
    chapter: 'Chapter 4 — Planning & building',
    category: 'planning',
    summary:
      'Standards for the submission and approval of building plans, on-site inspections and the issuance of occupancy certificates.',
    effectiveFrom: '2022-06-15',
    scope: 'district',
    sections: [
      { title: '4.1 Plan approval', body: 'No structural work may commence until written plan approval has been issued.' },
      { title: '4.2 Inspections', body: 'A council officer shall inspect the works at foundation, roof-level and completion stages.' },
    ],
  },
  {
    id: 'bl_refuse_2024',
    slug: 'refuse-and-sanitation-2024',
    title: 'Refuse & sanitation by-law (2024)',
    chapter: 'Chapter 6 — Environment',
    category: 'environment',
    summary:
      'Governs refuse zoning, collection schedules, illegal dumping fines, and sanitation facilities.',
    effectiveFrom: '2024-01-01',
    scope: 'district',
    sections: [
      { title: '6.1 Zones', body: 'The district is divided into zones 1–9; collection days are published by the council and may change with 14 days notice.' },
      { title: '6.2 Fines', body: 'Illegal dumping attracts a fine of USD 200 per offence.' },
    ],
  },
  {
    id: 'bl_mupani_market',
    slug: 'mupani-market-management',
    title: 'Mupani market management (2023)',
    chapter: 'Chapter 5 — Stall licensing',
    category: 'markets',
    summary: 'Ward-specific by-law covering stall allocation, trading hours and sanitation at Mupani market.',
    effectiveFrom: '2023-04-01',
    scope: 'ward',
    wardId: 'w_mupani',
    sections: [
      { title: '5.1 Trading hours', body: 'Market trading hours are 06:00 to 18:00 Monday to Saturday, and 08:00 to 14:00 on Sundays.' },
      { title: '5.2 Stall allocation', body: 'Stalls are allocated on a rotating basis; registered hawkers have priority in renewals.' },
    ],
  },
  {
    id: 'bl_public_health',
    slug: 'public-health-sanitation',
    title: 'Public health & sanitation (2020)',
    chapter: 'Chapter 7 — Public health',
    category: 'public-health',
    summary: 'Minimum standards for clinics, cemeteries, water points and food handling establishments.',
    effectiveFrom: '2020-09-01',
    scope: 'district',
    sections: [
      { title: '7.1 Food handling', body: 'Food handlers shall hold a valid medical certificate, renewed annually.' },
      { title: '7.2 Water points', body: 'Community water points shall be inspected quarterly by council health inspectors.' },
    ],
  },
  {
    id: 'bl_transport_2024',
    slug: 'transport-and-roads-2024',
    title: 'Transport & roads (2024)',
    chapter: 'Chapter 8 — Roads',
    category: 'transport',
    summary: 'Covers road reserves, signage, speed limits and commuter omnibus ranks.',
    effectiveFrom: '2024-07-01',
    scope: 'district',
    sections: [
      { title: '8.1 Road reserves', body: 'No permanent structure may be erected within 15 metres of the centreline of a trunk road.' },
    ],
  },
  {
    id: 'bl_livestock',
    slug: 'animal-and-livestock',
    title: 'Animal & livestock (2019)',
    chapter: 'Chapter 9 — Animal control',
    category: 'animals',
    summary: 'Grazing zones, dog licensing and humane-treatment standards.',
    effectiveFrom: '2019-01-15',
    scope: 'district',
    sections: [
      { title: '9.1 Dog licence', body: 'Dogs over the age of 6 months shall be licensed annually.' },
    ],
  },
];

export function searchBylaws(query: string): Bylaw[] {
  const q = query.trim().toLowerCase();
  if (!q) return BYLAWS;
  return BYLAWS.filter((b) =>
    [b.title, b.summary, b.chapter, b.sections.map((s) => s.body).join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

export function findBylaw(slug: string): Bylaw | undefined {
  return BYLAWS.find((b) => b.slug === slug);
}
