const CACHE_NAME = 'avn-fieldguide-v24';
const ASSETS = [
  './',
  './index.html',
  './ducks.html',
  './gulls.html',
  './gulls_data.json',
  './shorebirds.html',
  './shorebirds_data.json',
  './terns.html',
  './terns_data.json',
  './grebes.html',
  './grebes_data.json',
  './swans.html',
  './swans_data.json',
  './manifest.json'
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

// Network-First with Cache Fallback for instant updates and offline resilience
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(e.request))
  );
});
