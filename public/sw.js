/*
 * Service worker for Workout Tracker.
 *
 * The app is fully client-side — all data lives in localStorage — so once the
 * app shell (HTML document + JS/CSS chunks) is cached, the whole app runs
 * offline with no server round-trips. This worker provides:
 *
 *   - Precaching of the start URL so the installed app boots offline.
 *   - Stale-while-revalidate for hashed static assets (/_next/static/**,
 *     fonts, icons) — instant loads, refreshed in the background.
 *   - Network-first for navigations and RSC payloads — always prefer fresh
 *     content when online, fall back to the cached document (or the cached
 *     start page) when offline.
 *
 * Bump CACHE_VERSION to invalidate every cache on the next activation.
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `wst-cache-${CACHE_VERSION}`;

// Minimal app shell to precache so the very first offline launch works even
// if the user installed from a deeper route.
const PRECACHE_URLS = ['/', '/manifest.webmanifest', '/icon.svg', '/apple-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Tolerate individual failures so one missing asset can't abort install.
      await Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Let pages trigger an immediate activation after an update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname)
  );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    // Fall back to the cached start page for navigations to routes we have
    // not visited online yet — the client-side app then renders from
    // localStorage and corrects the route.
    if (request.mode === 'navigate') {
      const shell = await cache.match('/');
      if (shell) return shell;
    }
    return Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GETs. Cross-origin (e.g. PostHog analytics) and
  // mutating requests pass straight through to the network.
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isRsc = url.searchParams.has('_rsc') || request.headers.get('RSC') === '1';

  if (isNavigation || isRsc) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
