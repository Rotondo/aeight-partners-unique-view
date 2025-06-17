
// Usuario types

export interface Usuario {
  id: string;
  nome: string;
  empresa_id: string;
  papel: "admin" | "user" | "manager";
  email: string;
  ativo: boolean;
}

export interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}
