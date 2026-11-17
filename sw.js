// =====================================================
//  Service Worker – speichert die App, damit sie auch
//  offline startet. Bei Änderungen VERSION erhöhen!
// =====================================================
const VERSION = "maennli-v3";
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
// WICHTIG: Immer zuerst aus dem Internet laden, nur offline aus dem Speicher.
// So zeigt Live Server (127.0.0.1:5500) auch andere Projekte richtig an
// und nicht immer die gespeicherte Wetter-App.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Nur normale Anfragen an die eigene Adresse behandeln.
  // Wetterdaten (open-meteo.com) übernimmt app.js selbst.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then((antwort) => {
        // Eigene App-Dateien im Speicher aktualisieren (für den Offline-Modus)
        const pfad = url.pathname.split("/").pop() || "./";
        if (antwort.ok && DATEIEN.some((d) => d.endsWith(pfad))) {
          const kopie = antwort.clone();
          caches.open(VERSION).then((cache) => cache.put(e.request, kopie));
        }
        return antwort;
      })
      .catch(() =>
        // Kein Internet: aus dem Speicher nehmen
        caches.match(e.request).then((treffer) => treffer || caches.match("index.html"))
      )
  );
});
