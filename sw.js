/* Service worker: o site abre mesmo sem internet (depois da 1ª visita). */
var VERSAO = 'hinario5-v1';
var BASE = [
  './', 'index.html', 'style.css', 'app.js', 'config.js', 'hinos.js',
  'manifest.webmanifest', 'img/violao.jpg', 'img/og.jpg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSAO).then(function (c) { return c.addAll(BASE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSAO; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;           // fontes/links externos: rede normal

  // config/preços: rede primeiro, para atualizações aparecerem logo
  var rede1 = /\/(config|hinos|app)\.js$|index\.html$|\/$/.test(url.pathname);
  if (rede1) {
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, cp); }); return r;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(req).then(function (m) {
    return m || fetch(req).then(function (r) {
      if (r.ok) { var cp = r.clone(); caches.open(VERSAO).then(function (c) { c.put(req, cp); }); }
      return r;
    });
  }));
});
