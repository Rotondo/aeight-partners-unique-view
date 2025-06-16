import React, { createContext, useContext, useState, useEffect } from "react";
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

interface WishlistContextType {
  empresasClientes: EmpresaCliente[];
  wishlistItems: WishlistItem[];
  apresentacoes: WishlistApresentacao[];
  stats: WishlistStats | null;
  loading: boolean;

  // CRUD
  fetchEmpresasClientes: () => Promise<void>;
  fetchWishlistItems: () => Promise<void>;
  fetchApresentacoes: () => Promise<void>;
  fetchStats: () => Promise<void>;

  // Empresa Cliente
  addEmpresaCliente: (
    data: Omit<EmpresaCliente, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateEmpresaCliente: (
    id: string,
    data: Partial<EmpresaCliente>
  ) => Promise<void>;
  deleteEmpresaCliente: (id: string) => Promise<void>;

  // Wishlist Item
  addWishlistItem: (
    data: Omit<WishlistItem, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateWishlistItem: (
    id: string,
    data: Partial<WishlistItem>
  ) => Promise<void>;
  deleteWishlistItem: (id: string) => Promise<void>;

  // Apresentação
  addApresentacao: (
    data: Omit<WishlistApresentacao, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateApresentacao: (
    id: string,
    data: Partial<WishlistApresentacao>
  ) => Promise<void>;
  convertToOportunidade: (itemId: string, oportunidadeData: any) => Promise<void>;

  // Solicitar apresentação
  solicitarApresentacao: (args: {
    empresa_cliente_id: string;
    empresa_proprietaria_id: string;
    relacionamento_id: string;
    observacoes?: string;
  }) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

function getMonthYear(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  // yyyy-MM
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function getLastMonthYear(): string {
  const now = new Date();
  now.setDate(1); // Set to first day of the month
  now.setHours(0, 0, 0, 0);
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

function calcEvolution(current: number, previous: number): number | null {
  if (previous === 0 && current > 0) return 100;
  if (previous === 0 && current === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<WishlistApresentacao[]>([]);
  const [stats, setStats] = useState<WishlistStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Empresas Clientes
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
      setEmpresasClientes(data ?? []);
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

  // Wishlist Items
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
      const typedData = (data ?? []).map((item) => ({
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

  // Apresentações
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

      const typedData = (data ?? []).map((item) => ({
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

  // Stats
  const fetchStats = async () => {
    try {
      // Busca todos os wishlist_items e wishlist_apresentacoes
      const [wishlistData, apresentacoesData] = await Promise.all([
        supabase.from("wishlist_items").select("*"),
        supabase.from("wishlist_apresentacoes").select("*"),
      ]);
      if (wishlistData.error) throw wishlistData.error;
      if (apresentacoesData.error) throw apresentacoesData.error;

      const wishlist: any[] = wishlistData.data ?? [];
      const apresentacoes: any[] = apresentacoesData.data ?? [];

      // Agrupa wishlist por mês/ano
      const wishlistPerMonth: Record<string, number> = {};
      wishlist.forEach((item) => {
        const month = getMonthYear(item.created_at);
        if (month) wishlistPerMonth[month] = (wishlistPerMonth[month] || 0) + 1;
      });

      // Agrupa apresentações realizadas por mês/ano
      const apresentacoesRealizadasPerMonth: Record<string, number> = {};
      apresentacoes.forEach((item) => {
        if (item.status_apresentacao === "realizada") {
          const month = getMonthYear(item.created_at);
          if (month)
            apresentacoesRealizadasPerMonth[month] =
              (apresentacoesRealizadasPerMonth[month] || 0) + 1;
        }
      });

      // Agrupa conversões (apresentações convertidas) por mês/ano
      const conversaoOportunidadesPerMonth: Record<string, number> = {};
      apresentacoes.forEach((item) => {
        if (item.converteu_oportunidade) {
          const month = getMonthYear(item.created_at);
          if (month)
            conversaoOportunidadesPerMonth[month] =
              (conversaoOportunidadesPerMonth[month] || 0) + 1;
        }
      });

      // Mês atual e anterior
      const currentMonth = getCurrentMonthYear();
      const lastMonth = getLastMonthYear();

      // Cálculo de evolução
      const totalSolicitacoes = wishlist.length;
      const solicitacoesPendentes = wishlist.filter((item) => item.status === "pendente").length;
      const solicitacoesAprovadas = wishlist.filter((item) => item.status === "aprovado").length;
      const apresentacoesRealizadas = apresentacoes.filter((item) => item.status_apresentacao === "realizada").length;
      const conversaoOportunidades = apresentacoes.filter((item) => item.converteu_oportunidade).length;

      // Exemplo de agregação (ajuste conforme necessário)
      const empresasMaisDesejadas: Array<{ nome: string; count: number }> = [];
      const facilitacoesPorParceiro: Array<{ nome: string; count: number }> = [];

      const statsData: WishlistStats = {
        totalSolicitacoes,
        solicitacoesPendentes,
        solicitacoesAprovadas,
        apresentacoesRealizadas,
        conversaoOportunidades,
        empresasMaisDesejadas: empresasMaisDesejadas ?? [],
        facilitacoesPorParceiro: facilitacoesPorParceiro ?? [],
        evolucao: {
          totalSolicitacoes: calcEvolution(
            wishlistPerMonth[currentMonth] || 0,
            wishlistPerMonth[lastMonth] || 0
          ),
          apresentacoesRealizadas: calcEvolution(
            apresentacoesRealizadasPerMonth[currentMonth] || 0,
            apresentacoesRealizadasPerMonth[lastMonth] || 0
          ),
          conversaoOportunidades: calcEvolution(
            conversaoOportunidadesPerMonth[currentMonth] || 0,
            conversaoOportunidadesPerMonth[lastMonth] || 0
          ),
        },
      };

      setStats(statsData);
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  // CRUD EmpresaCliente
  const addEmpresaCliente = async (
    data: Omit<EmpresaCliente, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase.from("empresa_clientes").insert([data]);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Empresa cliente adicionada com sucesso",
      });
      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao adicionar empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar empresa cliente",
        variant: "destructive",
      });
    }
  };

  const updateEmpresaCliente = async (
    id: string,
    data: Partial<EmpresaCliente>
  ) => {
    try {
      const { error } = await supabase
        .from("empresa_clientes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa cliente atualizada com sucesso",
      });

      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao atualizar empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa cliente",
        variant: "destructive",
      });
    }
  };

  const deleteEmpresaCliente = async (id: string) => {
    try {
      const { error } = await supabase.from("empresa_clientes").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Empresa cliente removida com sucesso",
      });
      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao remover empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover empresa cliente",
        variant: "destructive",
      });
    }
  };

  // CRUD WishlistItem
  const addWishlistItem = async (
    data: Omit<WishlistItem, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase.from("wishlist_items").insert([data]);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Item adicionado à wishlist com sucesso",
      });
      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao adicionar item à wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item à wishlist",
        variant: "destructive",
      });
    }
  };

  const updateWishlistItem = async (
    id: string,
    data: Partial<WishlistItem>
  ) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da wishlist atualizado com sucesso",
      });

      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao atualizar item da wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item da wishlist",
        variant: "destructive",
      });
    }
  };

  const deleteWishlistItem = async (id: string) => {
    try {
      const { error } = await supabase.from("wishlist_items").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Item removido da wishlist com sucesso",
      });
      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao remover item da wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover item da wishlist",
        variant: "destructive",
      });
    }
  };

  // CRUD Apresentacao
  const addApresentacao = async (
    data: Omit<WishlistApresentacao, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase.from("wishlist_apresentacoes").insert([data]);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Apresentação registrada com sucesso",
      });
      await fetchApresentacoes();
    } catch (error) {
      console.error("Erro ao registrar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar apresentação",
        variant: "destructive",
      });
    }
  };

  const updateApresentacao = async (
    id: string,
    data: Partial<WishlistApresentacao>
  ) => {
    try {
      const { error } = await supabase
        .from("wishlist_apresentacoes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast({
        title: "Sucesso",
        description: "Apresentação atualizada com sucesso",
      });
      await fetchApresentacoes();
    } catch (error) {
      console.error("Erro ao atualizar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar apresentação",
        variant: "destructive",
      });
    }
  };

  const convertToOportunidade = async (
    itemId: string,
    oportunidadeData: any
  ) => {
    try {
      // Cria a oportunidade
      const { data: oportunidade, error: oportunidadeError } = await supabase
        .from("oportunidades")
        .insert([oportunidadeData])
        .select()
        .single();
      if (oportunidadeError) throw oportunidadeError;

      // Atualiza o status do wishlist item
      const { error: wishlistError } = await supabase
        .from("wishlist_items")
        .update({
          status: "convertido",
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (wishlistError) throw wishlistError;

      toast({
        title: "Sucesso",
        description: "Item convertido para oportunidade com sucesso",
      });

      await Promise.all([fetchWishlistItems(), fetchApresentacoes()]);
    } catch (error) {
      console.error("Erro ao converter para oportunidade:", error);
      toast({
        title: "Erro",
        description: "Erro ao converter para oportunidade",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Solicitar apresentação para relacionamento empresa_cliente
  const solicitarApresentacao = async ({
    empresa_cliente_id,
    empresa_proprietaria_id,
    relacionamento_id,
    observacoes,
  }: {
    empresa_cliente_id: string;
    empresa_proprietaria_id: string;
    relacionamento_id: string;
    observacoes?: string;
  }): Promise<void> => {
    try {
      const { error } = await supabase.from("wishlist_apresentacoes").insert([
        {
          empresa_cliente_id,
          empresa_proprietaria_id,
          relacionamento_id,
          observacoes: observacoes || null,
          status_apresentacao: "pendente",
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      toast({
        title: "Solicitação enviada",
        description: "Apresentação solicitada com sucesso",
      });
      await fetchApresentacoes();
    } catch (error) {
      console.error("Erro ao solicitar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar apresentação",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Inicial
  useEffect(() => {
    fetchEmpresasClientes();
    fetchWishlistItems();
    fetchApresentacoes();
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const value: WishlistContextType = {
    empresasClientes,
    wishlistItems,
    apresentacoes,
    stats,
    loading,
    fetchEmpresasClientes,
    fetchWishlistItems,
    fetchApresentacoes,
    fetchStats,
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addApresentacao,
    updateApresentacao,
    convertToOportunidade,
    solicitarApresentacao,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
