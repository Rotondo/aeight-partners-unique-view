
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/Dashboard";
import OnePagerPage from "./pages/onepager/OnePagerPage";
import QuadrantePage from "./pages/quadrante/QuadrantePage";
import OportunidadesPage from "./pages/oportunidades";
import AdminPage from "./pages/admin";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import PrivateRoute from "./components/auth/PrivateRoute";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route 
                path="/" 
                element={
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                } 
              />
              <Route 
                path="/onepager" 
                element={
                  <MainLayout>
                    <OnePagerPage />
                  </MainLayout>
                } 
              />
              <Route 
                path="/quadrante" 
                element={
                  <MainLayout>
                    <QuadrantePage />
                  </MainLayout>
                } 
              />
              <Route 
                path="/oportunidades" 
                element={<OportunidadesPage />} 
              />
              <Route 
                path="/admin" 
                element={<AdminPage />} 
              />
              {/* Add more protected routes here */}
            </Route>

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
