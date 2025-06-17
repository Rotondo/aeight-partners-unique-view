
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useAuth';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import MainLayout from '@/components/layout/MainLayout';
import PrivateRoute from '@/components/auth/PrivateRoute';

// Pages
import Index from '@/pages/Index';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import AdminPage from '@/pages/admin';
import EmpresasPage from '@/pages/empresas/EmpresasPage';
import IndicadoresPage from '@/pages/indicadores/IndicadoresPage';
import OnePagerPage from '@/pages/onepager/OnePagerPage';
import OportunidadesPage from '@/pages/oportunidades';
import OportunidadesDashboard from '@/pages/oportunidades-dashboard';
import QuadrantePage from '@/pages/quadrante/QuadrantePage';
import RepositorioPage from '@/pages/repositorio/RepositorioPage';
import WishlistPage from '@/pages/wishlist/WishlistPage';
import DiarioPage from '@/pages/diario';
import NotFoundPage from '@/pages/NotFoundPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PrivacyProvider>
          <WishlistProvider>
            <Router>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                      <PrivateRoute>
                        <MainLayout />
                      </PrivateRoute>
                    }>
                      <Route index element={<Index />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="empresas" element={<EmpresasPage />} />
                      <Route path="indicadores" element={<IndicadoresPage />} />
                      <Route path="onepager" element={<OnePagerPage />} />
                      <Route path="oportunidades" element={<OportunidadesPage />} />
                      <Route path="oportunidades-dashboard" element={<OportunidadesDashboard />} />
                      <Route path="quadrante" element={<QuadrantePage />} />
                      <Route path="repositorio" element={<RepositorioPage />} />
                      <Route path="wishlist/*" element={<WishlistPage />} />
                      <Route path="diario" element={<DiarioPage />} />
                      <Route path="admin" element={<AdminPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </div>
              </SidebarProvider>
            </Router>
          </WishlistProvider>
        </PrivacyProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
