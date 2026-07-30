// Self-destroying service worker.
//
// This app does NOT use a service worker. However, an earlier app served on
// this same origin (e.g. http://localhost:3000) may have registered one that
// is still installed in visitors' browsers. A stale SW serves a cached app
// shell pointing at chunk files that no longer exist, which causes a
// ChunkLoadError and an endless page-reload loop.
//
// Serving this file at /sw.js means the browser's periodic SW update check
// fetches a real script (not a 404). It immediately unregisters itself, deletes
// all caches, and reloads each open tab once — uncontrolled and clean.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => client.navigate(client.url));
      } catch (e) {
        // best-effort cleanup
      }
    })()
  );
});
