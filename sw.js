
const CACHE_NAME = 'gastrohealth-ai-cache-v3'; // Increased version number
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event: cache the core app shell files.
self.addEventListener('install', event => {
  console.log('[Service Worker] Attempting to install...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Installation successful');
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event: take control of the page immediately.
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(self.clients.claim());
});

// We are intentionally leaving out the 'fetch' event listener for now
// to ensure the installation part works correctly first.
