
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface SafeContextProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafeContextProvider: React.FC<SafeContextProviderProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || <LoadingScreen message="Carregando contexto..." />;
  }

  if (!isAuthenticated) {
    return fallback || <div>Autenticação necessária</div>;
  }

  return <>{children}</>;
};
