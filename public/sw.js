/*
 * The service worker caches the application shell and recently visited static
 * pages only. It deliberately leaves map tile range requests online so stale
 * or partial PMTiles data cannot masquerade as an offline map.
 */

const CACHE_NAME = 'lafkos-shell-v1';
const APP_SHELL = ['/', '/el/', '/en/', '/manifest.webmanifest', '/icons/icon-192.svg', '/icons/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Do not intercept non-GET, cross-origin, local development, or Vite/HMR requests.
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/__') ||
    url.pathname.endsWith('.hot-update.json') ||
    url.pathname.endsWith('.hot-update.js') ||
    url.searchParams.has('token') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // Only cache navigation pages and static assets
  const isNavigate = request.mode === 'navigate';
  const isStatic = ['style', 'script', 'image', 'font'].includes(request.destination);
  if (!isNavigate && !isStatic) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request).then((response) => {
      if (response.ok && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    }).catch(() => (isNavigate ? caches.match('/el/') : undefined))),
  );
});
