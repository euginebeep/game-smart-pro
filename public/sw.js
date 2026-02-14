const CACHE_NAME = 'eugine-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  // Skip all API/backend calls and OAuth
  const url = request.url;
  if (
    url.includes('/functions/') || 
    url.includes('supabase.co') || 
    url.includes('supabase.in') ||
    url.includes('api-sports.io') || 
    url.includes('/~oauth') ||
    url.includes('/rest/') ||
    url.includes('/auth/') ||
    url.includes('/realtime/')
  ) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') return caches.match('/');
          return new Response('Offline', { status: 503 });
        })
      )
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'EUGINE', {
      body: data.body || 'Novas análises disponíveis!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon.svg',
      tag: data.tag || 'eugine-notification',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});