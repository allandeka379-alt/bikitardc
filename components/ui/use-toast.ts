'use client';

// Tiny toast store — no external state manager, just useSyncExternalStore.
// Usage: `toast({ title: '…', tone: 'success' })`.

import type { ReactNode } from 'react';
import { useSyncExternalStore } from 'react';

interface ToastItem {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  tone?: 'default' | 'success' | 'danger' | 'info';
  open: boolean;
}

let items: ToastItem[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export const toast = (input: Omit<ToastItem, 'id' | 'open'>) => {
  const id = uid();
  items = [...items, { ...input, id, open: true }];
  emit();
  // Auto-close after 5s (matches ToastProvider duration).
  setTimeout(() => {
    items = items.map((t) => (t.id === id ? { ...t, open: false } : t));
    emit();
  }, 5000);
  // Garbage-collect after transition.
  setTimeout(() => {
    items = items.filter((t) => t.id !== id);
    emit();
  }, 5400);
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return items;
}

function getServerSnapshot(): ToastItem[] {
  return [];
}

export function useToastStore<T>(selector: (state: { toasts: ToastItem[]; remove: (id: string) => void }) => T): T {
  const toasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return selector({
    toasts,
    remove: (id: string) => {
      items = items.filter((t) => t.id !== id);
      emit();
    },
  });
}
