
const CACHE_NAME = 'aeight-pwa-cache-v2';
const FALLBACK_CACHE = 'aeight-fallback-cache-v1';

// URLs essenciais para cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// URLs de fallback para offline
const fallbackUrls = [
  '/',
  '/index.html'
];

// Estratégia de cache mais inteligente
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache principal
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching essential files');
          return cache.addAll(urlsToCache);
        }),
      
      // Cache de fallback
      caches.open(FALLBACK_CACHE)
        .then(cache => {
          console.log('Service Worker: Caching fallback files');
          return cache.addAll(fallbackUrls);
        })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      // Force activate immediately
      self.skipWaiting();
    })
  );
});

// Estratégia de fetch com fallback inteligente
self.addEventListener('fetch', event => {
  // Ignorar requests não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone request para usar
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Verificar se response é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response para cache
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Apenas cache GET requests
                if (event.request.method === 'GET') {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // Network failed, try fallback
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // For other requests, return from fallback cache
            return caches.match(event.request, { cacheName: FALLBACK_CACHE });
          });
      })
  );
});

// Limpeza automática de cache desatualizado
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME && key !== FALLBACK_CACHE) {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('Service Worker: Activation complete');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Melhor detecção de updates
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Skipping waiting...');
    self.skipWaiting();
  }
  
  // Comando para limpar cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(keyList.map(key => caches.delete(key)));
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Sync em background para recuperar dados quando online
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui podería implementar sync de dados quando voltar online
      Promise.resolve()
    );
  }
});

// Notificação de erro para debugging
self.addEventListener('error', event => {
  console.error('Service Worker: Error', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker: Unhandled rejection', event.reason);
});
