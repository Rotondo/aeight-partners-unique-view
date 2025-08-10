
import { createContext, useContext, useEffect, useState } from "react";
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
  const [retryCount, setRetryCount] = useState<number>(0);

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Timeout para requests de autenticação
  const AUTH_TIMEOUT = 10000; // 10 segundos
  const MAX_RETRIES = 3;

  const withTimeout = <T,>(promise: Promise<T>, timeout: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na autenticação')), timeout)
      )
    ]);
  };

  const logAuth = (action: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[Auth] ${action}:`, data);
    }
  };

  // Busca usuário da tabela usuarios pelo e-mail do Auth com retry
  const fetchUserFromDB = async (email: string | null | undefined, attempt = 1): Promise<User | null> => {
    if (!email) return null;
    
    try {
      logAuth('fetchUserFromDB_attempt', { email, attempt });
      
      const query = supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      const result = await withTimeout(Promise.resolve(query), AUTH_TIMEOUT);
      const { data, error: dbError } = result;
      
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
      console.error(`[Auth] Erro na fetchUserFromDB (tentativa ${attempt}):`, err);
      
      if (attempt < MAX_RETRIES && (err instanceof Error && err.message.includes('Timeout'))) {
        logAuth('retrying_fetchUserFromDB', { attempt: attempt + 1 });
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return fetchUserFromDB(email, attempt + 1);
      }
      
      setError(`Erro ao buscar dados do usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  };

  const refreshUser = async () => {
    logAuth('refreshUser_start');
    setError(null);
    
    try {
      const { data: authData, error: authError } = await withTimeout(
        supabase.auth.getUser(),
        AUTH_TIMEOUT
      );
      
      if (authError || !authData?.user) {
        logAuth('no_authenticated_user');
        setUser(null);
        return;
      }
      
      const dbUser = await fetchUserFromDB(authData.user.email);
      setUser(dbUser);
      setRetryCount(0);
      
    } catch (err) {
      console.error('[Auth] Erro em refreshUser:', err);
      setError(`Erro na autenticação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      logAuth('auth_initialization_start');
      
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT
        );
        
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
          setTimeout(async () => {
            if (mounted) {
              const dbUser = await fetchUserFromDB(session.user.email);
              if (mounted) {
                setUser(dbUser);
                setLoading(false);
              }
            }
          }, 0);
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
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
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
      const { data, error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: senha,
        }),
        AUTH_TIMEOUT
      );

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
      setRetryCount(0);
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
      setRetryCount(prev => prev + 1);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    logAuth('logout_start');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      setRetryCount(0);
      logAuth('logout_success');
    } catch (err) {
      console.error('[Auth] Erro durante logout:', err);
      setError("Erro durante logout");
    } finally {
      setLoading(false);
    }
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

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
