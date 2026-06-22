const CACHE_NAME = "mon-portfolio-v4";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  var isPage = e.request.mode === "navigate" || e.request.destination === "document";

  if (isPage) {
    e.respondWith(
      fetch(e.request)
        .then(function (res) {
          caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, res.clone()); });
          return res;
        })
        .catch(function () {
          return caches.match(e.request).then(function (c) { return c || caches.match("./index.html"); });
        })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request);
    })
  );
});

// v4
