
import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { AuthProvider } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Enhanced React validation
const validateReactHooks = () => {
  return React && 
    React.useState && 
    React.useEffect && 
    React.Suspense && 
    React.lazy &&
    typeof React.useState === 'function' &&
    typeof React.useEffect === 'function' &&
    typeof React.Suspense === 'function' &&
    typeof React.lazy === 'function';
};

// Only load components after React validation
const Index = lazy(() => import('@/pages/Index'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AdminPage = lazy(() => import('@/components/admin/AdminPage'));
const MapaParceirosPage = lazy(() => import('@/pages/mapa-parceiros/MapaParceirosPage'));
const EmpresasPage = lazy(() => import('@/pages/empresas/EmpresasPage'));
const CategoriasPage = lazy(() => import('@/pages/categorias/CategoriasPage'));
const ContatosPage = lazy(() => import('@/pages/contatos/ContatosPage'));
const ClientesPage = lazy(() => import('@/pages/wishlist/ClientesSobrepostosPage'));
const IndicadoresPage = lazy(() => import('@/pages/indicadores/IndicadoresPage'));
const OnePagersPage = lazy(() => import('@/pages/onepager'));
const RepositorioPage = lazy(() => import('@/pages/repositorio/RepositorioPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const EventosPage = lazy(() => import('@/pages/eventos/EventosPage'));
const MetasOportunidadesPage = lazy(() => import('@/pages/indicadores/IndicadoresPage'));
const OportunidadesPage = lazy(() => import('@/pages/oportunidades/index'));
const OportunidadesDashboardPage = lazy(() => import('@/pages/oportunidades-dashboard'));
const QuadrantePage = lazy(() => import('@/pages/quadrante'));
const DiarioPage = lazy(() => import('@/pages/diario'));
const MapaParceiroAdminPage = lazy(() => import('@/pages/admin/MapaParceiroAdminPage'));

// Safe App Content component
const AppContent: React.FC<{ queryClient: QueryClient }> = ({ queryClient }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrivacyProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={
                  <Suspense fallback={<LoadingScreen />}>
                    <LoginPage />
                  </Suspense>
                } />
                
                <Route path="/" element={<MainLayout />}>
                  <Route index element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Index />
                    </Suspense>
                  } />
                  
                  <Route path="/mapa-parceiros" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <MapaParceirosPage />
                    </Suspense>
                  } />

                  <Route path="/empresas" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <EmpresasPage />
                    </Suspense>
                  } />

                  <Route path="/categorias" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <CategoriasPage />
                    </Suspense>
                  } />

                  <Route path="/contatos" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ContatosPage />
                    </Suspense>
                  } />

                  <Route path="/clientes" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <ClientesPage />
                    </Suspense>
                  } />

                  <Route path="/indicadores" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <IndicadoresPage />
                    </Suspense>
                  } />

                  <Route path="/one-pagers" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <OnePagersPage />
                    </Suspense>
                  } />

                  <Route path="/repositorio" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <RepositorioPage />
                    </Suspense>
                  } />

                  <Route path="/wishlist/*" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <WishlistPage />
                    </Suspense>
                  } />

                  <Route path="/eventos" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <EventosPage />
                    </Suspense>
                  } />

                  <Route path="/metas-oportunidades" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <MetasOportunidadesPage />
                    </Suspense>
                  } />

                  <Route path="/oportunidades" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <OportunidadesPage />
                    </Suspense>
                  } />

                  <Route path="/oportunidades-dashboard" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <OportunidadesDashboardPage />
                    </Suspense>
                  } />

                  <Route path="/quadrante" element={
                    <Suspense fallback={<LoadingScreen />}>
                      <QuadrantePage />
                    </Suspense>
                  } />

                  <Route path="/diario" element={
                    <PrivateRoute>
                      <Suspense fallback={<LoadingScreen />}>
                        <DiarioPage />
                      </Suspense>
                    </PrivateRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <PrivateRoute>
                      <Suspense fallback={<LoadingScreen />}>
                        <AdminPage />
                      </Suspense>
                    </PrivateRoute>
                  } />

                  <Route path="/admin/mapa-parceiros" element={
                    <PrivateRoute>
                      <Suspense fallback={<LoadingScreen />}>
                        <MapaParceiroAdminPage />
                      </Suspense>
                    </PrivateRoute>
                  } />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PrivacyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Main App component with React initialization protection
function App() {
  const [isReactReady, setIsReactReady] = useState(false);
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);

  useEffect(() => {
    console.log('[App] Checking React initialization...');
    
    // Comprehensive React validation with retry mechanism
    const checkReactReady = () => {
      if (validateReactHooks()) {
        console.log('[App] React is fully initialized');
        setQueryClient(new QueryClient());
        setIsReactReady(true);
      } else {
        console.log('[App] React not ready, retrying in 100ms...');
        setTimeout(checkReactReady, 100);
      }
    };

    checkReactReady();
  }, []);

  // Don't render anything until React is fully ready
  if (!isReactReady || !queryClient) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'system-ui',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <h1 style={{ color: '#3b82f6', marginBottom: '1rem' }}>Initializing React...</h1>
          <p>Please wait while the application loads.</p>
        </div>
      </div>
    );
  }

  return <AppContent queryClient={queryClient} />;
}

export default App;
