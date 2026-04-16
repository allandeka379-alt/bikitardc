// ─────────────────────────────────────────────
// Live stats strip fixture
//
// Values jitter slightly on each fetch so the
// 30-second refetch produces visible movement in
// the animated counters — spec §8.1.
// ─────────────────────────────────────────────

export interface PublicStats {
  ratesCollectedUsd: number;
  requestsResolved: number;
  licencesIssuedYtd: number;
  activeWardProjects: number;
  updatedAt: string;
}

const BASE: Omit<PublicStats, 'updatedAt'> = {
  ratesCollectedUsd: 184_320,
  requestsResolved: 1_247,
  licencesIssuedYtd: 312,
  activeWardProjects: 18,
};

function jitter(value: number, pct: number): number {
  const delta = value * pct;
  return Math.round(value + (Math.random() * 2 - 1) * delta);
}

export function getPublicStats(): PublicStats {
  return {
    ratesCollectedUsd: jitter(BASE.ratesCollectedUsd, 0.015),
    requestsResolved: jitter(BASE.requestsResolved, 0.02),
    licencesIssuedYtd: BASE.licencesIssuedYtd + Math.floor(Math.random() * 3),
    activeWardProjects: BASE.activeWardProjects,
    updatedAt: new Date().toISOString(),
  };
}
