// Retired: this service worker used to cache the app shell with a cache-first
// strategy and a static cache name, so it never picked up new deployments and
// kept serving stale index.html / asset references after every redeploy.
// This version clears that cache and unregisters itself so already-affected
// visitors self-heal on their next visit.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
