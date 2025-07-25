
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
