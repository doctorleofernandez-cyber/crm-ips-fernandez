/* ════════ SERVICE WORKER — "INTERNET PRIMERO" ════════
   Hace que el CRM SIEMPRE cargue la última versión cuando hay conexión
   (revalidando con el servidor), y como respaldo sirve lo guardado si
   no hay internet. Así se acaban los problemas de caché vieja. */
const CACHE = 'crm-ips-cache-v1';

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Solo manejamos nuestros propios archivos; los CDN (fuentes, gráficas) van normal.
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith((async () => {
    try {
      // Revalida con el servidor: trae lo último si cambió; rápido (304) si no.
      const fresh = await fetch(req, { cache: 'no-cache' });
      const cache = await caches.open(CACHE);
      cache.put(req, fresh.clone());
      return fresh;
    } catch (err) {
      // Sin internet → usa lo último guardado.
      const cached = await caches.match(req);
      return cached || Response.error();
    }
  })());
});
