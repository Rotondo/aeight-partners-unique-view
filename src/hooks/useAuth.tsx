
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types';

interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on load
  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) throw userError;
          
          setUser(userData as Usuario);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setError(error instanceof Error ? error.message : 'Error checking authentication');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile after sign in
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData) {
            setUser(userData as Usuario);
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) throw userError;
        
        if (!userData.ativo) {
          throw new Error('Usuário inativo. Entre em contato com o administrador.');
        }

        setUser(userData as Usuario);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
