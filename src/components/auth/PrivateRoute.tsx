
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  console.log("[PrivateRoute] ETAPA 1 - Estado atual:", { 
    user: !!user, 
    isAuthenticated, 
    loading, 
    error,
    pathname: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Se há erro crítico de autenticação
  if (error && !loading) {
    console.error("[PrivateRoute] ETAPA 1 - Erro de autenticação:", error);
    return <Navigate to="/login" state={{ from: location, error }} replace />;
  }

  // Mostrar loading apenas por 3 segundos máximo para ETAPA 1
  if (loading) {
    console.log("[PrivateRoute] ETAPA 1 - Aguardando autenticação (máximo 3s)...");
    return <LoadingScreen timeout={3000} />;
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    console.log("[PrivateRoute] ETAPA 1 - Redirecionando para login - não autenticado");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se usuário inativo, redirecionar para login
  if (user.ativo === false) {
    console.log("[PrivateRoute] ETAPA 1 - Redirecionando para login - usuário inativo");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("[PrivateRoute] ETAPA 1 - ✅ Acesso permitido para:", user.nome || user.email);
  return <>{children}</>;
};
