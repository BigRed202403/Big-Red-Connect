// beta-sw-driver.js — Driver BETA PWA
self.addEventListener("install", (evt) => {
  console.log("[BETA SW] Driver installed");
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  console.log("[BETA SW] Driver activated");
  self.clients.claim();
});