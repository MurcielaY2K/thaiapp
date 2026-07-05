// Minimal service worker that claims /thaiapp/ scope so it takes priority
// over any broader-scoped SW installed by the root site.
// Network-first: users always get the latest deploy when online; the cache
// is only a fallback for offline use.
const CACHE = 'thaiapp-v4-network-first';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    (async () => {
      // Drop every cache from older deployments so stale bundles can't be served.
      const names = await caches.keys();
      await Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    (async () => {
      try {
        const res = await fetch(e.request);
        // Keep a copy of good same-origin responses for offline fallback.
        if (res.ok && new URL(e.request.url).origin === self.location.origin) {
          const cache = await caches.open(CACHE);
          cache.put(e.request, res.clone());
        }
        return res;
      } catch {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        throw new Error('offline and not cached');
      }
    })()
  );
});
