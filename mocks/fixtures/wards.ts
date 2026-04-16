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
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=800&q=75&auto=format&fit=crop',
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
        'https://images.unsplash.com/photo-1509390157308-8cc32736bb9e?w=800&q=75&auto=format&fit=crop',
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
        'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&q=75&auto=format&fit=crop',
      progress: 91,
    },
  },
];
