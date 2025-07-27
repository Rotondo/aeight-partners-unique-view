import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Index from "./pages/Index";
import LoginPage from "./pages/auth/LoginPage";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import OportunidadesPage from "./pages/oportunidades";
import OportunidadesDashboard from "./pages/oportunidades-dashboard";
import EventosPage from "./pages/eventos/EventosPage";
import QuadrantePage from "./pages/quadrante/QuadrantePage";
import MapaParceirosPage from "./pages/mapa-parceiros/MapaParceirosPage";
import OnePagerPage from "./pages/onepager/OnePagerPage";
import DiarioPage from "./pages/diario";
import AdminPage from "./pages/admin";
import MapaParceiroAdminPage from "./pages/admin/MapaParceiroAdminPage";
import UsuariosAdminPage from "./pages/admin/UsuariosAdminPage";
import WishlistPage from "./pages/wishlist/WishlistPage";
import ClientesSobrepostosPage from "./pages/wishlist/ClientesSobrepostosPage";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CrmProvider } from "./contexts/CrmContext";
import CategoriasPage from "./pages/categorias/CategoriasPage";
import ContatosPage from "./pages/contatos/ContatosPage";
import EmpresasPage from "./pages/empresas/EmpresasPage";
import IndicadoresPage from "./pages/indicadores/IndicadoresPage";
import RepositorioPage from "./pages/repositorio/RepositorioPage";
import NotFoundPage from "./pages/NotFoundPage";
import { PrivacyProvider } from "./contexts/PrivacyContext";
import { IAProvider } from "./contexts/IAContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ReactSafetyProvider } from "./components/ui/ReactSafetyProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  console.log("[App] Rendering main application...");

  return (
    <ReactSafetyProvider>
      <PrivacyProvider>
        <IAProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <ErrorBoundary>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/*"
                    element={
                      <PrivateRoute>
                        <MainLayout>
                          <Routes>
                            <Route index element={<Index />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/oportunidades/*" element={<OportunidadesPage />} />
                            <Route path="/oportunidades-dashboard" element={<OportunidadesDashboard />} />
                            <Route path="/eventos" element={<EventosPage />} />
                            <Route path="/quadrante" element={<QuadrantePage />} />
                            <Route path="/mapa-parceiros" element={<MapaParceirosPage />} />
                            <Route path="/onepager" element={<OnePagerPage />} />
                            <Route path="/diario/*" element={<DiarioPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/mapa-parceiro" element={<MapaParceiroAdminPage />} />
                            <Route path="/admin/usuarios" element={<UsuariosAdminPage />} />
                            <Route path="/wishlist/*" element={<WishlistPage />} />
                            {/* Wrap clientes route with WishlistProvider and CrmProvider */}
                            <Route 
                              path="/clientes" 
                              element={
                                <WishlistProvider>
                                  <CrmProvider>
                                    <ClientesSobrepostosPage />
                                  </CrmProvider>
                                </WishlistProvider>
                              } 
                            />
                            <Route path="/categorias" element={<CategoriasPage />} />
                            <Route path="/contatos" element={<ContatosPage />} />
                            <Route path="/empresas" element={<EmpresasPage />} />
                            <Route path="/indicadores" element={<IndicadoresPage />} />
                            <Route path="/repositorio" element={<RepositorioPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </MainLayout>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </ErrorBoundary>
              <Toaster />
              <Sonner />
              <SpeedInsights />
            </Router>
          </QueryClientProvider>
        </IAProvider>
      </PrivacyProvider>
    </ReactSafetyProvider>
  );
}

export default App;
