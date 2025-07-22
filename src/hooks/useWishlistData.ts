
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  EmpresaCliente,
  WishlistItem,
  WishlistApresentacao,
  WishlistStats,
  WishlistStatus,
  StatusApresentacao,
  TipoApresentacao,
  PipelineFase,
} from "@/types";
import { toast } from "@/hooks/use-toast";

const CONSOLE_PREFIX = "[useWishlistData]";

/**
 * Hook para manipulação de dados da Wishlist e Clientes.
 * Corrigido para garantir carregamento correto dos relacionamentos entre empresas.
 */
export const useWishlistData = () => {
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<WishlistApresentacao[]>([]);
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Empresas Clientes com join correto
  const fetchEmpresasClientes = async () => {
    console.log(`${CONSOLE_PREFIX} Iniciando fetchEmpresasClientes...`);
    try {
      setLoading(true);
      
      // Query com joins explícitos para garantir que os dados sejam carregados
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(`
          id,
          empresa_proprietaria_id,
          empresa_cliente_id,
          data_relacionamento,
          status,
          observacoes,
          created_at,
          updated_at,
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(
            id,
            nome,
            tipo,
            status
          ),
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(
            id,
            nome,
            tipo,
            status
          )
        `)
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro na query empresa_clientes:`, error);
        throw error;
      }

      console.log(`${CONSOLE_PREFIX} Dados brutos recebidos:`, data);

      if (!data || data.length === 0) {
        console.warn(`${CONSOLE_PREFIX} Nenhum registro encontrado na tabela empresa_clientes`);
        setEmpresasClientes([]);
        return;
      }

      // Processar dados garantindo que os joins não sejam null
      const processedData = data.map((item: any) => {
        const processed = {
          ...item,
          empresa_proprietaria: item.empresa_proprietaria || {
            id: item.empresa_proprietaria_id,
            nome: '[Empresa não encontrada]',
            tipo: 'parceiro',
            status: false
          },
          empresa_cliente: item.empresa_cliente || {
            id: item.empresa_cliente_id,
            nome: '[Cliente não encontrado]',
            tipo: 'cliente',
            status: false
          },
        };

        // Log de diagnóstico para cada item
        if (!item.empresa_proprietaria) {
          console.warn(`${CONSOLE_PREFIX} Proprietário não encontrado para relacionamento ${item.id}`);
        }
        if (!item.empresa_cliente) {
          console.warn(`${CONSOLE_PREFIX} Cliente não encontrado para relacionamento ${item.id}`);
        }

        return processed;
      });

      console.log(`${CONSOLE_PREFIX} Dados processados:`, processedData);
      setEmpresasClientes(processedData);

    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar empresas clientes:`, error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas clientes",
        variant: "destructive",
      });
      setEmpresasClientes([]);
    } finally {
      setLoading(false);
      console.log(`${CONSOLE_PREFIX} fetchEmpresasClientes concluído.`);
    }
  };

  // Fetch Wishlist Items
  const fetchWishlistItems = async () => {
    console.log(`${CONSOLE_PREFIX} Iniciando fetchWishlistItems...`);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          *,
          empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(*),
          empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(*),
          empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Garantir que os tipos estão corretos e nulos tratados
      const typedData = (data || []).map((item: any) => ({
        ...item,
        status: item.status as WishlistStatus,
        empresa_interessada: item.empresa_interessada || null,
        empresa_desejada: item.empresa_desejada || null,
        empresa_proprietaria: item.empresa_proprietaria || null,
      }));

      setWishlistItems(typedData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar wishlist items:`, error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log(`${CONSOLE_PREFIX} fetchWishlistItems concluído.`);
    }
  };

  // Fetch Apresentações
  const fetchApresentacoes = async () => {
    console.log(`${CONSOLE_PREFIX} Iniciando fetchApresentacoes...`);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wishlist_apresentacoes")
        .select(`
          *,
          empresa_facilitadora:empresas(*),
          executivo_responsavel:usuarios(id, nome),
          wishlist_item:wishlist_items(
            *,
            empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(*),
            empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(*)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Garantir que os tipos estão corretos e nulos tratados
      const typedData = (data || []).map((item: any) => ({
        ...item,
        tipo_apresentacao: item.tipo_apresentacao as TipoApresentacao,
        status_apresentacao: item.status_apresentacao as StatusApresentacao,
        fase_pipeline: item.fase_pipeline as PipelineFase,
        empresa_facilitadora: item.empresa_facilitadora || null,
        executivo_responsavel: item.executivo_responsavel || null,
        wishlist_item: item.wishlist_item
          ? {
              ...item.wishlist_item,
              status: item.wishlist_item.status as WishlistStatus,
              empresa_interessada: item.wishlist_item.empresa_interessada || null,
              empresa_desejada: item.wishlist_item.empresa_desejada || null,
            }
          : null,
      }));

      setApresentacoes(typedData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar apresentações:`, error);
      toast({
        title: "Erro",
        description: "Erro ao carregar apresentações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log(`${CONSOLE_PREFIX} fetchApresentacoes concluído.`);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    console.log(`${CONSOLE_PREFIX} Iniciando fetchStats...`);
    try {
      // Buscar estatísticas básicas
      const [wishlistData, apresentacoesData] = await Promise.all([
        supabase.from("wishlist_items").select("*"),
        supabase.from("wishlist_apresentacoes").select("*"),
      ]);

      if (wishlistData.error) throw wishlistData.error;
      if (apresentacoesData.error) throw apresentacoesData.error;

      const wishlist = wishlistData.data || [];
      const apresentacoes = apresentacoesData.data || [];

      const statsData: WishlistStats = {
        totalSolicitacoes: wishlist.length,
        solicitacoesPendentes: wishlist.filter(
          (item: any) => item.status === "pendente"
        ).length,
        solicitacoesAprovadas: wishlist.filter(
          (item: any) => item.status === "aprovado"
        ).length,
        apresentacoesRealizadas: apresentacoes.filter(
          (item: any) => item.status_apresentacao === "realizada"
        ).length,
        conversaoOportunidades: apresentacoes.filter(
          (item: any) => item.converteu_oportunidade
        ).length,
        empresasMaisDesejadas: [],
        facilitacoesPorParceiro: [],
      };

      setStats(statsData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar estatísticas:`, error);
    } finally {
      console.log(`${CONSOLE_PREFIX} fetchStats concluído.`);
    }
  };

  return {
    // State
    empresasClientes,
    wishlistItems,
    apresentacoes,
    stats,
    loading,
    // Setters
    setEmpresasClientes,
    setWishlistItems,
    setApresentacoes,
    setStats,
    // Fetch functions
    fetchEmpresasClientes,
    fetchWishlistItems,
    fetchApresentacoes,
    fetchStats,
  };
};
