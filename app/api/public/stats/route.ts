// Public stats — consumed by landing page LiveStatsStrip.
// Jittered on each request to animate the counters.
import { NextResponse } from 'next/server';
import { getPublicStats } from '@/mocks/fixtures/stats';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(getPublicStats(), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
