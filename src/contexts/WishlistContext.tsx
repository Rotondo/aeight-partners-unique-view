import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useWishlistData } from "@/hooks/useWishlistData";
import { useWishlistMutations } from "@/hooks/useWishlistMutations";

const CONSOLE_PREFIX = "[WishlistContext]";

// Import types from types file
import { 
  WishlistItem as WishlistItemType,
  EmpresaCliente as EmpresaClienteType,
  WishlistApresentacao as WishlistApresentacaoType,
  WishlistStats as WishlistStatsType
} from "@/types/wishlist";

// Use imported types
export type WishlistItem = WishlistItemType;
export type EmpresaCliente = EmpresaClienteType;
export type WishlistApresentacao = WishlistApresentacaoType;
export type WishlistStats = WishlistStatsType;

interface WishlistContextType {
  // Estado principal
  wishlistItems: WishlistItem[];
  empresasClientes: EmpresaCliente[];
  apresentacoes: WishlistApresentacao[];
  stats: WishlistStats | null;
  loading: boolean;
  error: string | null;

  // Funções de busca
  fetchWishlistItems: () => Promise<void>;
  fetchEmpresasClientes: () => Promise<void>;
  fetchApresentacoes: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshItems: () => Promise<void>;

  // Mutations para wishlist items
  addWishlistItem?: (item: Omit<WishlistItem, "id" | "created_at" | "updated_at">) => Promise<void>;
  updateWishlistItem?: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  deleteWishlistItem?: (id: string) => Promise<void>;

  // Mutations para empresas clientes
  addEmpresaCliente?: (data: any) => Promise<void>;
  updateEmpresaCliente?: (id: string, updates: any) => Promise<void>;
  deleteEmpresaCliente?: (id: string) => Promise<void>;

  // Mutations para apresentações
  addApresentacao?: (data: any) => Promise<void>;
  updateApresentacao?: (id: string, updates: any) => Promise<void>;
  convertToOportunidade?: (itemId: string, oportunidadeData: any) => Promise<void>;
  solicitarApresentacao?: (data: any) => Promise<void>;

  // Função para inicializar dados
  initializeData: () => Promise<void>;
}

// Criação do contexto
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Provider component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializationRef = useRef(false);

  // Usar o hook de dados
  const {
    empresasClientes,
    wishlistItems,
    apresentacoes,
    stats,
    setEmpresasClientes,
    setWishlistItems,
    setApresentacoes,
    setStats,
    fetchEmpresasClientes: fetchEmpresasClientesData,
    fetchWishlistItems: fetchWishlistItemsData,
    fetchApresentacoes: fetchApresentacoesData,
    fetchStats: fetchStatsData,
  } = useWishlistData();

  // Usar o hook de mutations - Agora passa fetchApresentacoes também para wishlistItem mutations
  const {
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
  } = useWishlistMutations(
    fetchEmpresasClientesData,
    async () => {
      await fetchWishlistItemsData();
      await fetchApresentacoesData(); // Recarregar apresentações quando wishlist items mudarem
    },
    fetchApresentacoesData
  );

  // Função de inicialização dos dados
  const initializeData = useCallback(async () => {
    if (initializationRef.current) {
      console.log(`${CONSOLE_PREFIX} Inicialização já em andamento, pulando...`);
      return;
    }

    console.log(`${CONSOLE_PREFIX} Iniciando carregamento inicial de dados...`);
    initializationRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Carregar empresas clientes primeiro (dados principais)
      console.log(`${CONSOLE_PREFIX} Carregando empresas clientes...`);
      await fetchEmpresasClientesData();

      // Carregar demais dados em paralelo
      console.log(`${CONSOLE_PREFIX} Carregando dados complementares...`);
      await Promise.all([
        fetchWishlistItemsData(),
        fetchApresentacoesData(),
        fetchStatsData(),
      ]);

      console.log(`${CONSOLE_PREFIX} Todos os dados carregados com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error(`${CONSOLE_PREFIX} Erro no carregamento inicial:`, err);
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da wishlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      initializationRef.current = false;
    }
  }, [fetchEmpresasClientesData, fetchWishlistItemsData, fetchApresentacoesData, fetchStatsData]);

  // Remover o carregamento automático ao montar
  // useEffect(() => {
  //   initializeData();
  // }, []);

  // Função para recarregar todos os dados
  const refreshItems = useCallback(async () => {
    console.log(`${CONSOLE_PREFIX} Atualizando todos os dados...`);
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchEmpresasClientesData(),
        fetchWishlistItemsData(),
        fetchApresentacoesData(),
        fetchStatsData(),
      ]);
      console.log(`${CONSOLE_PREFIX} Dados atualizados com sucesso`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      console.error(`${CONSOLE_PREFIX} Erro na atualização:`, err);
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchEmpresasClientesData, fetchWishlistItemsData, fetchApresentacoesData, fetchStatsData]);

  // Funções de busca individuais, todas memorizadas!
  const fetchWishlistItems = useCallback(async () => {
    setLoading(true);
    try {
      await fetchWishlistItemsData();
      await fetchApresentacoesData(); // Sempre recarregar apresentações junto
    } catch (err) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar wishlist items:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistItemsData, fetchApresentacoesData]);

  const fetchEmpresasClientes = useCallback(async () => {
    setLoading(true);
    try {
      await fetchEmpresasClientesData();
    } catch (err) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar empresas clientes:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEmpresasClientesData]);

  const fetchApresentacoes = useCallback(async () => {
    setLoading(true);
    try {
      await fetchApresentacoesData();
    } catch (err) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar apresentações:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchApresentacoesData]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStatsData();
    } catch (err) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar estatísticas:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStatsData]);

  // Logs de diagnóstico
  useEffect(() => {
    console.log(`${CONSOLE_PREFIX} Estado atual:`, {
      empresasClientes: empresasClientes?.length || 0,
      wishlistItems: wishlistItems?.length || 0,
      apresentacoes: apresentacoes?.length || 0,
      loading,
      error,
    });
  }, [empresasClientes, wishlistItems, apresentacoes, loading, error]);

  // Adicionar initializeData ao contexto
  const value: WishlistContextType = {
    // Estado
    wishlistItems: wishlistItems || [],
    empresasClientes: empresasClientes || [],
    apresentacoes: apresentacoes || [],
    stats,
    loading,
    error,

    // Funções de busca
    fetchWishlistItems,
    fetchEmpresasClientes,
    fetchApresentacoes,
    fetchStats,
    refreshItems,

    // Mutations
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
    addApresentacao,
    updateApresentacao,
    convertToOportunidade,
    solicitarApresentacao,

    // Função para inicializar dados
    initializeData,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook para usar o contexto
export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist deve ser usado dentro de um WishlistProvider");
  }
  return context;
}

// Exportação padrão para permitir imports mais limpos
export default WishlistProvider;
