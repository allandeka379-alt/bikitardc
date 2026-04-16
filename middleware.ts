// ─────────────────────────────────────────────
// Middleware — no locale routing, but we keep the
// file so future interceptions (feature flags,
// demo-clock query params) have a home.
// ─────────────────────────────────────────────

import { NextResponse } from 'next/server';

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
