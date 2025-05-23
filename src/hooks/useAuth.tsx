
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
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

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: true, // Sempre autenticado para acesso livre
  loading: false,
  error: null,
  login: async () => true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já existe uma sessão ativa no Supabase
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
        }

        if (session?.user) {
          // Buscar dados do usuário na tabela usuarios
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
          }

          if (userData) {
            setUser({
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              papel: userData.papel,
              empresa_id: userData.empresa_id,
              ativo: userData.ativo,
            });
          } else {
            // Se não encontrar o usuário na tabela, usar dados do auth
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              nome: session.user.user_metadata?.nome || "Usuário Admin",
              papel: "admin",
              ativo: true,
            });
          }
        } else {
          // Se não há sessão, fazer login automático como admin
          await loginAsAdmin();
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        // Em caso de erro, definir usuário padrão para manter acesso
        setUser({
          id: "admin-fallback",
          email: "admin@aeight.global",
          nome: "Admin",
          papel: "admin",
          ativo: true,
        });
      } finally {
        setLoading(false);
      }
    };

    const loginAsAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'rotondo@aeight.global',
          password: 'Ae8.2024!'
        });

        if (error) {
          console.error("Erro no login automático:", error);
          // Fallback para usuário hardcoded
          setUser({
            id: "admin-fallback",
            email: "rotondo@aeight.global",
            nome: "Admin",
            papel: "admin",
            ativo: true,
          });
          return;
        }

        if (data.user) {
          // Buscar dados do usuário na tabela usuarios
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              papel: userData.papel,
              empresa_id: userData.empresa_id,
              ativo: userData.ativo,
            });
          } else {
            setUser({
              id: data.user.id,
              email: data.user.email || "",
              nome: "Admin",
              papel: "admin",
              ativo: true,
            });
          }
        }
      } catch (error) {
        console.error("Erro no login automático:", error);
        setUser({
          id: "admin-fallback",
          email: "rotondo@aeight.global",
          nome: "Admin",
          papel: "admin",
          ativo: true,
        });
      }
    };

    checkSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (session?.user) {
          const { data: userData } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            setUser({
              id: userData.id,
              nome: userData.nome,
              email: userData.email,
              papel: userData.papel,
              empresa_id: userData.empresa_id,
              ativo: userData.ativo,
            });
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      });

      if (error) throw error;

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
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
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
        isAuthenticated: true, // Sempre autenticado para acesso livre
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
