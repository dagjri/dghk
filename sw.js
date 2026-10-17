// 動画リスト - Service Worker（アプリ化・オフライン対応用）
var CACHE_NAME = "video-list-v1";
var ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var fetched = fetch(e.request).then(function (res) {
        // 取得に成功したらキャッシュを更新（YouTubeサムネイルなども含む）
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, copy);
          });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || fetched;
    })
  );
});
