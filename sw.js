/* Jadłospis: pliki aplikacji zapisane w pamięci urządzenia, żeby działała bez internetu.
   Zmień numer wersji przy każdej aktualizacji plików. */
const CACHE = "jadlospis-v1";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png", "./fonts/Caveat.ttf", "./fonts/Signika.ttf"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Tylko pliki tej strony. Zapytania do API (odczyt przepisów) idą zawsze przez internet.
   Strona: najpierw internet (żeby od razu widzieć nową wersję), bez internetu kopia z pamięci.
   Czcionki i ikony: najpierw pamięć. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === "navigate" || req.destination === "document";
  if (isPage) {
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
  }
});
