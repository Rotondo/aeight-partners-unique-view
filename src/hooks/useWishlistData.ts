
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
} from "@/types";
import { toast } from "@/hooks/use-toast";

export const useWishlistData = () => {
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<WishlistApresentacao[]>([]);
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Empresas Clientes
  const fetchEmpresasClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("empresa_clientes")
        .select(
          `
          *,
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(*),
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(*)
        `
        )
        .eq("status", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmpresasClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar empresas clientes:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Wishlist Items
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(
          `
          *,
          empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(*),
          empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(*),
          empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Garantir que os tipos estão corretos
      const typedData = (data || []).map((item) => ({
        ...item,
        status: item.status as WishlistStatus,
      }));

      setWishlistItems(typedData);
    } catch (error) {
      console.error("Erro ao buscar wishlist items:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Apresentações
  const fetchApresentacoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wishlist_apresentacoes")
        .select(
          `
          *,
          empresa_facilitadora:empresas(*),
          wishlist_item:wishlist_items(
            *,
            empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(*),
            empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Garantir que os tipos estão corretos e corrigir o tipo do status do wishlist_item
      const typedData = (data || []).map((item) => ({
        ...item,
        tipo_apresentacao: item.tipo_apresentacao as TipoApresentacao,
        status_apresentacao: item.status_apresentacao as StatusApresentacao,
        wishlist_item: item.wishlist_item
          ? {
              ...item.wishlist_item,
              status: item.wishlist_item.status as WishlistStatus,
            }
          : null,
      }));

      setApresentacoes(typedData);
    } catch (error) {
      console.error("Erro ao buscar apresentações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar apresentações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
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
          (item) => item.status === "pendente"
        ).length,
        solicitacoesAprovadas: wishlist.filter(
          (item) => item.status === "aprovado"
        ).length,
        apresentacoesRealizadas: apresentacoes.filter(
          (item) => item.status_apresentacao === "realizada"
        ).length,
        conversaoOportunidades: apresentacoes.filter(
          (item) => item.converteu_oportunidade
        ).length,
        empresasMaisDesejadas: [],
        facilitacoesPorParceiro: [],
      };

      setStats(statsData);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
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
