// Kill-switch service worker at the origin root. phived v1 shipped a PWA whose
// workbox service worker precached index.html; v2 removed the PWA but old
// clients still hold that worker. This file replaces the zombie worker, wipes
// its caches, unregisters itself, and reloads open tabs into the current app.
//
// DO NOT DELETE THIS FILE. See docs/adr/0001-service-worker-kill-switch.md.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })()
  );
});
