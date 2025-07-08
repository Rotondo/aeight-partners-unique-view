import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import Index from './pages/Index';
import { PrivateRoute } from './components/auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { AuthProvider } from './hooks/useAuth';
import WishlistPage from './pages/wishlist/WishlistPage';
import DiarioPage from './pages/diario';
import EventosPage from './pages/eventos/EventosPage';
import MapaParceirosPage from './pages/mapa-parceiros/MapaParceirosPage';
import OportunidadesPageContainer from './pages/oportunidades';
import OportunidadesDashboardPage from './pages/oportunidades-dashboard';
import IndicadoresPage from './pages/indicadores/IndicadoresPage';
import EmpresasPage from './pages/empresas/EmpresasPage';
import OnePagerPage from './pages/onepager';
import QuadrantePage from './pages/quadrante/QuadrantePage';
import AdminPage from './pages/admin';
import RepositorioPage from './pages/repositorio/RepositorioPage';
import { registerSW, clearServiceWorkerCache } from './serviceWorkerRegistration';
import ErrorBoundary from './components/ErrorBoundary';
import { WishlistProvider } from './contexts/WishlistContext';

function App() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log("[App] Inicializando aplicação...");
    
    // Detectar se app está pronta
    const checkAppReady = () => {
      setTimeout(() => {
        setAppReady(true);
        console.log("[App] Aplicação pronta");
      }, 100);
    };

    checkAppReady();

    // Registrar service worker com gerenciamento de updates
    registerSW((registration) => {
      console.log("[App] Update do service worker disponível");
      setWaitingWorker(registration.waiting);
      setShowUpdateBanner(true);
    });

    // Log de navegação apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log("[App] Renderizando pathname:", window.location.pathname);
    }

    // Monitor de performance básico
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log(`[App] Tempo de carregamento: ${Math.round(entry.duration)}ms`);
        }
      });
    });

    try {
      performanceObserver.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      // Ignorar se não suportado
    }

    return () => {
      performanceObserver.disconnect();
    };
  }, []);

  const handleUpdate = async () => {
    if (waitingWorker) {
      console.log("[App] Aplicando update...");
      
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      waitingWorker.addEventListener('statechange', () => {
        if (waitingWorker.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  const handleDismissUpdate = () => {
    setShowUpdateBanner(false);
  };

  const handleForceRefresh = async () => {
    console.log("[App] Limpando cache e recarregando...");
    
    try {
      const cleared = await clearServiceWorkerCache();
      if (cleared) {
        console.log("[App] Cache limpo com sucesso");
      }
    } catch (error) {
      console.error("[App] Erro ao limpar cache:", error);
    }
    
    window.location.reload();
  };

  // Loading screen enquanto app não está pronta
  if (!appReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-lg text-muted-foreground">Carregando A&eight Partners...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ErrorBoundary>
        <AuthProvider>
          <PrivacyProvider>
            <WishlistProvider>
              <Router>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={
                    <PrivateRoute>
                      <MainLayout>
                        <Index />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/oportunidades" element={
                    <PrivateRoute>
                      <MainLayout>
                        <OportunidadesPageContainer />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/oportunidades-dashboard" element={
                    <PrivateRoute>
                      <MainLayout>
                        <OportunidadesDashboardPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/indicadores" element={
                    <PrivateRoute>
                      <MainLayout>
                        <IndicadoresPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/empresas" element={
                    <PrivateRoute>
                      <MainLayout>
                        <EmpresasPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/onepager" element={
                    <PrivateRoute>
                      <MainLayout>
                        <OnePagerPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/quadrante" element={
                    <PrivateRoute>
                      <MainLayout>
                        <QuadrantePage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/repositorio" element={
                    <PrivateRoute>
                      <MainLayout>
                        <RepositorioPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/wishlist/*" element={
                    <PrivateRoute>
                      <MainLayout>
                        <WishlistPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/diario" element={
                    <PrivateRoute>
                      <MainLayout>
                        <DiarioPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/eventos" element={
                    <PrivateRoute>
                      <MainLayout>
                        <EventosPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/mapa-parceiros" element={
                    <PrivateRoute>
                      <MainLayout>
                        <MapaParceirosPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/admin" element={
                    <PrivateRoute>
                      <MainLayout>
                        <AdminPage />
                      </MainLayout>
                    </PrivateRoute>
                  } />
                </Routes>
              </Router>
            </WishlistProvider>
          </PrivacyProvider>
        </AuthProvider>
      </ErrorBoundary>

      {/* Banner de update aprimorado */}
      {showUpdateBanner && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Nova versão disponível!</span>
              <button
                onClick={handleDismissUpdate}
                className="text-primary-foreground/80 hover:text-primary-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="bg-primary-foreground text-primary px-3 py-1 rounded font-medium hover:opacity-90"
              >
                Atualizar
              </button>
              <button
                onClick={handleForceRefresh}
                className="bg-transparent border border-primary-foreground text-primary-foreground px-3 py-1 rounded hover:bg-primary-foreground/10"
              >
                Forçar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
