const CACHE = "surprise-v1";
const ASSETS = [
  "./index.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css",
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/fonts/tabler-icons.woff2"
];

// 安裝：預先快取核心資源
self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

// 啟動：清除舊快取
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// 攔截請求：Cache First，沒有再網路
self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(res){
        // 動態快取同源資源
        if(e.request.url.startsWith(self.location.origin)){
          var clone = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return res;
      });
    }).catch(function(){
      // 離線 fallback
      if(e.request.destination === "document"){
        return caches.match("./index.html");
      }
    })
  );
});
