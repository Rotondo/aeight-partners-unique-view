import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Hook customizado para buscar e gerenciar a lista de usuários.
 * Exemplo de uso:
 * const { users, loading, error, refetch } = useUsers();
 */
export function useUsers() {
  const {
    data: users,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("usuarios").select("*");
      if (error) throw error;
      return data as User[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    users: users || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
}
