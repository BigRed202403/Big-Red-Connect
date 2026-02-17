// sw.js — Big Red Connect (PWA)
// iOS-safe: network-first for HTML navigations (detected by Accept header),
// cache-first for static assets.

const CACHE_NAME = "bigredconnect-v3"; // <-- bump this every SW change

const OFFLINE_FILES = [
  "/index.html",
  "/control.html",
  "/style.css",
  "/icon.png",
  "/Official Logo.png",
  "/rider/login.html",
  "/rider/ride-request.html",
  "/rider/myride.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // iOS PWA reliability: treat "page loads" as anything that accepts HTML
  const accept = req.headers.get("accept") || "";
  const isHTML = accept.includes("text/html");

  // ✅ NETWORK-FIRST for HTML to prevent "cached index.html" hijacking routes
  if (isHTML) {
    event.respondWith((async () => {
      try {
        // Always try network for pages
        const fresh = await fetch(req, { cache: "no-store" });
        return fresh;
      } catch (err) {
        // Offline fallback: try exact match, else home
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(req)) || (await cache.match("/index.html"));
      }
    })());
    return;
  }

  // ✅ CACHE-FIRST for same-origin assets (but NEVER cache cross-origin or opaque)
  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const resp = await fetch(req);

      // Only cache same-origin "basic" responses
      if (resp && resp.status === 200 && resp.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, resp.clone());
      }
      return resp;
    } catch (err) {
      // Optional offline image fallback
      if (req.destination === "image") {
        const cache = await caches.open(CACHE_NAME);
        return cache.match("/official_logo_Nov.png");
      }
      return new Response("", { status: 504, statusText: "Offline" });
    }
  })());
});