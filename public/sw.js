// AethLife Service Worker — Offline-First PWA
// Hosted on Vercel (aethlife.vercel.app)

const CACHE_VERSION = 'v1';
const CACHE_NAME = `aethlife-${CACHE_VERSION}`;
const STATIC_CACHE = `aethlife-static-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[AethLife SW] Install error:', err))
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // API routes — network only, never cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'offline', message: 'This action requires an internet connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Supabase — network only
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets — cache first with network fallback
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Pages — network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.destination === 'document') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.destination === 'document') return caches.match('/');
          return new Response('Offline', { status: 503 });
        })
      )
  );
});

// ── Background Sync ───────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'aethlife-sync') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_START' }));
      })
    );
  }
});

// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'AethLife', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'AethLife', {
      body: payload.body ?? '',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: payload.tag ?? 'aethlife-notification',
      data: payload.data ?? {},
      vibrate: [200, 100, 200],
      requireInteraction: payload.requireInteraction ?? false,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
