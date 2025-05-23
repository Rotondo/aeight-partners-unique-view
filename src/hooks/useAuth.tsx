
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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

// Criar o contexto de autenticação
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  login: async () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Verificar sessão atual do usuário ao carregar
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Configurar o listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              // Buscar informações adicionais do usuário no banco de dados
              const { data: userData, error: userError } = await supabase
                .from("usuarios")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (userError) {
                console.error("Erro ao buscar dados do usuário:", userError);
                setUser(null);
                setError("Erro ao carregar dados do usuário");
              } else if (userData) {
                // Se encontrou o usuário, atualiza o estado
                setUser(userData);
                setError(null);
              } else {
                // Se não encontrou o usuário
                setUser(null);
                setError("Usuário não encontrado");
              }
            } else {
              // Sem sessão ativa
              setUser(null);
            }
            setLoading(false);
          }
        );

        // Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário:", userError);
            setUser(null);
            setError("Erro ao carregar dados do usuário");
          } else if (userData) {
            setUser(userData);
            setError(null);
          } else {
            setUser(null);
            setError("Usuário não encontrado");
          }
        }
        
        setLoading(false);

        // Cleanup do listener quando o componente for desmontado
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("Erro na verificação de autenticação:", err);
        setUser(null);
        setError("Erro na verificação de autenticação");
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.error("Erro no login:", signInError);
        setError("Credenciais inválidas. Por favor, tente novamente.");
        toast({
          title: "Erro no login",
          description: "Credenciais inválidas. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (userError) {
          console.error("Erro ao buscar dados do usuário:", userError);
          setError("Erro ao carregar dados do usuário");
          return false;
        }

        if (userData) {
          if (!userData.ativo) {
            setError("Usuário inativo. Entre em contato com o administrador.");
            toast({
              title: "Acesso negado",
              description: "Usuário inativo. Entre em contato com o administrador.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
            return false;
          }

          setUser(userData);
          toast({
            title: "Login bem-sucedido",
            description: "Bem-vindo ao sistema!",
          });
          return true;
        } else {
          setError("Usuário não encontrado no sistema.");
          toast({
            title: "Erro no login",
            description: "Usuário não encontrado no sistema.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return false;
        }
      }

      return false;
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
        description: "Você foi desconectado com sucesso.",
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
