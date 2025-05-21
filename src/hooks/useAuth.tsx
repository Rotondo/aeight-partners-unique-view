
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Usuario } from '@/types';
import { toast } from './use-toast';

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
        // First check for an existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Sessão existente encontrada:", session);
          
          // Fetch user data from usuarios table
          const { data: userData, error: userError } = await (supabase as any)
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            throw userError;
          }
          
          if (userData) {
            console.log("Usuário autenticado:", userData);
            setUser(userData as Usuario);
            setIsAuthenticated(true);
          } else {
            console.log("Dados do usuário não encontrados na tabela 'usuarios'");
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log("Nenhuma sessão encontrada");
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setError(error instanceof Error ? error.message : 'Erro ao verificar autenticação');
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
        console.log("Evento de autenticação:", event, session);
        
        if (event === 'SIGNED_IN' && session) {
          // Get user profile after sign in
          const { data: userData, error: userError } = await (supabase as any)
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!userError && userData) {
            console.log("Dados do usuário após login:", userData);
            setUser(userData as Usuario);
            setIsAuthenticated(true);
          } else {
            console.error("Erro ao buscar dados do usuário após login:", userError);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Usuário desconectado");
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
      console.log("Tentando login com:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        throw error;
      }

      if (data.user) {
        console.log("Login bem-sucedido:", data.user);
        
        const { data: userData, error: userError } = await (supabase as any)
          .from('usuarios')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          throw userError;
        }
        
        if (userData && !userData.ativo) {
          console.error("Usuário inativo");
          throw new Error('Usuário inativo. Entre em contato com o administrador.');
        }

        if (userData) {
          console.log("Dados do usuário carregados:", userData);
          setUser(userData as Usuario);
          setIsAuthenticated(true);
          toast({
            title: "Login bem-sucedido",
            description: `Bem-vindo, ${userData.nome}!`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer login');
      toast({
        title: "Erro de login",
        description: error instanceof Error ? error.message : 'Erro ao fazer login',
        variant: "destructive",
      });
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
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer logout');
      toast({
        title: "Erro ao desconectar",
        description: error instanceof Error ? error.message : 'Erro ao fazer logout',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
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
