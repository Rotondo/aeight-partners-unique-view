import * as React from 'react';
import { Suspense, lazy, useState } from 'react';
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

// Comprehensive React validation before any component usage
if (!React || !React.useState || !React.useEffect || !React.Suspense || typeof React.lazy !== 'function') {
  console.error('[App] React is not properly initialized:', {
    React: !!React,
    useState: !!React?.useState,
    useEffect: !!React?.useEffect,
    Suspense: !!React?.Suspense,
    lazy: typeof React?.lazy
  });
  
  // Emergency fallback - reload the page
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

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

const queryClient = new QueryClient();

function App() {
  // Additional runtime safety check
  if (!React || !useState || !Suspense || typeof lazy !== 'function') {
    console.error('[App] React hooks not available at runtime');
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
          <h1 style={{ color: '#dc2626', marginBottom: '1rem' }}>React Initialization Error</h1>
          <p style={{ marginBottom: '1rem' }}>React hooks are not available. Please reload the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

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
}

export default App;
