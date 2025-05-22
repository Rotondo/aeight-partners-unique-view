
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Usuario } from "@/types";

// Definição do contexto de autenticação
export interface AuthContextType {
  isAuthenticated: boolean;
  user: Usuario | null;
  loading: boolean;
  error: string | null;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Recupera do localStorage
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ao inicializar, verifica se tem autenticação salva
    if (isAuthenticated) {
      // Simula um usuário admin para teste
      setUser({
        id: "1",
        nome: "Admin",
        email: "admin@admin.com",
        papel: "admin",
        empresa_id: "",
        ativo: true
      });
    }
    localStorage.setItem("isAuthenticated", isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  const login = (email: string, senha: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Lógica simples: só permite usuário fixo para teste
      if (email === "admin@admin.com" && senha === "123456") {
        setIsAuthenticated(true);
        setUser({
          id: "1",
          nome: "Admin",
          email: "admin@admin.com",
          papel: "admin",
          empresa_id: "",
          ativo: true
        });
        setLoading(false);
        return true;
      }
      
      setIsAuthenticated(false);
      setUser(null);
      setError("Credenciais inválidas");
      setLoading(false);
      return false;
    } catch (err) {
      setError("Erro ao fazer login");
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.setItem("isAuthenticated", "false");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
