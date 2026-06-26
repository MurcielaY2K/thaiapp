// Minimal service worker that claims /thaiapp/ scope so it takes priority
// over any broader-scoped SW installed by the root site.
const CACHE = 'thaiapp-v3-sanuk-ds';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
