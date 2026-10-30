// Keeps the calculator working without internet. Bump VERSION on every release.
const VERSION = 'smena-v5';
const FILES = ['./', 'index.html', 'pdfmake.min.js', 'vfs_fonts.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first so updates arrive; cache when offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    // no-cache: always ask GitHub whether the file changed, so updates show up on the next launch
    fetch(e.request, {cache: 'no-cache'}).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(m => m || caches.match('index.html')))
  );
});
