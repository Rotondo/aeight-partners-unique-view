const CACHE_NAME = 'aeight-pwa-cache-v3'; // Atualizado para forçar refresh
const FALLBACK_CACHE = 'aeight-fallback-cache-v2';

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

// Estratégia Network-First para HTML, Cache-First para outros assets
self.addEventListener('fetch', event => {
  // Ignorar requests não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Network-First para navegação (HTML)
  if (event.request.destination === 'document' || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se network responde, cache e retorna
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se network falha, tenta cache
          return caches.match(event.request)
            .then(response => {
              if (response) {
                return response;
              }
              // Último recurso: fallback para index.html
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Cache-First para outros assets (JS, CSS, imagens, etc.)
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
            console.warn('[SW] Fetch falhou; retornando resposta de fallback. Request: ', event.request.url);
            return caches.match(event.request, { cacheName: FALLBACK_CACHE })
              .then(fallbackResponse => {
                if (fallbackResponse) {
                  return fallbackResponse;
                }
                // Se não há fallback específico, retorne uma resposta de erro controlada
                return new Response('Offline fallback response', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'text/plain' }
                });
              });
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
        if (event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
  
  // Background sync
  if (event.data && event.data.type === 'BACKGROUND_SYNC') {
    event.waitUntil(
      // Implementar sync de dados quando necessário
      Promise.resolve()
    );
  }
});

// Sync em background para recuperar dados quando online
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui poderia implementar sync de dados quando voltar online
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