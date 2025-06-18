
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { LoginForm } from "./LoginForm";

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  // Enhanced admin check with proper validation
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
