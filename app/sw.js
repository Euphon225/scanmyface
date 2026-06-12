const CACHE_NAME = 'fc26-cranium-v137';
const ASSETS = [
  './',
  './app_index_v2.html',
  './style.css',
  './script_spa.js',
  './scanToSliders_v6.js',
  './calibration_v7_slim.js',
  './calibration_v8_chair.js',
  './celebrities_to_inject.js',
  './PRESETS_DB_v4.js',
  './presetMatch.js',
  './zone_definitions.json',
  './manifest.json',
  './run3DDFA.js',
  './run3DDFA_mesh.js',
  './3ddfa_mb1.onnx',
  './3ddfa_params.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
