'use client';

// Returns true after the component has mounted on the client.
// Use to gate rendering of persisted-store content so we never
// render a server HTML that differs from the first client paint.
// Matches the pattern recommended in the Zustand persist docs.

import { useEffect, useState } from 'react';

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
