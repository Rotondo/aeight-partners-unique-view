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
import OportunidadesPageContainer from './pages/oportunidades';
import OportunidadesDashboardPage from './pages/oportunidades-dashboard';
import IndicadoresPage from './pages/indicadores/IndicadoresPage';
import EmpresasPage from './pages/empresas/EmpresasPage';
import OnePagerPage from './pages/onepager';
import QuadrantePage from './pages/quadrante/QuadrantePage';
import AdminPage from './pages/admin';
import RepositorioPage from './pages/repositorio/RepositorioPage';
import EmpresasClientesPage from './pages/wishlist/EmpresasClientesPage';
import { registerSW } from './serviceWorkerRegistration';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    registerSW((registration) => {
      setWaitingWorker(registration.waiting);
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      waitingWorker.addEventListener('statechange', (event) => {
        if (waitingWorker.state === 'activated') {
          window.location.reload();
        }
      });
    }
  };

  // Log global de navegação
  useEffect(() => {
    console.log("[App] Renderizando pathname:", window.location.pathname);
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ErrorBoundary>
        <AuthProvider>
          <PrivacyProvider>
            <Router>
              <Routes>
                {/* ... todas as rotas mantidas ... */}
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
                <Route path="/admin" element={
                  <PrivateRoute>
                    <MainLayout>
                      <AdminPage />
                    </MainLayout>
                  </PrivateRoute>
                } />
              </Routes>
            </Router>
          </PrivacyProvider>
        </AuthProvider>
      </ErrorBoundary>
      {waitingWorker && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 1000,
          background: '#4a90e2', color: 'white', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <span>Há uma nova versão disponível!</span>
          <button
            onClick={handleUpdate}
            style={{
              marginLeft: 16,
              background: 'white',
              color: '#4a90e2',
              border: 'none',
              borderRadius: 4,
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Atualizar agora
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
