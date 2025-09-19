const CACHE_NAME = 'prodtalent-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/assets/index.css',
  '/assets/index.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie Cache First pour les ressources statiques
self.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetch', event.request.url);

  // Stratégie différente selon le type de requête
  if (event.request.destination === 'document') {
    // Pour les pages HTML : Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Mettre en cache si la réponse est valide
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Si offline, chercher dans le cache
          return caches.match(event.request).then((response) => {
            return response || caches.match('/');
          });
        })
    );
  } else {
    // Pour les autres ressources : Cache First
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Mettre en cache si la réponse est valide
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Gestion des notifications push (pour plus tard)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');

  const options = {
    body: event.data ? event.data.text() : 'Nouveau message sur ProdTalent',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'prodtalent-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Ouvrir l\'app'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ProdTalent', options)
  );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click');

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});