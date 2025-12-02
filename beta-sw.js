// beta-sw.js — Rider BETA PWA
// Minimal SW, no caching, safe for testing.
self.addEventListener("install", (evt) => {
  console.log("[BETA SW] Rider installed");
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  console.log("[BETA SW] Rider activated");
  self.clients.claim();
});