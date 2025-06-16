import { useQuery } from "@tanstack/react-query";
import { Partner } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Hook customizado para buscar e gerenciar a lista de parceiros.
 * Exemplo de uso:
 * const { partners, loading, error, refetch } = usePartners();
 */
export function usePartners() {
  const {
    data: partners,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery<Partner[], Error>({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parceiros").select("*");
      if (error) throw error;
      return data as Partner[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    partners: partners || [],
    loading,
    error: isError ? error?.message : null,
    refetch,
  };
}
