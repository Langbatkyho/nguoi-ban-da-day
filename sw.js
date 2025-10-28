const CACHE_NAME = 'gastrohealth-ai-cache-v2'; // Cache version updated
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: Cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch: Implement a network-falling-back-to-cache strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we get a valid response, cache it and return it
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            // Cache the resource for future offline use.
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // If the network request fails, try to get it from the cache
        console.log('Network request failed. Trying to serve from cache:', event.request.url);
        return caches.match(event.request);
      })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
