const CACHE_NAME = 'rewire-v11';
const APP_SHELL = [
  '/recovery-max/',
  '/recovery-max/index.html',
  '/recovery-max/manifest.json',
  '/recovery-max/css/app.css',
  '/recovery-max/js/app.js',
  '/recovery-max/js/service-worker-register.js',
  '/recovery-max/assets/icons/icon-192.png',
  '/recovery-max/assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key === CACHE_NAME ? null : caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match('/recovery-max/index.html'));
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existing = clients.find(client => client.url.includes('/recovery-max/'));
      if (existing) return existing.focus();
      return self.clients.openWindow('/recovery-max/index.html');
    })
  );
});
