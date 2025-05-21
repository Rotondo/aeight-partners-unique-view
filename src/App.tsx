
import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Page imports
import Dashboard from "./pages/Dashboard";
import Oportunidades from "./pages/oportunidades";
import OportunidadesDashboardPage from "./pages/oportunidades-dashboard";
import Admin from "./pages/admin"; 
import OnePagerPage from "./pages/onepager/OnePagerPage";
import QuadrantePage from "./pages/quadrante/QuadrantePage";
import LoginPage from "./pages/auth/LoginPage";
import NotFound from "./pages/NotFound";

// Auth components
import PrivateRoute from "./components/auth/PrivateRoute";
import { useAuth } from "./hooks/useAuth"; 
import { Toaster } from "./components/ui/toaster";

function App() {
  const { user, isAuthenticated } = useAuth();
  
  // Update page title
  useEffect(() => {
    document.title = "A&eight Partnership Hub";
  }, []);
  
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              {/* Use element prop instead of children */}
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/oportunidades"
          element={
            <PrivateRoute>
              <Oportunidades />
            </PrivateRoute>
          }
        />
        <Route
          path="/oportunidades-dashboard"
          element={
            <PrivateRoute>
              <OportunidadesDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          }
        />
        <Route
          path="/onepager/*"
          element={
            <PrivateRoute>
              <OnePagerPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/quadrante"
          element={
            <PrivateRoute>
              <QuadrantePage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate replace to="/404" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
