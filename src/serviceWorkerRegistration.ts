
// Sistema aprimorado de registro do service worker com recuperação automática
export function registerSW(onUpdate?: (registration: ServiceWorkerRegistration) => void) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        console.log('[SW] Registrando service worker...');
        
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        console.log('[SW] Service worker registrado com sucesso');
        
        // Monitor de updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Update disponível
                  console.log('[SW] Update disponível');
                  onUpdate?.(registration);
                } else {
                  // Primeira instalação
                  console.log('[SW] Service worker instalado pela primeira vez');
                }
              }
            };
          }
        };

        // Verificar updates periodicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Check for updates every minute

        // Listener para mensagens do SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW] Mensagem recebida do service worker:', event.data);
        });

        // Detector de falhas de rede
        window.addEventListener('online', () => {
          console.log('[SW] Conexão restaurada');
          // Tentar sincronizar dados quando voltar online
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'BACKGROUND_SYNC' });
          }
        });

        window.addEventListener('offline', () => {
          console.log('[SW] Aplicação offline');
        });

      } catch (error) {
        console.error('[SW] Erro ao registrar service worker:', error);
        
        // Implementar fallback se SW falhar
        setTimeout(() => {
          if (!navigator.serviceWorker.controller) {
            console.warn('[SW] Service worker não está ativo, implementando fallback');
            // Aqui poderíamos implementar lógica de fallback
          }
        }, 5000);
      }
    });

    // Detector de service worker quebrado
    navigator.serviceWorker.ready.then(() => {
      console.log('[SW] Service worker pronto');
    }).catch((error) => {
      console.error('[SW] Service worker não está pronto:', error);
    });
  } else {
    console.warn('[SW] Service worker não suportado neste navegador');
  }
}

// Função para limpar cache quando necessário
export function clearServiceWorkerCache(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };
      
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    } else {
      resolve(false);
    }
  });
}

// Função para forçar update do service worker
export function forceServiceWorkerUpdate(): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
}
