
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { EmpresaCliente, WishlistItem, WishlistApresentacao, WishlistStats } from "@/types/wishlist";
import { Oportunidade } from "@/types/oportunidade"; // For convertToOportunidade
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  // Empresa Cliente
  empresasClientes: EmpresaCliente[];
  fetchEmpresasClientes: () => Promise<void>;
  isLoadingEmpresas: boolean;

  // Wishlist Items
  wishlistItems: WishlistItem[];
  fetchWishlistItems: () => Promise<void>;
  isLoadingWishlist: boolean;

  // Apresentações
  apresentacoes: WishlistApresentacao[];
  fetchApresentacoes: () => Promise<void>;
  isLoadingApresentacoes: boolean;

  // Estado geral
  isLoading: boolean; // This is a combined loading state
  error: string | null;

  // Stats
  stats: WishlistStats | null; // Or appropriate type

  // Mutations - EmpresaCliente
  addEmpresaCliente: (item: Partial<EmpresaCliente>) => Promise<void>;
  updateEmpresaCliente: (id: string, updates: Partial<EmpresaCliente>) => Promise<void>;

  // Mutations - WishlistItem
  addWishlistItem: (item: Partial<WishlistItem>) => Promise<void>;
  updateWishlistItem: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  convertToOportunidade: (item: WishlistItem) => Promise<Oportunidade | null>;

  // Mutations - Apresentacao
  addApresentacao: (item: Partial<WishlistApresentacao>) => Promise<void>;
  solicitarApresentacao: (itemId: string, facilitadorId: string) => Promise<void>; // Example signature
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Placeholder functions for mutations
const placeholderAddEmpresaCliente = async (item: Partial<EmpresaCliente>) => { console.log("addEmpresaCliente called", item); };
const placeholderUpdateEmpresaCliente = async (id: string, updates: Partial<EmpresaCliente>) => { console.log("updateEmpresaCliente called", id, updates); };
const placeholderAddWishlistItem = async (item: Partial<WishlistItem>) => { console.log("addWishlistItem called", item); };
const placeholderUpdateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => { console.log("updateWishlistItem called", id, updates); };
const placeholderConvertToOportunidade = async (item: WishlistItem): Promise<Oportunidade | null> => { console.log("convertToOportunidade called", item); return null; };
const placeholderAddApresentacao = async (item: Partial<WishlistApresentacao>) => { console.log("addApresentacao called", item); };
const placeholderSolicitarApresentacao = async (itemId: string, facilitadorId: string) => { console.log("solicitarApresentacao called", itemId, facilitadorId); };

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<WishlistApresentacao[]>([]);
  
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isLoadingApresentacoes, setIsLoadingApresentacoes] = useState(false);
  const [stats, setStats] = useState<WishlistStats | null>(null); // Added stats state
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  
  // Ref para evitar dupla execução em StrictMode
  const initRef = useRef(false);

  const fetchEmpresasClientes = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando empresas clientes...");
    setIsLoadingEmpresas(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('empresas_clientes')
        .select(`
          id,
          empresa_proprietaria_id,
          empresa_cliente_id,
          data_relacionamento,
          status,
          observacoes,
          created_at,
          updated_at,
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, tipo, status, descricao),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo, status, descricao)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Empresas clientes carregadas:", data?.length || 0);
      setEmpresasClientes((data as EmpresaCliente[]) || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar empresas clientes:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmpresas(false);
    }
  };

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando wishlist items...");
    setIsLoadingWishlist(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          empresa_interessada_id,
          empresa_desejada_id,
          empresa_proprietaria_id,
          motivo,
          prioridade,
          status,
          data_solicitacao,
          data_resposta,
          observacoes,
          created_at,
          updated_at,
          empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(id, nome, tipo, status, descricao),
          empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(id, nome, tipo, status, descricao),
          empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(id, nome, tipo, status, descricao)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Wishlist items carregados:", data?.length || 0);
      setWishlistItems((data as WishlistItem[]) || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar wishlist items:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar items da wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const fetchApresentacoes = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando apresentações...");
    setIsLoadingApresentacoes(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('wishlist_apresentacoes')
        .select(`
          id,
          wishlist_item_id,
          empresa_facilitadora_id,
          data_apresentacao,
          tipo_apresentacao,
          status_apresentacao,
          feedback,
          converteu_oportunidade,
          oportunidade_id,
          created_at,
          updated_at,
          empresa_facilitadora:empresas!wishlist_apresentacoes_empresa_facilitadora_id_fkey(id, nome, tipo, status, descricao),
          oportunidade:oportunidades!wishlist_apresentacoes_oportunidade_id_fkey(id, nome_lead, status, valor),
          wishlist_item:wishlist_items!wishlist_apresentacoes_wishlist_item_id_fkey(
            id,
            status,
            empresa_interessada:empresas!wishlist_items_empresa_interessada_id_fkey(id, nome),
            empresa_desejada:empresas!wishlist_items_empresa_desejada_id_fkey(id, nome),
            empresa_proprietaria:empresas!wishlist_items_empresa_proprietaria_id_fkey(id, nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Apresentações carregadas:", data?.length || 0);
      setApresentacoes((data as WishlistApresentacao[]) || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar apresentações:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar apresentações",
        variant: "destructive"
      });
    } finally {
      setIsLoadingApresentacoes(false);
    }
  };

  // Inicialização com proteção contra dupla execução
  useEffect(() => {
    if (!user || initRef.current) return;
    
    initRef.current = true;
    console.log("[WishlistContext] Inicializando contexto para usuário:", user.id);
    
    // Executar todos os fetches em paralelo
    Promise.all([
      fetchEmpresasClientes(),
      fetchWishlistItems(),
      fetchApresentacoes()
    ]).then(() => {
      console.log("[WishlistContext] Inicialização completa");
    });

    return () => {
      initRef.current = false;
    };
  }, [user]);

  const isLoading = isLoadingEmpresas || isLoadingWishlist || isLoadingApresentacoes;

  const value: WishlistContextType = {
    // Empresa Cliente
    empresasClientes,
    fetchEmpresasClientes,
    isLoadingEmpresas,

    // Wishlist Items
    wishlistItems,
    fetchWishlistItems,
    isLoadingWishlist,

    // Apresentações
    apresentacoes,
    fetchApresentacoes,
    isLoadingApresentacoes,

    // Estado geral
    isLoading,
    error,

    // Stats
    stats,

    // Mutations - EmpresaCliente
    addEmpresaCliente: placeholderAddEmpresaCliente,
    updateEmpresaCliente: placeholderUpdateEmpresaCliente,

    // Mutations - WishlistItem
    addWishlistItem: placeholderAddWishlistItem,
    updateWishlistItem: placeholderUpdateWishlistItem,
    convertToOportunidade: placeholderConvertToOportunidade,

    // Mutations - Apresentacao
    addApresentacao: placeholderAddApresentacao,
    solicitarApresentacao: placeholderSolicitarApresentacao,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist deve ser usado dentro de um WishlistProvider");
  }
  return context;
};
