import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados completos do usuário na tabela 'usuarios'
  const fetchUserProfile = async (email: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, papel, empresa_id, ativo')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as User;
  };

  // Carrega o usuário atual do Supabase ao iniciar
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        // Busca perfil completo
        const profile = await fetchUserProfile(session.user.email ?? "");
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    loadSession();

    // Subscrição para mudanças de autenticação (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        const profile = await fetchUserProfile(session.user.email ?? "");
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
          });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Função de login real com Supabase
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data?.user) {
      setError("Credenciais inválidas");
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }

    // Busca o perfil completo na tabela usuarios
    const profile = await fetchUserProfile(email);

    if (profile) {
      setUser(profile);
    } else {
      setUser({
        id: data.user.id,
        email: data.user.email ?? "",
      });
    }
    setIsAuthenticated(true);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar autenticação em outros componentes
export const useAuth = () => useContext(AuthContext);
