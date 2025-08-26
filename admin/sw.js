// Service Worker for 0000space Admin Panel
const CACHE_NAME = 'admin-v1';
const urlsToCache = [
  '/admin/',
  '/admin/index.html',
  '/admin/login.html',
  '/admin/admin.css',
  '/admin/admin.js',
  '/admin/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache error:', err);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip GitHub API requests
  if (event.request.url.includes('api.github.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Only cache admin panel resources
          if (event.request.url.includes('/admin/')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (event.request.destination === 'document') {
          return caches.match('/admin/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Background sync for offline updates
self.addEventListener('sync', event => {
  if (event.tag === 'sync-events') {
    event.waitUntil(syncEvents());
  }
});

async function syncEvents() {
  // This would sync local changes with GitHub when back online
  console.log('Syncing events with server...');
}

// Push notifications (future feature)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Crect width="192" height="192" fill="%23000"/%3E%3Ctext x="96" y="96" font-family="Arial" font-size="80" font-weight="300" fill="%23fff" text-anchor="middle" dominant-baseline="middle"%3E00%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"%3E%3Crect width="192" height="192" fill="%23000"/%3E%3Ctext x="96" y="96" font-family="Arial" font-size="80" font-weight="300" fill="%23fff" text-anchor="middle" dominant-baseline="middle"%3E00%3C/text%3E%3C/svg%3E',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('0000space Admin', options)
  );
});