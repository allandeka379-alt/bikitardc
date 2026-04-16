'use client';

// Registers /sw.js after mount so pages render
// without waiting for SW install. Skipped in dev
// by default — HMR + a service worker is fragile.
// Toggle `NEXT_PUBLIC_SW_IN_DEV=1` to force-enable
// during development.

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const allowInDev = process.env.NEXT_PUBLIC_SW_IN_DEV === '1';
    if (process.env.NODE_ENV !== 'production' && !allowInDev) return;

    // Defer registration until after first paint
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        // Non-fatal — PWA is a progressive enhancement.
        console.warn('[BikitaRDC] Service worker registration failed:', err);
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);

  // Also listen for online/offline events so the
  // rest of the app can react (e.g. show a toast).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setOffline = () => {
      document.body.dataset.offline = '1';
    };
    const setOnline = () => {
      delete document.body.dataset.offline;
    };

    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOffline);
    if (!navigator.onLine) setOffline();

    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOffline);
    };
  }, []);

  return null;
}
