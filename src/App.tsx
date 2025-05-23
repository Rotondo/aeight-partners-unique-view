
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import { OportunidadesPage } from "@/components/oportunidades/OportunidadesPage";
import IndicadoresPage from "@/pages/indicadores/IndicadoresPage";
import EmpresasPage from "@/pages/empresas/EmpresasPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/auth/LoginPage";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider } from "@/hooks/useAuth";
import OnePagerPage from "@/pages/onepager/OnePagerPage";
import QuadrantePage from "@/pages/quadrante/QuadrantePage";
import Admin from "@/pages/admin";
import { Toaster } from "@/components/ui/toaster";
import OportunidadesDashboardPage from "@/pages/oportunidades-dashboard";

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <React.Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainLayout />}>
            {/* Rotas livres - sem proteção de autenticação */}
            <Route index element={<DashboardPage />} />
            <Route path="oportunidades" element={<OportunidadesPage />} />
            <Route path="oportunidades-dashboard" element={<OportunidadesDashboardPage />} />
            <Route path="indicadores" element={<IndicadoresPage />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="onepager/*" element={<OnePagerPage />} />
            <Route path="quadrante" element={<QuadrantePage />} />
            <Route path="admin" element={<Admin />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </React.Suspense>
    </AuthProvider>
  </Router>
);

export default App;
