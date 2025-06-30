
import React, { createContext, useContext, useEffect } from "react";
import {
  EmpresaCliente,
  WishlistItem,
  WishlistApresentacao,
  WishlistStats,
} from "@/types";
import { useWishlistData } from "@/hooks/useWishlistData";
import { useWishlistMutations } from "@/hooks/useWishlistMutations";

interface WishlistContextType {
  // Estados
  empresasClientes: EmpresaCliente[];
  wishlistItems: WishlistItem[];
  apresentacoes: WishlistApresentacao[];
  stats: WishlistStats | null;
  loading: boolean;

  // Funções de CRUD
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

  // NOVOS MÉTODOS
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

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    empresasClientes,
    wishlistItems,
    apresentacoes,
    stats,
    loading,
    fetchEmpresasClientes,
    fetchWishlistItems,
    fetchApresentacoes,
    fetchStats,
  } = useWishlistData();

  const mutations = useWishlistMutations(
    fetchEmpresasClientes,
    fetchWishlistItems,
    fetchApresentacoes
  );

  // Carregar dados iniciais
  useEffect(() => {
    console.log("[WishlistContext] Iniciando carregamento de dados iniciais...");
    const loadAllData = async () => {
      await fetchEmpresasClientes();
      await fetchWishlistItems();
      await fetchApresentacoes();
      await fetchStats();
      console.log("[WishlistContext] Carregamento de dados iniciais concluído.");
    };
    loadAllData();
  }, []); // Adicionado fetchEmpresasClientes, fetchWishlistItems, fetchApresentacoes, fetchStats às dependências se eles não mudarem. Caso contrário, pode causar loop.
          // Considerando que são estáveis, mantive o array de dependências vazio para carregar apenas uma vez.

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
    ...mutations,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
