// sw.js — Big Red Connect (PWA)
// Fixes iOS A2HS “glitch to home page” by using NETWORK-FIRST for navigations
// and CACHE-FIRST for static assets.

const CACHE_NAME = "bigredconnect-v2";

// Files you want available offline (add/remove as you like).
// IMPORTANT: These paths are relative to the scope where sw.js is served.
// If sw.js is at site root (/sw.js), these will be treated as /index.html, /rider/login.html, etc.
const OFFLINE_FILES = [
  "/index.html",
  "/control.html",
  "/style.css",
  "/icon.png",
  "/Official Logo.png",

  // Rider pages (offline-capable if you want them cached)
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

  // ✅ FULL PAGE NAVIGATIONS (HTML): network-first
  // Prevents cached index.html from being served for /rider/login.html, /rider/ride-request.html, etc.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Always try network first so the correct page loads in the iOS Home Screen web app.
          const fresh = await fetch(req);
          return fresh;
        } catch (err) {
          // Offline fallback: try cached requested page, else cached home.
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match(req)) || (await cache.match("/index.html"));
        }
      })()
    );
    return;
  }

  // ✅ STATIC ASSETS (CSS/JS/Images): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((resp) => {
          // Only cache successful, basic responses (avoid caching opaque/3rd-party responses)
          if (!resp || resp.status !== 200 || resp.type !== "basic") return resp;

          // Cache a copy of same-origin assets for faster repeat loads
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, respClone));
          return resp;
        })
        .catch(async () => {
          // If offline and requesting an image, optionally return the logo as a fallback
          if (req.destination === "image") {
            const cache = await caches.open(CACHE_NAME);
            return cache.match("/official_logo_Nov.png");
          }
          // Otherwise, just fail normally
          return new Response("", { status: 504, statusText: "Offline" });
        });
    })
  );
});