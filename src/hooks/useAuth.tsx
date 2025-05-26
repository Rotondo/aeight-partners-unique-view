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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Busca usuário da tabela usuarios pelo e-mail do Auth
  const fetchUserFromDB = async (email: string | null | undefined) => {
    if (!email) return null;
    const { data, error: dbError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (dbError) {
      setError("Erro ao buscar seus dados no banco: " + dbError.message);
      return null;
    }
    if (data) {
      return {
        id: data.id,
        nome: data.nome,
        email: data.email,
        papel: data.papel,
        empresa_id: data.empresa_id,
        ativo: data.ativo,
      } as User;
    }
    return null;
  };

  // Atualiza o usuário logado (ex: após login, logout, refresh)
  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const dbUser = await fetchUserFromDB(authData.user.email);
    setUser(dbUser);
    setLoading(false);
  };

  // Inicialização: tenta restaurar a sessão persistida e busca dados do usuário da tabela usuarios
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (authError) {
      setError("Usuário ou senha inválidos.");
      setUser(null);
      setLoading(false);
      return false;
    }

    // Busca dados da tabela usuarios
    const dbUser = await fetchUserFromDB(email);
    setUser(dbUser);
    setLoading(false);
    return !!dbUser;
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.ativo !== false,
        loading,
        error,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
