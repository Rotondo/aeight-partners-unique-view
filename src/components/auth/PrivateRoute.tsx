
import React from "react";
import { Navigate, useLocation } from "react-router-dom"; // Adicionado Navigate e useLocation
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";
// LoginForm não é mais renderizado diretamente aqui, então pode ser removido se não houver outro uso.
// Por enquanto, vou manter caso haja outros usos ou para referência.
// import LoginForm from "./LoginForm";

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation(); // Hook para obter a localização atual

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) { // Apenas isAuthenticated é suficiente aqui, user será null se não autenticado
    // Redireciona para a página de login, guardando a localização original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Enhanced admin check with proper validation
  // Verifica se o usuário existe antes de acessar 'papel'
  if (requireAdmin && user.papel !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Acesso Negado
          </h2>
          <p className="text-red-600">
            Você não tem permissão para acessar esta área. 
            Apenas administradores podem acessar este conteúdo.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
