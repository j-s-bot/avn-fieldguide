const CACHE_NAME = 'avn-fieldguide-v35';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './assets/icon-192.png',
  './assets/icon-512.png',
  // Modular ES components
  './js/app.js',
  './js/data-loader.js',
  './js/header.js',
  './js/filter-bar.js',
  './js/species-card.js',
  './js/lightbox.js',
  './js/comparison-modal.js',
  './js/router.js',
  // Standalone JSON datasets
  './data/sparrows.json',
  './data/ducks.json',
  './data/gulls.json',
  './data/shorebirds.json',
  './data/terns.json',
  './data/grebes.json',
  './data/swans.json',
  // Legacy redirects (offline preservation)
  './ducks.html',
  './gulls.html',
  './shorebirds.html',
  './terns.html',
  './grebes.html',
  './swans.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-First with Cache Fallback for instant updates and robust offline resilience
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && (networkRes.status === 200 || networkRes.type === 'opaque')) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      })
      .catch(async () => {
        // 1. Try exact cache match
        const exactMatch = await caches.match(e.request);
        if (exactMatch) return exactMatch;

        // 2. Try match ignoring query search params (e.g. index.html?guide=ducks matches ./index.html)
        const searchIgnored = await caches.match(e.request, { ignoreSearch: true });
        if (searchIgnored) return searchIgnored;

        // 3. For navigation requests while offline, fall back to cached index.html shell
        if (e.request.mode === 'navigate') {
          const fallbackShell = await caches.match('./index.html') || await caches.match('./') || await caches.match('index.html');
          if (fallbackShell) return fallbackShell;
        }

        return Response.error();
      })
  );
});
