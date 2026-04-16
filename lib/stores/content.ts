'use client';

// ─────────────────────────────────────────────
// Admin-published content store.
//
// Admin clerks can publish news, meetings and
// tenders from /erp/admin/content; items land in
// this runtime store and are merged with the
// static fixtures on every public page.
// ─────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Meeting } from '@/mocks/fixtures/meetings';
import type { NewsItem } from '@/mocks/fixtures/news';
import type { Tender } from '@/mocks/fixtures/tenders';

interface ContentState {
  extraNews: NewsItem[];
  extraMeetings: Meeting[];
  extraTenders: Tender[];

  publishNews: (item: NewsItem) => void;
  publishMeeting: (item: Meeting) => void;
  publishTender: (item: Tender) => void;

  removeNews: (id: string) => void;
  removeMeeting: (id: string) => void;
  removeTender: (id: string) => void;

  reset: () => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      extraNews: [],
      extraMeetings: [],
      extraTenders: [],

      publishNews: (item) =>
        set({ extraNews: [item, ...get().extraNews.filter((i) => i.id !== item.id)] }),
      publishMeeting: (item) =>
        set({ extraMeetings: [item, ...get().extraMeetings.filter((i) => i.id !== item.id)] }),
      publishTender: (item) =>
        set({ extraTenders: [item, ...get().extraTenders.filter((i) => i.id !== item.id)] }),

      removeNews: (id) => set({ extraNews: get().extraNews.filter((i) => i.id !== id) }),
      removeMeeting: (id) => set({ extraMeetings: get().extraMeetings.filter((i) => i.id !== id) }),
      removeTender: (id) => set({ extraTenders: get().extraTenders.filter((i) => i.id !== id) }),

      reset: () => set({ extraNews: [], extraMeetings: [], extraTenders: [] }),
    }),
    { name: 'bikita-content' },
  ),
);
