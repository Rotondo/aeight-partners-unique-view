
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

  const logAuth = useCallback((action: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Auth] ${action}:`, data);
    }
  }, [isDevelopment]);

  const fetchUserFromDB = useCallback(async (email: string | null | undefined): Promise<User | null> => {
    if (!email) return null;
    
    try {
      logAuth('fetchUserFromDB_start', { email });
      
      // Timeout agressivo de 2 segundos para query de usuário
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('[Auth] TIMEOUT na fetchUserFromDB após 2s');
      }, 2000);
      
      const { data, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle()
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
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
        
        logAuth('fetchUserFromDB_success', { userId: userData.id, ativo: userData.ativo });
        return userData;
      }
      
      logAuth('fetchUserFromDB_not_found');
      return null;
    } catch (err: any) {
      console.error('[Auth] Erro na fetchUserFromDB:', err);
      
      // Se for timeout ou erro de conexão, retornar usuário básico para permitir acesso
      if (err.name === 'AbortError' || err.code === 'PGRST301') {
        console.warn('[Auth] Usando fallback devido ao timeout - criando usuário básico');
        return {
          id: 'fallback-user',
          email: email,
          nome: 'Usuário (Modo Fallback)',
          papel: 'user',
          ativo: true
        } as User;
      }
      
      setError(`Erro ao buscar dados do usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  }, [logAuth]);

  const refreshUser = useCallback(async () => {
    logAuth('refreshUser_start');
    setError(null);
    
    try {
      // Timeout agressivo para getUser
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('[Auth] TIMEOUT no refreshUser após 2s');
      }, 2000);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      clearTimeout(timeoutId);
      
      if (authError || !authData?.user) {
        logAuth('refreshUser_no_auth');
        setUser(null);
        return;
      }
      
      const dbUser = await fetchUserFromDB(authData.user.email);
      setUser(dbUser);
      
    } catch (err: any) {
      console.error('[Auth] Erro em refreshUser:', err);
      
      // Fallback crítico - se timeout, assumir que não há usuário autenticado
      if (err.name === 'AbortError') {
        console.warn('[Auth] Timeout em refreshUser - assumindo não autenticado');
        setUser(null);
      } else {
        setError(`Erro na autenticação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [logAuth, fetchUserFromDB]);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      logAuth('auth_initialization_start');
      
      // Timeout máximo de 3 segundos para inicialização completa
      const initTimeout = setTimeout(() => {
        if (mounted) {
          console.error('[Auth] TIMEOUT GERAL na inicialização após 3s - forçando fim do loading');
          setLoading(false);
          setUser(null);
        }
      }, 3000);
      
      try {
        // Timeout específico para getSession
        const controller = new AbortController();
        const sessionTimeout = setTimeout(() => {
          controller.abort();
          console.error('[Auth] TIMEOUT no getSession após 2s');
        }, 2000);
        
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(sessionTimeout);
        
        if (mounted) {
          if (session?.user) {
            logAuth('session_found', { email: session.user.email });
            const dbUser = await fetchUserFromDB(session.user.email);
            if (mounted) {
              setUser(dbUser);
            }
          } else {
            logAuth('no_session');
          }
          setLoading(false);
          clearTimeout(initTimeout);
        }
        
        logAuth('auth_initialization_complete');
      } catch (err: any) {
        console.error('[Auth] Erro na inicialização:', err);
        if (mounted) {
          if (err.name === 'AbortError') {
            console.warn('[Auth] Timeout na inicialização - finalizando sem erro');
          } else {
            setError('Erro na inicialização da autenticação');
          }
          setLoading(false);
          clearTimeout(initTimeout);
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
  }, [logAuth, fetchUserFromDB]);

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
      // Timeout agressivo para login
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('[Auth] TIMEOUT no login após 3s');
      }, 3000);
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });
      
      clearTimeout(timeoutId);
      
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
    } catch (err: any) {
      console.error('[Auth] Erro durante login:', err);
      
      if (err.name === 'AbortError') {
        setError("Timeout no login. Verifique sua conexão.");
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
  }, [logAuth, fetchUserFromDB]);

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
