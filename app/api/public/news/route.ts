import { NextResponse } from 'next/server';
import { NEWS } from '@/mocks/fixtures/news';

export function GET() {
  return NextResponse.json({ items: NEWS });
}
