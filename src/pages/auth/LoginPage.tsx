
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import LoadingScreen from '@/components/ui/LoadingScreen';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('[LoginPage] Estado:', { isAuthenticated, loading });
  
  // Show loading while checking authentication
  if (loading) {
    return <LoadingScreen timeout={10000} message="Verificando autenticação..." />;
  }
  
  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    console.log('[LoginPage] Usuário já autenticado, redirecionando para dashboard');
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
