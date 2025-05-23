
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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

// Usuário hardcoded para acesso livre
const HARDCODED_USER: User = {
  id: "hardcoded-user-id",
  nome: "Usuário Teste",
  email: "usuario@teste.com",
  papel: "admin",
  empresa_id: "empresa-teste",
  ativo: true,
};

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(HARDCODED_USER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Definir usuário hardcoded imediatamente
  useEffect(() => {
    setUser(HARDCODED_USER);
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Simular login bem-sucedido
      setUser(HARDCODED_USER);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo ao sistema!",
      });
      return true;
    } catch (err) {
      console.error("Erro no processo de login:", err);
      setError("Ocorreu um erro durante o login. Tente novamente.");
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Manter usuário logado (acesso livre)
      toast({
        title: "Logout simulado",
        description: "Mantendo acesso livre.",
      });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true, // Sempre autenticado
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
