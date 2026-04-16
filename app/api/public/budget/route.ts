import { NextResponse } from 'next/server';
import { WARD_BUDGET } from '@/mocks/fixtures/budget';

export function GET() {
  return NextResponse.json({ items: WARD_BUDGET });
}
