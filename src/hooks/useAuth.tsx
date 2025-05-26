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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Recupera sessão persistida
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { user: supaUser } = data;
        // Busca dados adicionais do usuário na tabela usuarios
        const { data: dbUser } = await supabase
          .from("usuarios")
          .select("*")
          .eq("email", supaUser.email)
          .maybeSingle();
        if (dbUser) {
          setUser({
            id: dbUser.id,
            nome: dbUser.nome,
            email: dbUser.email,
            papel: dbUser.papel,
            empresa_id: dbUser.empresa_id,
            ativo: dbUser.ativo,
          });
        } else {
          // Caso não haja dados na tabela, usa o mínimo do auth
          setUser({
            id: supaUser.id,
            email: supaUser.email ?? "",
          });
        }
      }
      setLoading(false);
    };
    getSession();
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

    // Busca dados adicionais na tabela usuarios
    const { user: supaUser } = data;
    if (supaUser) {
      const { data: dbUser } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", supaUser.email)
        .maybeSingle();
      if (dbUser) {
        setUser({
          id: dbUser.id,
          nome: dbUser.nome,
          email: dbUser.email,
          papel: dbUser.papel,
          empresa_id: dbUser.empresa_id,
          ativo: dbUser.ativo,
        });
      } else {
        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
        });
      }
      setLoading(false);
      return true;
    }
    setError("Erro inesperado ao autenticar.");
    setUser(null);
    setLoading(false);
    return false;
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
        isAuthenticated: !!user,
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

export const useAuth = () => useContext(AuthContext);
