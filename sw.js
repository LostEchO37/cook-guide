/** Minimal service worker — enables install / add-to-home-screen on supported browsers. */
const CACHE = 'ember-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([
      './',
      './index.html',
      './styles.css',
      './manifest.webmanifest',
      './assets/icon-192.png',
      './assets/icon-512.png',
    ])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
