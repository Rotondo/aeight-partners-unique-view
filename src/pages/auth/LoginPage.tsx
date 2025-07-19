import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Redireciona se já estiver autenticado
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #22223b',
              borderRadius: '50%',
              width: 48,
              height: 48,
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
