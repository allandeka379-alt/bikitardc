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
      imageUrl: '/wards/community-water-reticulation.jpg',
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
      imageUrl: '/wards/rural-clinic-solar.jpg',
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
      imageUrl: '/wards/feeder-road-grading.jpg',
      progress: 91,
    },
  },
];
