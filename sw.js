const CACHE = 'railtrack-v3';
const SHELL = [
  './', './index.html', './manifest.json', './icon.svg',
  './icon-192.png', './icon-512.png',
  './data/trains.min.json', './data/stations.min.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // live API: network only (it's live data)
  if (url.origin === 'https://indian-railway-api.onrender.com') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
