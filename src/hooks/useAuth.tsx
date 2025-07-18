
import * as React from "react";
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

  console.log("[AuthProvider] Inicializando provider");

  // Busca usuário da tabela usuarios pelo e-mail do Auth
  const fetchUserFromDB = async (email: string | null | undefined): Promise<User | null> => {
    if (!email) return null;
    
    try {
      console.log("[AuthProvider] Buscando usuário no banco:", email);
      
      const { data, error: dbError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      
      if (dbError) {
        console.error("[AuthProvider] Erro ao buscar usuário:", dbError);
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
        
        console.log("[AuthProvider] Usuário encontrado:", userData.id);
        return userData;
      }
      
      console.log("[AuthProvider] Usuário não encontrado");
      return null;
    } catch (err) {
      console.error("[AuthProvider] Erro na fetchUserFromDB:", err);
      setError(`Erro ao buscar dados do usuário: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      return null;
    }
  };

  const refreshUser = async () => {
    console.log("[AuthProvider] Refreshing user");
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData?.user) {
        console.log("[AuthProvider] Nenhum usuário autenticado");
        setUser(null);
        return;
      }
      
      const dbUser = await fetchUserFromDB(authData.user.email);
      setUser(dbUser);
      
    } catch (err) {
      console.error("[AuthProvider] Erro em refreshUser:", err);
      setError(`Erro na autenticação: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      console.log("[AuthProvider] Inicializando autenticação");
      
      try {
        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log("[AuthProvider] Sessão encontrada, buscando usuário");
            const dbUser = await fetchUserFromDB(session.user.email);
            if (mounted) {
              setUser(dbUser);
            }
          } else {
            console.log("[AuthProvider] Nenhuma sessão encontrada");
          }
          setLoading(false);
        }
        
      } catch (err) {
        console.error("[AuthProvider] Erro na inicialização:", err);
        if (mounted) {
          setError('Erro na inicialização da autenticação');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("[AuthProvider] Auth state change:", event);
        
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

    console.log("[AuthProvider] Tentativa de login:", email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: senha,
      });

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
      console.log("[AuthProvider] Login bem-sucedido");
      return true;
      
    } catch (err) {
      console.error("[AuthProvider] Erro durante login:", err);
      
      if (err instanceof Error && err.message.includes('Invalid login credentials')) {
        setError("Email ou senha incorretos.");
      } else {
        setError("Erro durante o login. Tente novamente.");
      }
      
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log("[AuthProvider] Fazendo logout");
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      console.log("[AuthProvider] Logout bem-sucedido");
    } catch (err) {
      console.error("[AuthProvider] Erro durante logout:", err);
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

  console.log("[AuthProvider] Estado atual:", {
    user: !!user,
    isAuthenticated: !!user && user.ativo !== false,
    loading
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
