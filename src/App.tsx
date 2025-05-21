import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import OportunidadesPage from "@/pages/oportunidades/OportunidadesPage";
import IndicadoresPage from "@/pages/indicadores/IndicadoresPage";
import EmpresasPage from "@/pages/empresas/EmpresasPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/LoginPage";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider } from "@/hooks/useAuth";
import PrivateRoute from "@/components/PrivateRoute";
import OnePagerPage from "@/pages/onepager/OnePagerPage";
import QuadrantePage from "@/pages/quadrante/QuadrantePage";
import Admin from "@/pages/admin";
import { Toaster } from "@/components/ui/toaster";

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <React.Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* Rotas internas protegidas */}
            <Route index element={<DashboardPage />} />
            <Route path="oportunidades" element={<OportunidadesPage />} />
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
