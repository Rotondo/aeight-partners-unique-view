
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import MainLayout from '@/components/layout/MainLayout';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { CrmProvider } from '@/contexts/CrmContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { ReactSafetyProvider } from '@/components/ui/ReactSafetyProvider';

// Imports for all pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import { OportunidadesPage } from '@/components/oportunidades/OportunidadesPage';
import EmpresasPage from '@/pages/empresas/EmpresasPage';
import ContatosPage from '@/pages/contatos/ContatosPage';
import CategoriasPage from '@/pages/categorias/CategoriasPage';
import IndicadoresPage from '@/pages/indicadores/IndicadoresPage';
import AdminPage from '@/pages/admin.tsx';
import MapaParceirosPage from '@/pages/mapa-parceiros/MapaParceirosPage';
import OnePagerPage from '@/pages/onepager/OnePagerPage';
import RepositorioPage from '@/pages/repositorio/RepositorioPage';
import QuadrantePage from '@/pages/quadrante/QuadrantePage';
import EventosPage from '@/pages/eventos/EventosPage';
import WishlistPage from '@/pages/wishlist/WishlistPage';
import DiarioPage from '@/pages/diario/index';
import NotFoundPage from '@/pages/NotFoundPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <ReactSafetyProvider>
      <QueryClientProvider client={queryClient}>
        <PrivacyProvider>
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
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              <Route path="/oportunidades" element={
                <PrivateRoute>
                  <MainLayout>
                    <OportunidadesPage />
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
              <Route path="/contatos" element={
                <PrivateRoute>
                  <MainLayout>
                    <ContatosPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              <Route path="/categorias" element={
                <PrivateRoute>
                  <MainLayout>
                    <CategoriasPage />
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
              <Route path="/admin" element={
                <PrivateRoute>
                  <MainLayout>
                    <AdminPage />
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
              <Route path="/onepager" element={
                <PrivateRoute>
                  <MainLayout>
                    <OnePagerPage />
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
              <Route path="/quadrante" element={
                <PrivateRoute>
                  <MainLayout>
                    <QuadrantePage />
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
              <Route path="/clientes/*" element={
                <PrivateRoute>
                  <MainLayout>
                    <WishlistProvider autoLoad={true}>
                      <CrmProvider>
                        <WishlistPage />
                      </CrmProvider>
                    </WishlistProvider>
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
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </Router>
        </PrivacyProvider>
      </QueryClientProvider>
    </ReactSafetyProvider>
  );
}

export default App;
