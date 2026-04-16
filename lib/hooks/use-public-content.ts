'use client';

// Merge-and-sort helpers for the public pages.
// Each hook combines the static fixture with any
// runtime items the admin has published.

import { useMemo } from 'react';
import { useContentStore } from '@/lib/stores/content';
import { MEETINGS, type Meeting } from '@/mocks/fixtures/meetings';
import { NEWS, type NewsItem } from '@/mocks/fixtures/news';
import { TENDERS, type Tender } from '@/mocks/fixtures/tenders';

export function useAllNews(): NewsItem[] {
  const extra = useContentStore((s) => s.extraNews);
  return useMemo(
    () => [...extra, ...NEWS].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [extra],
  );
}

export function useAllMeetings(): Meeting[] {
  const extra = useContentStore((s) => s.extraMeetings);
  return useMemo(
    () =>
      [...extra, ...MEETINGS].sort((a, b) =>
        a.startAt < b.startAt ? -1 : 1,
      ),
    [extra],
  );
}

export function useAllTenders(): Tender[] {
  const extra = useContentStore((s) => s.extraTenders);
  return useMemo(
    () =>
      [...extra, ...TENDERS].sort((a, b) =>
        a.closingDate < b.closingDate ? -1 : 1,
      ),
    [extra],
  );
}
