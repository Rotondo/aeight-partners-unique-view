
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
