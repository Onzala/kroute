/* 韓國找路 service worker：快取 App 殼層，讓沒有網路時仍能開清單、看韓文地址、用「給司機看」。
   Google、Kakao 的 API 一律不快取（搜尋本來就需要網路）。改版時把 VERSION 加 1。 */
'use strict';
const VERSION = 'v0.5.0';
const SHELL = 'kroute-shell-' + VERSION;
const FONTS = 'kroute-fonts-v1';
const SHELL_FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n.startsWith('kroute-') && n !== SHELL && n !== FONTS).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 字型：先用快取，背景更新
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  if (url.origin !== self.location.origin) return; // Google、Kakao 等外部請求不處理

  // 頁面（含 Android 分享進來的 ?share=…）：網路優先，失敗時用快取的殼層
  if (req.mode === 'navigate') {
    e.respondWith(
      // no-cache：一定向伺服器確認新版，避免瀏覽器 HTTP 快取（GitHub Pages 預設 10 分鐘）拿到舊頁面
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put('./index.html', copy)); }
        return r;
      }).catch(() => caches.match('./index.html', { ignoreSearch: true }))
    );
    return;
  }

  // config.js（共用金鑰）：網路優先，換金鑰後馬上生效；離線時用快取
  if (url.pathname.endsWith('/config.js')) {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache' }).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(SHELL).then(c => c.put('./config.js', copy)); }
        return r;
      }).catch(() => caches.match('./config.js'))
    );
    return;
  }

  // 其他同站檔案：快取優先
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
