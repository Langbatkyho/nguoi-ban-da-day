const CACHE_NAME = 'gastrohealth-ai-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx', // Hoặc file JS đã được biên dịch
  // Thêm các file CSS, ảnh, font... quan trọng khác vào đây
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Trả về từ cache nếu có
        }
        return fetch(event.request); // Nếu không, fetch từ mạng
      })
  );
});