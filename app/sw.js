const CACHE_NAME = 'fc26-cranium-v45';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './PRESETS_DB_v3.js',
  './script.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  // Force le nouveau SW à prendre le contrôle immédiatement
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Nettoyage des anciens caches (v1, v2, etc.)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Prend le contrôle de tous les onglets ouverts
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    // Network-first : essaie le réseau d'abord, cache en fallback
    fetch(event.request)
      .then(response => {
        // Met à jour le cache avec la réponse fraîche
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
