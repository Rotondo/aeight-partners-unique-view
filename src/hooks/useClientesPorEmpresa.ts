import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const CONSOLE_PREFIX = "[useClientesPorEmpresa]";

export interface ClienteOption {
  id: string;
  nome: string;
  empresa_proprietaria: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
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
      // Buscar clientes da empresa específica, incluindo info da proprietária
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(
            id,
            nome
          ),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(
            id,
            nome,
            tipo
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
        .map((item: any) => ({
          id: item.empresa_cliente?.id,
          nome: item.empresa_cliente?.nome,
          empresa_proprietaria: item.empresa_proprietaria
            ? {
                id: item.empresa_proprietaria.id,
                nome: item.empresa_proprietaria.nome,
                tipo: item.empresa_proprietaria.tipo,
              }
            : null,
        }))
        .filter((cliente: ClienteOption) => cliente.id && cliente.nome);

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

  // Novo: buscar todos os clientes e todas empresas proprietárias (para o fishbone)
  const fetchTodosClientesComProprietarios = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(
            id,
            nome
          ),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(
            id,
            nome,
            tipo
          )
        `)
        .eq("status", true);

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar todos clientes:`, error);
        throw error;
      }

      const clientesData: ClienteOption[] = (data || [])
        .map((item: any) => ({
          id: item.empresa_cliente?.id,
          nome: item.empresa_cliente?.nome,
          empresa_proprietaria: item.empresa_proprietaria
            ? {
                id: item.empresa_proprietaria.id,
                nome: item.empresa_proprietaria.nome,
                tipo: item.empresa_proprietaria.tipo,
              }
            : null,
        }))
        .filter((cliente: ClienteOption) => cliente.id && cliente.nome);

      setClientes(clientesData);
      return clientesData;
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro:`, error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
      setClientes([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
    setClientes([]);
  }, []);

  return {
    clientes,
    loading,
    fetchClientesPorEmpresa,
    fetchTodosClientesComProprietarios,
    clearCache,
  };
};