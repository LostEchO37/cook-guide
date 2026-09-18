/** Minimal service worker — enables install / add-to-home-screen on supported browsers. */
const CACHE = 'ember-v1.9.1';

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
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Always take network for app shell + JS so alarm/UI fixes ship immediately
  const isShell = url.pathname.endsWith('/')
    || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/styles.css')
    || url.pathname.includes('/js/');
  if (isShell) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request)),
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
