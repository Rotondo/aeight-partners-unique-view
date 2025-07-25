
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const isDevelopment = process.env.NODE_ENV === 'development';
  const AUTH_TIMEOUT = 8000; // 8 segundos

  const logAuth = useCallback((action: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Auth] ${action}:`, data);
    }
  }, [isDevelopment]);

  const withTimeout = useCallback(<T,>(promise: Promise<T>, timeout: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na autenticação')), timeout)
      )
    ]);
  }, []);

  const fetchUserFromDB = useCallback(async (email: string | null | undefined): Promise<User | null> => {
    if (!email) return null;
    
    try {
      logAuth('fetchUserFromDB', { email });
      
      // Create the promise directly from the query
      const queryPromise = supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      // Await the query to get the actual response
      const { data, error: dbError } = await withTimeout(queryPromise, AUTH_TIMEOUT);
      
      if (dbError) {
        throw dbError;
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
        
        logAuth('user_found', { userId: userData.id });
        return userData;
      }
      
      logAuth('user_not_found');
      return null;
    } catch (err) {
      console.error('[Auth] Erro na fetchUserFromDB:', err);
      setError(`Erro ao buscar dados do usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  }, [logAuth, withTimeout]);

  const refreshUser = useCallback(async () => {
    logAuth('refreshUser_start');
    setError(null);
    
    try {
      const authPromise = supabase.auth.getUser();
      const { data: authData, error: authError } = await withTimeout(authPromise, AUTH_TIMEOUT);
      
      if (authError || !authData?.user) {
        logAuth('no_authenticated_user');
        setUser(null);
        return;
      }
      
      const dbUser = await fetchUserFromDB(authData.user.email);
      setUser(dbUser);
      
    } catch (err) {
      console.error('[Auth] Erro em refreshUser:', err);
      setError(`Erro na autenticação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [logAuth, withTimeout, fetchUserFromDB]);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      logAuth('auth_initialization_start');
      
      try {
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await withTimeout(sessionPromise, AUTH_TIMEOUT);
        
        if (mounted) {
          if (session?.user) {
            const dbUser = await fetchUserFromDB(session.user.email);
            if (mounted) {
              setUser(dbUser);
            }
          }
          setLoading(false);
        }
        
        logAuth('auth_initialization_complete');
      } catch (err) {
        console.error('[Auth] Erro na inicialização:', err);
        if (mounted) {
          setError('Erro na inicialização da autenticação');
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        logAuth('auth_state_change', { event });
        
        if (session?.user) {
          const dbUser = await fetchUserFromDB(session.user.email);
          if (mounted) {
            setUser(dbUser);
            setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [logAuth, withTimeout, fetchUserFromDB]);

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    if (!email || !senha) {
      setError("Email e senha são obrigatórios.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email inválido.");
      return false;
    }

    logAuth('login_attempt', { email });
    setLoading(true);
    setError(null);
    
    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

      const { data, error: authError } = await withTimeout(signInPromise, AUTH_TIMEOUT);

      if (authError) {
        throw authError;
      }

      const dbUser = await fetchUserFromDB(email);
      
      if (!dbUser) {
        setError("Usuário não encontrado na base de dados.");
        return false;
      }
      
      if (dbUser.ativo === false) {
        setError("Usuário inativo. Entre em contato com o administrador.");
        return false;
      }
      
      setUser(dbUser);
      logAuth('login_success');
      return true;
      
    } catch (err) {
      console.error('[Auth] Erro durante login:', err);
      
      if (err instanceof Error && err.message.includes('Timeout')) {
        setError("Timeout na autenticação. Verifique sua conexão.");
      } else if (err instanceof Error && err.message.includes('Invalid login credentials')) {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro durante o login. Tente novamente.");
      }
      
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [logAuth, withTimeout, fetchUserFromDB]);

  const logout = useCallback(async () => {
    logAuth('logout_start');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      logAuth('logout_success');
    } catch (err) {
      console.error('[Auth] Erro durante logout:', err);
      setError("Erro durante logout");
    } finally {
      setLoading(false);
    }
  }, [logAuth]);

  const contextValue = {
    user,
    isAuthenticated: !!user && user.ativo !== false,
    loading,
    error,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
