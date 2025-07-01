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

// Definição dos tipos básicos para o contexto
export interface WishlistItem {
  id: string;
  created_at: string;
  title?: string;
  description?: string | null;
  url?: string | null;
  priority?: "alta" | "média" | "baixa";
  status?: "pendente" | "em_andamento" | "concluído";
  tipo?: "feature" | "bug" | "melhoria" | "outro";
  user_id?: string;
  votes?: number;
  assignee_id?: string | null;
  empresa_interessada_id: string;
  empresa_desejada_id: string;
  empresa_proprietaria_id: string;
  motivo?: string;
  prioridade: number;
  data_solicitacao: string;
  data_resposta?: string;
  observacoes?: string;
  updated_at: string;
  empresa_interessada?: any;
  empresa_desejada?: any;
  empresa_proprietaria?: any;
  apresentacoes?: any[];
}

export interface EmpresaCliente {
  id: string;
  empresa_proprietaria_id: string;
  empresa_cliente_id: string;
  data_relacionamento: string;
  status: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  empresa_proprietaria?: any;
  empresa_cliente?: any;
}

export interface WishlistApresentacao {
  id: string;
  wishlist_item_id: string;
  empresa_facilitadora_id: string;
  data_apresentacao: string;
  tipo_apresentacao: string;
  status_apresentacao: string;
  feedback?: string;
  converteu_oportunidade: boolean;
  oportunidade_id?: string;
  created_at: string;
  updated_at: string;
  wishlist_item?: WishlistItem;
  empresa_facilitadora?: any;
  oportunidade?: any;
}

export interface WishlistStats {
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  apresentacoesRealizadas: number;
  conversaoOportunidades: number;
  empresasMaisDesejadas: { nome: string; total: number }[];
  facilitacoesPorParceiro: { parceiro: string; total: number }[];
}

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
  addItem?: (item: Omit<WishlistItem, "id" | "created_at" | "votes">) => Promise<void>;
  updateItem?: (id: string, updates: Partial<WishlistItem>) => Promise<void>;
  deleteItem?: (id: string) => Promise<void>;
  voteItem?: (id: string) => Promise<void>;

  // Mutations para empresas clientes
  addEmpresaCliente?: (data: any) => Promise<void>;
  updateEmpresaCliente?: (id: string, updates: any) => Promise<void>;
  deleteEmpresaCliente?: (id: string) => Promise<void>;

  // Mutations para apresentações
  solicitarApresentacao?: (data: any) => Promise<void>;
  updateApresentacao?: (id: string, updates: any) => Promise<void>;
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

  // Usar o hook de mutations
  const {
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
    solicitarApresentacao,
    updateApresentacao,
  } = useWishlistMutations({
    setEmpresasClientes,
    setWishlistItems,
    setApresentacoes,
    setStats,
  });

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

  // Carregar dados quando o componente montar
  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Apenas na montagem inicial

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
    } catch (err) {
      console.error(`${CONSOLE_PREFIX} Erro ao buscar wishlist items:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWishlistItemsData]);

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
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
    solicitarApresentacao,
    updateApresentacao,
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
