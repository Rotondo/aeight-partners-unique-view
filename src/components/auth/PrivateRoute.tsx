
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useEffect, useState } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  // Check if React hooks are available
  if (typeof useAuth !== 'function') {
    console.error('[PrivateRoute] useAuth hook not available');
    return <LoginForm />;
  }

  let authData;
  try {
    authData = useAuth();
  } catch (error) {
    console.error('[PrivateRoute] Error using useAuth:', error);
    return <LoginForm />;
  }

  const { user, loading, error } = authData;

  // Safe useState usage
  let showTimeout = false;
  let setShowTimeout = () => {};

  try {
    [showTimeout, setShowTimeout] = useState(false);
  } catch (error) {
    console.error('[PrivateRoute] Error using useState:', error);
  }

  // Safe useEffect usage
  try {
    useEffect(() => {
      // Timeout mais generoso para o carregamento inicial
      const timer = setTimeout(() => {
        if (loading && !user) {
          console.log('[PrivateRoute] Timeout atingido, mostrando tela de login');
          setShowTimeout(true);
        }
      }, 8000); // 8 segundos para carregamento inicial

      return () => clearTimeout(timer);
    }, [loading, user]);
  } catch (error) {
    console.error('[PrivateRoute] Error using useEffect:', error);
  }

  // Se ainda está carregando e não atingiu o timeout
  if (loading && !showTimeout) {
    return <LoadingScreen />;
  }

  // Se há erro ou não há usuário após o carregamento
  if (error || !user || showTimeout) {
    console.log('[PrivateRoute] Redirecionando para login:', { error, hasUser: !!user, showTimeout });
    return <LoginForm />;
  }

  // Usuário autenticado
  console.log('[PrivateRoute] Usuário autenticado, renderizando conteúdo');
  return <>{children}</>;
};
