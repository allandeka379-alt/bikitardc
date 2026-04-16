// ─────────────────────────────────────────────
// Landing-page services grid — spec §8.1 specifies
// 6 tiles, two per row on mobile.
//
// `icon` is a lucide-react icon name, resolved in
// the ServicesGrid component. `i18nKey` points at
// messages/*.json for the title/description.
// ─────────────────────────────────────────────

export type ServiceIcon =
  | 'receipt'
  | 'file-badge'
  | 'hard-hat'
  | 'megaphone'
  | 'folder-lock'
  | 'scale';

export interface LandingService {
  id: string;
  href: string;
  icon: ServiceIcon;
  i18nKey: keyof typeof SERVICE_I18N_KEYS;
  accent: 'blue' | 'gold' | 'green' | 'amber' | 'red' | 'sky';
}

const SERVICE_I18N_KEYS = {
  rates: 'landing.services.rates',
  businessLicence: 'landing.services.businessLicence',
  buildingPlans: 'landing.services.buildingPlans',
  report: 'landing.services.report',
  documents: 'landing.services.documents',
  transparency: 'landing.services.transparency',
} as const;

export const LANDING_SERVICES: LandingService[] = [
  { id: 's_rates',    href: '/login?redirect=/portal/dashboard',  icon: 'receipt',     i18nKey: 'rates',           accent: 'blue'  },
  { id: 's_business', href: '/login?redirect=/portal/apply/business-licence', icon: 'file-badge',  i18nKey: 'businessLicence', accent: 'gold'  },
  { id: 's_building', href: '/login?redirect=/portal/apply/building-plan',    icon: 'hard-hat',    i18nKey: 'buildingPlans',   accent: 'amber' },
  { id: 's_report',   href: '/login?redirect=/portal/report',    icon: 'megaphone',   i18nKey: 'report',          accent: 'red'   },
  { id: 's_docs',     href: '/login?redirect=/portal/documents', icon: 'folder-lock', i18nKey: 'documents',       accent: 'sky'   },
  { id: 's_transparency', href: '/#transparency', icon: 'scale', i18nKey: 'transparency',   accent: 'green' },
];
