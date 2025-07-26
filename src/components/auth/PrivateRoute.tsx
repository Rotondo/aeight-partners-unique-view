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

  console.log("[PrivateRoute] Estado atual:", { 
    user: !!user, 
    isAuthenticated, 
    loading, 
    error,
    pathname: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Se há erro crítico de autenticação
  if (error && !loading) {
    console.error("[PrivateRoute] Erro de autenticação:", error);
    return <Navigate to="/login" state={{ from: location, error }} replace />;
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log("[PrivateRoute] Aguardando autenticação...");
    return <LoadingScreen timeout={10000} />;
  }

  // Se não autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    console.log("[PrivateRoute] Redirecionando para login - não autenticado");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se usuário inativo, redirecionar para login
  if (user.ativo === false) {
    console.log("[PrivateRoute] Redirecionando para login - usuário inativo");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("[PrivateRoute] Acesso permitido para:", user.nome || user.email);
  return <>{children}</>;
};