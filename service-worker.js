/* Label Roll Calculator - actualizacion del visor 3D 2026-10-10 */
const CACHE_NAME = 'label-roll-calculator-v10-escritorio';
const APP_SHELL = ['./', './index.html', './visor-3d.html', './manifest.json', './interfaz-v2.js?v=4', './cajas-selector.js?v=2', './cajas-selector.css?v=7'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Siempre intentar descargar el HTML nuevo, incluido el visor.
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/visor-3d.html')) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (error) {
        return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
