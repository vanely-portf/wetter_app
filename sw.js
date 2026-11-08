// =====================================================
//  Service Worker – speichert die App, damit sie auch
//  offline startet. Bei Änderungen VERSION erhöhen!
// =====================================================
const VERSION = "maennli-v2";
const DATEIEN = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// Beim Installieren: alle App-Dateien in den Cache legen
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(DATEIEN)));
  self.skipWaiting();
});

// Alte Caches löschen, wenn eine neue Version kommt
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(namen.filter((n) => n !== VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Anfragen abfangen
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Wetterdaten: immer zuerst aus dem Internet (sie sollen aktuell sein).
  // Ohne Internet übernimmt app.js mit den gespeicherten Daten.
  if (url.hostname.includes("open-meteo.com")) return;

  // App-Dateien: zuerst aus dem Cache (schnell + offline)
  e.respondWith(
    caches.match(e.request).then((treffer) => treffer || fetch(e.request))
  );
});
