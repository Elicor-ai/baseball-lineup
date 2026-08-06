const CACHE = 'baseball-v2';
const ASSETS = [
  '/baseball-lineup/baseball-lineup.html',
  '/baseball-lineup/manifest.json',
  '/baseball-lineup/icon-192.png',
  '/baseball-lineup/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // HTML : réseau d'abord (pour recevoir les mises à jour), cache en secours (hors-ligne)
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Autres ressources (icônes, manifest) : cache d'abord
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
