import React, { createContext, useContext, useState } from "react";

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

const adminUser: User = {
  id: "admin-mock-id",
  nome: "Administrador",
  email: "admin@admin.com",
  papel: "admin",
  empresa_id: "admin-empresa-id",
  ativo: true,
};

const AuthContext = createContext<AuthContextType>({
  user: adminUser,
  isAuthenticated: true,
  loading: false,
  error: null,
  login: async () => true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Sempre retorna admin logado
  const [user, setUser] = useState<User | null>(adminUser);

  const login = async (_email: string, _senha: string): Promise<boolean> => {
    setUser(adminUser);
    return true;
  };

  const logout = () => {
    setUser(adminUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
