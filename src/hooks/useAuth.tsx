
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  nome?: string | null;
  email: string;
  papel?: string;
  empresa_id?: string;
  ativo?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => false,
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Remove excessive logging in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.log('AuthProvider - Estado atual:', { user: user?.id, loading, error });
  }

  // Busca usuário da tabela usuarios pelo e-mail do Auth
  const fetchUserFromDB = async (email: string | null | undefined) => {
    if (isDevelopment) {
      console.log('fetchUserFromDB chamado com email:', email);
    }
    
    if (!email) return null;
    
    try {
      const { data, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      if (dbError) {
        console.error('Erro ao buscar usuário no DB:', dbError);
        setError("Erro ao buscar seus dados no banco: " + dbError.message);
        return null;
      }
      
      if (data) {
        const userData = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          papel: data.papel,
          empresa_id: data.empresa_id,
          ativo: data.ativo,
        } as User;
        
        if (isDevelopment) {
          console.log('Usuário encontrado:', userData.id);
        }
        return userData;
      }
      
      if (isDevelopment) {
        console.log('Nenhum usuário encontrado na tabela usuarios');
      }
      return null;
    } catch (err) {
      console.error('Erro na fetchUserFromDB:', err);
      setError("Erro interno ao buscar dados do usuário");
      return null;
    }
  };

  // Atualiza o usuário logado (ex: após login, logout, refresh)
  const refreshUser = async () => {
    if (isDevelopment) {
      console.log('refreshUser chamado');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        if (isDevelopment) {
          console.log('Nenhum usuário autenticado');
        }
        setUser(null);
        setLoading(false);
        return;
      }
      
      const dbUser = await fetchUserFromDB(authData.user.email);
      setUser(dbUser);
      setLoading(false);
    } catch (err) {
      console.error('Erro em refreshUser:', err);
      setUser(null);
      setLoading(false);
    }
  };

  // Inicialização: tenta restaurar a sessão persistida e busca dados do usuário da tabela usuarios
  useEffect(() => {
    if (isDevelopment) {
      console.log('useEffect de inicialização executado');
    }
    refreshUser();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    // Input validation
    if (!email || !senha) {
      setError("Email e senha são obrigatórios.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email inválido.");
      return false;
    }

    if (isDevelopment) {
      console.log('Login tentativa para:', email);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        setError("Usuário ou senha inválidos.");
        setUser(null);
        setLoading(false);
        return false;
      }

      // Busca dados da tabela usuarios
      const dbUser = await fetchUserFromDB(email);
      
      if (!dbUser) {
        setError("Usuário não encontrado na base de dados.");
        setLoading(false);
        return false;
      }
      
      if (dbUser.ativo === false) {
        setError("Usuário inativo. Entre em contato com o administrador.");
        setLoading(false);
        return false;
      }
      
      setUser(dbUser);
      setLoading(false);
      
      if (isDevelopment) {
        console.log('Login realizado com sucesso');
      }
      return true;
    } catch (err) {
      console.error('Erro durante login:', err);
      setError("Erro interno durante o login.");
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    if (isDevelopment) {
      console.log('Logout chamado');
    }
    
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erro durante logout:', err);
    }
    setLoading(false);
  };

  const contextValue = {
    user,
    isAuthenticated: !!user && user.ativo !== false,
    loading,
    error,
    login,
    logout,
    refreshUser,
  };

  if (isDevelopment) {
    console.log('AuthProvider valor do contexto:', { 
      userId: contextValue.user?.id, 
      isAuthenticated: contextValue.isAuthenticated 
    });
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
