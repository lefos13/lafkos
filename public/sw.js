/*
 * The service worker caches the application shell and immutable build assets
 * only. Navigations always go to the network first so a new deployment's HTML
 * *and its response headers* (notably Content-Security-Policy) take effect
 * immediately; a cache-first shell had pinned clients to an older CSP that
 * blocked MapLibre's worker, leaving the map stuck on "loading" forever.
 * Map tile range requests stay online so stale or partial PMTiles data cannot
 * masquerade as an offline map.
 */

const CACHE_NAME = 'lafkos-shell-v2';
const APP_SHELL = [
  '/',
  '/el/',
  '/en/',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

const putInCache = (request, response) => {
  if (response.ok && response.type === 'basic') {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
};

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

  /* Content-hashed build output is immutable, so it is safe to serve from the
   * cache first. Everything else (HTML, /icons, favicon) is network-first with
   * a cache fallback for offline use. */
  const isImmutable = url.pathname.startsWith('/_astro/');
  if (isImmutable) {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => cached ?? fetch(request).then((response) => putInCache(request, response))),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => putInCache(request, response))
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached ?? (isNavigate ? caches.match('/el/') : undefined)),
      ),
  );
});
