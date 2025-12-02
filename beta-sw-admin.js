// beta-sw-admin.js — Admin BETA PWA
self.addEventListener("install", (evt) => {
  console.log("[BETA SW] Admin installed");
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  console.log("[BETA SW] Admin activated");
  self.clients.claim();
});