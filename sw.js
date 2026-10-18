// NAAD Admin — service worker.
// Caches only the app's own files (page shell, icons, logos) so the app opens
// fast and shows its screen even with a weak connection. Student data and
// every call to the CMG server (Apps Script) always go to the network and are
// never stored here.
var CACHE = 'naad-admin-v2';
var SHELL = [
  './', 'admin.html', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png',
  'splash.png', 'bg_image.png', 'boot_logo.png',
  'logo_cmg.png', 'logo_fire.png', 'logo_police.png', 'logo_ambulance.png', 'logo_prisons.png',
  'logo_nadmo.png', 'logo_immigration.png', 'logo_customs.png', 'logo_tourism.png',
  'logo_forestry.png', 'logo_gaf.png', 'logo_nacoc.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // server calls, fonts: untouched

  var isPage = req.mode === 'navigate' || url.pathname.slice(-10) === 'admin.html';
  if (isPage) {
    // Network first so agencies always get the latest dashboard; cache is the offline fallback.
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match('admin.html'); });
      })
    );
    return;
  }
  // Images / icons / manifest: cache first, refresh in the background.
  e.respondWith(
    caches.match(req).then(function (m) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
        return res;
      }).catch(function () { return m; });
      return m || net;
    })
  );
});
