// ─────────────────────────────────────────────
// Bikita RDC service worker
//
// Lean offline-first strategy:
//   • On install, precache the shell (landing,
//     dashboard, offline page, manifest, icons).
//   • For navigation requests: network-first with
//     a fall-through to the cached copy, and
//     finally /offline when nothing is available.
//   • For other same-origin GETs (CSS, JS, fonts,
//     API JSON): stale-while-revalidate.
//
// Bumping CACHE_VERSION busts old caches on next
// install.
// ─────────────────────────────────────────────

const CACHE_VERSION = 'bikita-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const SHELL_URLS = [
  '/',
  '/offline',
  '/portal/dashboard',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Try to pre-cache; ignore individual failures so
      // one missing asset doesn't abort the whole install.
      await Promise.all(
        SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined),
        ),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Don't intercept cross-origin requests — e.g. OpenStreetMap tiles.
  if (url.origin !== self.location.origin) return;

  // Never cache Next.js RSC payloads — let them go through.
  if (url.pathname.startsWith('/_next/data/')) return;

  // HTML navigations → network-first
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(req);
          if (response && response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(req, response.clone()).catch(() => undefined);
          }
          return response;
        } catch {
          const cache = await caches.open(RUNTIME_CACHE);
          const cached = (await cache.match(req)) || (await caches.match('/offline'));
          return cached || new Response('Offline', { status: 503 });
        }
      })(),
    );
    return;
  }

  // Static / API assets → stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((response) => {
          if (response && response.ok) cache.put(req, response.clone()).catch(() => undefined);
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })(),
  );
});
