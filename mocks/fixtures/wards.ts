// ─────────────────────────────────────────────
// Ward fixtures for Bikita RDC
//
// Centroid coordinates are approximate (for map
// markers in later milestones). Projects are seed
// data for the landing-page ward-spotlight strip.
// ─────────────────────────────────────────────

export interface WardProject {
  id: string;
  title: string;
  imageUrl: string;
  progress: number; // 0-100
}

export interface Ward {
  id: string;
  name: string;
  councillor: string;
  centroid: { lat: number; lng: number };
  featuredProject?: WardProject;
}

export const WARDS: Ward[] = [
  {
    id: 'w_nyika',
    name: 'Nyika',
    councillor: 'Cllr. T. Muchena',
    centroid: { lat: -20.08, lng: 31.6 },
    featuredProject: {
      id: 'p_nyika_water',
      title: 'Community water reticulation — phase 2',
      imageUrl:
        'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?w=1200&q=80&auto=format&fit=crop',
      progress: 68,
    },
  },
  {
    id: 'w_mupani',
    name: 'Mupani',
    councillor: 'Cllr. R. Chari',
    centroid: { lat: -20.18, lng: 31.55 },
    featuredProject: {
      id: 'p_mupani_clinic',
      title: 'Mupani rural clinic solar rollout',
      imageUrl:
        'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1200&q=80&auto=format&fit=crop',
      progress: 42,
    },
  },
  {
    id: 'w_nhema',
    name: 'Nhema',
    councillor: 'Cllr. G. Makore',
    centroid: { lat: -20.05, lng: 31.7 },
    featuredProject: {
      id: 'p_nhema_road',
      title: 'Nhema–Mazungunye feeder road grading',
      imageUrl:
        'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&q=80&auto=format&fit=crop',
      progress: 91,
    },
  },
];
