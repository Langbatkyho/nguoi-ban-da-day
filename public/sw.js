// Incrementing cache version to ensure the new service worker is installed.
const CACHE_NAME = 'gastrohealth-ai-cache-v6-control';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install event started.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell:', URLS_TO_CACHE);
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] App shell cached successfully.');
      })
      .catch(error => {
        console.error('[Service Worker] Caching failed during install:', error);
      })
  );
});

// This listener allows the client to command the SW to activate immediately or show notifications.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message. Activating now.');
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    console.log('[Service Worker] Showing notification:', title, options);
    event.waitUntil(self.registration.showNotification(title, options));
  }
});


self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event started.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('[Service Worker] Old caches cleaned up.');
        return self.clients.claim(); // Take control of all open pages.
    })
  );
});


self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
