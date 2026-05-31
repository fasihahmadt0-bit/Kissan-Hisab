/* ════════════════════════════════════════
   Kissan Hisab — Service Worker v1.0
   Handles: offline caching, push notifications,
            periodic background sync, notification clicks
════════════════════════════════════════ */

const CACHE_NAME   = 'kissan-v1';
const ASSETS       = ['/', '/index.html', '/manifest.json', '/icon.svg'];
const NOTIF_ICON   = '/icon.svg';
const NOTIF_BADGE  = '/icon.svg';

/* ── INSTALL: cache all app files ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE: clean old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH: cache-first for app files, network-first for everything else ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Cache new files on the fly
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
            }
            return response;
          })
          .catch(() => caches.match('/index.html')); // fallback to app shell
      })
  );
});

/* ── PUSH: handle server-sent push notifications (optional) ── */
self.addEventListener('push', event => {
  let data = { title: 'Kissan Hisab', body: 'You have a new notification.' };
  try { data = event.data.json(); } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    NOTIF_ICON,
      badge:   NOTIF_BADGE,
      tag:     data.tag || 'kissan-push',
      data:    data.url || '/',
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    })
  );
});

/* ── PERIODIC SYNC: check overdue items daily (Chrome Android) ── */
self.addEventListener('periodicsync', event => {
  if (event.tag === 'overdue-check') {
    event.waitUntil(runOverdueCheck());
  }
});

async function runOverdueCheck() {
  // Read data from IndexedDB (localStorage is not accessible in SW)
  try {
    const db  = await openDB();
    const ar  = await dbGetAll(db, 'receivables');
    const ap  = await dbGetAll(db, 'payables');
    const today = new Date().toISOString().split('T')[0];

    const arOver = ar.filter(x => x.status === 'pending' && x.due && x.due < today);
    const apOver = ap.filter(x => x.status === 'pending' && x.due && x.due < today);

    if (!arOver.length && !apOver.length) return;

    const lines = [];
    if (arOver.length) lines.push(`📥 ${arOver.length} overdue receivable${arOver.length > 1 ? 's' : ''}`);
    if (apOver.length) lines.push(`📤 ${apOver.length} overdue payable${apOver.length > 1 ? 's' : ''}`);

    await self.registration.showNotification('Kissan Hisab ⚠️', {
      body:    lines.join('\n'),
      icon:    NOTIF_ICON,
      badge:   NOTIF_BADGE,
      tag:     'overdue-daily',
      renotify: true,
      vibrate: [300, 100, 300, 100, 300],
      data:    '/?page=accounts',
    });
  } catch (e) {
    // If IDB unavailable, skip silently
  }
}

/* ── NOTIFICATION CLICK: open app ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        // Focus existing window if open
        const existing = clients.find(c => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          return existing.navigate(url);
        }
        // Otherwise open new window
        return self.clients.openWindow(url);
      })
  );
});

/* ── NOTIFICATION CLOSE ── */
self.addEventListener('notificationclose', _event => {
  // Analytics hook — not used
});

/* ══════════════════════════════════════
   MINI IndexedDB HELPER
   (SW cannot access localStorage)
══════════════════════════════════════ */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('kissan_db', 1);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      ['entries','receivables','payables','categories'].forEach(store => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function dbGetAll(db, store) {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = e => resolve(e.target.result || []);
    req.onerror   = e => reject(e.target.error);
  });
}
