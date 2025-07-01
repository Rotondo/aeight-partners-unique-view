
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log("[PrivateRoute] Estado atual:", { 
    user: !!user, 
    isAuthenticated, 
    loading, 
    pathname: location.pathname 
  });

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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

  console.log("[PrivateRoute] Acesso permitido para:", user.nome);
  return <>{children}</>;
};
