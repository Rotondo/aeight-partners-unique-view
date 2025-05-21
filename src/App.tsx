import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import OportunidadesPage from "@/pages/oportunidades/OportunidadesPage";
import EmpresasPage from "@/pages/empresas/EmpresasPage";
import OnePagerPage from "@/pages/onepager/OnePagerPage";
import IndicadoresPage from "@/pages/indicadores/IndicadoresPage";
import LoadingScreen from "@/components/ui/LoadingScreen";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/LoginPage";
import PrivateRoute from "@/components/PrivateRoute";

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
                <MainLayout>
                  {/* O conteúdo das rotas será exibido aqui */}
                </MainLayout>
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="oportunidades" element={<OportunidadesPage />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="onepager" element={<OnePagerPage />} />
            <Route path="indicadores" element={<IndicadoresPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </React.Suspense>
    </AuthProvider>
  </Router>
);

export default App;
