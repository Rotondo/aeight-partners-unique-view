const CACHE_NAME = 'aeight-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Estratégia Network First para requisições de navegação (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Verifica se a resposta é válida antes de cachear
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Se a rede falhar, tenta servir do cache
          return caches.match(event.request);
        })
    );
  } else {
    // Estratégia Cache First para outros assets (CSS, JS, imagens, etc.)
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response; // Encontrado no cache
          }
          // Não encontrado no cache, busca na rede e armazena no cache
          return fetch(event.request).then(
            networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                // Não cachear respostas opacas (ex: de CDNs sem CORS) a menos que necessário
                // e não cachear chamadas para APIs de terceiros indiscriminadamente.
                // Para este exemplo, vamos cachear respostas básicas e bem-sucedidas.
                if (networkResponse.type === 'basic' || event.request.url.startsWith(self.location.origin)) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
              }
              return networkResponse;
            }
          ).catch(error => {
            // O fetch pode falhar por vários motivos (offline, DNS, etc.)
            console.warn('[SW] Fetch falhou; retornando resposta de fallback. Request: ', event.request.url, error);
            // Retorna uma resposta de fallback genérica
            return new Response('Offline fallback response', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
});

// Permite skipWaiting via mensagem
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
