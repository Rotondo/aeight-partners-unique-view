import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const CONSOLE_PREFIX = "[useClientesPorEmpresa]";

export interface ClienteOption {
  id: string;
  nome: string;
}

export const useClientesPorEmpresa = () => {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, ClienteOption[]>>({});

  const fetchClientesPorEmpresa = useCallback(async (empresaId: string) => {
    if (!empresaId) {
      setClientes([]);
      return;
    }

    // Verificar cache primeiro
    if (cache[empresaId]) {
      console.log(`${CONSOLE_PREFIX} Usando cache para empresa ${empresaId}`);
      setClientes(cache[empresaId]);
      return;
    }

    console.log(`${CONSOLE_PREFIX} Buscando clientes para empresa ${empresaId}`);
    setLoading(true);

    try {
      // Buscar clientes da empresa específica
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(
            id,
            nome
          )
        `)
        .eq("empresa_proprietaria_id", empresaId)
        .eq("status", true);

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar clientes:`, error);
        throw error;
      }

      // Processar dados para formato simples
      const clientesData: ClienteOption[] = (data || [])
        .map((item: any) => item.empresa_cliente)
        .filter(Boolean)
        .map((cliente: any) => ({
          id: cliente.id,
          nome: cliente.nome,
        }));

      console.log(`${CONSOLE_PREFIX} Encontrados ${clientesData.length} clientes`);

      // Salvar no cache
      setCache(prev => ({
        ...prev,
        [empresaId]: clientesData
      }));

      setClientes(clientesData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache({});
    setClientes([]);
  }, []);

  return {
    clientes,
    loading,
    fetchClientesPorEmpresa,
    clearCache,
  };
};