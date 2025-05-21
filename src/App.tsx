import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import NotFoundPage from "@/pages/NotFoundPage";
import LoginPage from "@/pages/LoginPage";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { AuthProvider } from "@/hooks/useAuth";
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
                  <DashboardPage />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </React.Suspense>
    </AuthProvider>
  </Router>
);

export default App;
