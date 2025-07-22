
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  WishlistItem,
  EmpresaCliente,
  WishlistApresentacao,
  WishlistStats,
} from "@/types/wishlist";
import { WishlistStatus, TipoApresentacao } from "@/types/common";

const CONSOLE_PREFIX = "[useWishlistData]";

export const useWishlistData = () => {
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<WishlistApresentacao[]>([]);
  const [stats, setStats] = useState<WishlistStats | null>(null);

  // Fetch empresas clientes
  const fetchEmpresasClientes = useCallback(async () => {
    try {
      console.log(`${CONSOLE_PREFIX} Buscando empresas clientes...`);
      
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(`
          *,
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo, status),
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, tipo, status)
        `)
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar empresas clientes:`, error);
        throw error;
      }

      console.log(`${CONSOLE_PREFIX} Empresas clientes encontradas:`, data?.length || 0);
      setEmpresasClientes(data as EmpresaCliente[] || []);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro no fetchEmpresasClientes:`, error);
      throw error;
    }
  }, []);

  // Fetch wishlist items
  const fetchWishlistItems = useCallback(async () => {
    try {
      console.log(`${CONSOLE_PREFIX} Buscando wishlist items...`);
      
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          *,
          empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(id, nome, tipo, status),
          empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(id, nome, tipo, status),
          empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(id, nome, tipo, status)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar wishlist items:`, error);
        throw error;
      }

      console.log(`${CONSOLE_PREFIX} Wishlist items encontrados:`, data?.length || 0);
      
      // Type cast to ensure correct types
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as WishlistStatus
      })) as WishlistItem[] || [];
      
      setWishlistItems(typedData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro no fetchWishlistItems:`, error);
      throw error;
    }
  }, []);

  // Fetch apresentações
  const fetchApresentacoes = useCallback(async () => {
    try {
      console.log(`${CONSOLE_PREFIX} Buscando apresentações...`);
      
      const { data, error } = await supabase
        .from("wishlist_apresentacoes")
        .select(`
          *,
          wishlist_item:wishlist_items(
            *,
            empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(id, nome, tipo, status),
            empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(id, nome, tipo, status),
            empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(id, nome, tipo, status)
          ),
          empresa_facilitadora:empresas!wishlist_apresentacoes_empresa_facilitadora_id_fkey(id, nome, tipo, status),
          executivo_responsavel:usuarios(id, nome)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`${CONSOLE_PREFIX} Erro ao buscar apresentações:`, error);
        throw error;
      }

      console.log(`${CONSOLE_PREFIX} Apresentações encontradas:`, data?.length || 0);
      
      // Type cast to ensure correct types
      const typedData = data?.map(apresentacao => ({
        ...apresentacao,
        tipo_apresentacao: apresentacao.tipo_apresentacao as TipoApresentacao,
        wishlist_item: apresentacao.wishlist_item ? {
          ...apresentacao.wishlist_item,
          status: apresentacao.wishlist_item.status as WishlistStatus
        } : undefined
      })) as WishlistApresentacao[] || [];
      
      setApresentacoes(typedData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro no fetchApresentacoes:`, error);
      throw error;
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      console.log(`${CONSOLE_PREFIX} Calculando estatísticas...`);
      
      // Implementar cálculos de estatísticas baseado nos dados atuais
      const totalSolicitacoes = wishlistItems.length;
      const solicitacoesPendentes = wishlistItems.filter(item => item.status === "pendente").length;
      const solicitacoesAprovadas = wishlistItems.filter(item => item.status === "aprovado").length;
      const apresentacoesRealizadas = apresentacoes.filter(ap => ap.fase_pipeline === "apresentado").length;
      const conversaoOportunidades = apresentacoes.filter(ap => ap.converteu_oportunidade).length;

      const statsData: WishlistStats = {
        totalSolicitacoes,
        solicitacoesPendentes,
        solicitacoesAprovadas,
        apresentacoesRealizadas,
        conversaoOportunidades,
        empresasMaisDesejadas: [],
        facilitacoesPorParceiro: [],
      };

      setStats(statsData);
      console.log(`${CONSOLE_PREFIX} Estatísticas calculadas:`, statsData);
    } catch (error) {
      console.error(`${CONSOLE_PREFIX} Erro no fetchStats:`, error);
      throw error;
    }
  }, [wishlistItems, apresentacoes]);

  return {
    empresasClientes,
    wishlistItems,
    apresentacoes,
    stats,
    setEmpresasClientes,
    setWishlistItems,
    setApresentacoes,
    setStats,
    fetchEmpresasClientes,
    fetchWishlistItems,
    fetchApresentacoes,
    fetchStats,
  };
};
