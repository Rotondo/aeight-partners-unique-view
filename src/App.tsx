import { Suspense, lazy } from 'react';
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
import React from 'react';

const Index = lazy(() => import('@/pages/Index'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AdminPage = lazy(() => import('@/components/admin/AdminPage'));
const MapaParceirosPage = lazy(() => import('@/pages/mapa-parceiros/MapaParceirosPage'));
const EmpresasPage = lazy(() => import('@/pages/empresas/EmpresasPage'));
const CategoriasPage = lazy(() => import('@/pages/categorias/CategoriasPage'));
const ContatosPage = lazy(() => import('@/pages/contatos/ContatosPage'));
const ClientesPage = lazy(() => import('@/pages/wishlist/ClientesSobrepostosPage'));
const IndicadoresPage = lazy(() => import('@/pages/indicadores/IndicadoresPage'));
const OnePagersPage = lazy(() => import('@/pages/onepager/OnePagerPage'));
const RepositorioPage = lazy(() => import('@/pages/repositorio/RepositorioPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const EventosPage = lazy(() => import('@/pages/eventos/EventosPage'));
const MetasOportunidadesPage = lazy(() => import('@/pages/indicadores/IndicadoresPage'));
const OportunidadesPage = lazy(() => import('@/pages/oportunidades/index'));
const MapaParceiroAdminPage = lazy(() => import('@/pages/admin/MapaParceiroAdminPage'));

const queryClient = new QueryClient();

function App() {
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

                  <Route path="/wishlist" element={
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
}

export default App;
