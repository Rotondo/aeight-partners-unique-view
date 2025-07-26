
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Oportunidade, Empresa, Usuario } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FilterState {
  dataInicio: Date | null;
  dataFim: Date | null;
  status: string | null;
  empresaOrigem: string | null;
  empresaDestino: string | null;
  searchTerm: string;
}

interface OportunidadesContextType {
  oportunidades: Oportunidade[];
  filteredOportunidades: Oportunidade[] | null;
  empresas: Empresa[];
  usuarios: Usuario[];
  isLoading: boolean;
  error: string | null;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  refreshData: () => Promise<void>;
  loadOportunidades: () => Promise<void>;
}

const OportunidadesContext = createContext<OportunidadesContextType | undefined>(undefined);

export const useOportunidades = () => {
  const context = useContext(OportunidadesContext);
  if (context === undefined) {
    throw new Error("useOportunidades must be used within an OportunidadesProvider");
  }
  return context;
};

interface OportunidadesProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
}

export const OportunidadesProvider: React.FC<OportunidadesProviderProps> = ({ 
  children, 
  autoLoad = true 
}) => {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dataInicio: null,
    dataFim: null,
    status: null,
    empresaOrigem: null,
    empresaDestino: null,
    searchTerm: "",
  });

  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Função para carregar empresas com timeout
  const loadEmpresas = async () => {
    try {
      console.log('[OportunidadesContext] Carregando empresas...');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar empresas')), 8000)
      );

      const queryPromise = supabase
        .from("empresas")
        .select("*")
        .eq("status", true)
        .order("nome");

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('[OportunidadesContext] Erro ao carregar empresas:', error);
        return [];
      }

      console.log('[OportunidadesContext] Empresas carregadas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[OportunidadesContext] Timeout/erro ao carregar empresas:', error);
      return [];
    }
  };

  // Função para carregar usuários com timeout
  const loadUsuarios = async () => {
    try {
      console.log('[OportunidadesContext] Carregando usuários...');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar usuários')), 8000)
      );

      const queryPromise = supabase
        .from("usuarios")
        .select(`
          id,
          nome,
          email,
          papel,
          empresa_id,
          ativo,
          created_at,
          empresa:empresas(id, nome, tipo)
        `)
        .eq("ativo", true)
        .order("nome");

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('[OportunidadesContext] Erro ao carregar usuários:', error);
        return [];
      }

      console.log('[OportunidadesContext] Usuários carregados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('[OportunidadesContext] Timeout/erro ao carregar usuários:', error);
      return [];
    }
  };

  // Função para carregar oportunidades com timeout
  const loadOportunidades = async () => {
    if (!isAuthenticated) {
      console.log('[OportunidadesContext] Usuário não autenticado, pulando carregamento');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('[OportunidadesContext] Carregando oportunidades...');
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar oportunidades')), 10000)
      );

      const queryPromise = supabase
        .from("oportunidades")
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo),
          usuario_envio:usuarios!usuario_envio_id(id, nome, email),
          usuario_recebe:usuarios!usuario_recebe_id(id, nome, email),
          contato:contatos(id, nome, email, telefone)
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('[OportunidadesContext] Erro ao carregar oportunidades:', error);
        throw error;
      }

      console.log('[OportunidadesContext] Oportunidades carregadas:', data?.length || 0);
      setOportunidades(data || []);
    } catch (error: any) {
      console.error('[OportunidadesContext] Erro/timeout ao carregar oportunidades:', error);
      const errorMessage = error.message || 'Erro ao carregar oportunidades';
      setError(errorMessage);
      toast({
        title: "Erro ao carregar oportunidades",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para refresh completo dos dados
  const refreshData = async () => {
    if (!isAuthenticated) {
      console.log('[OportunidadesContext] Usuário não autenticado, pulando refresh');
      return;
    }

    console.log('[OportunidadesContext] Iniciando refresh completo dos dados...');
    
    try {
      setIsLoading(true);
      setError(null);

      // Carregar dados em paralelo com timeouts individuais
      const [empresasData, usuariosData] = await Promise.all([
        loadEmpresas(),
        loadUsuarios(),
      ]);

      setEmpresas(empresasData);
      setUsuarios(usuariosData);

      // Carregar oportunidades por último
      await loadOportunidades();

      console.log('[OportunidadesContext] Refresh completo finalizado');
    } catch (error: any) {
      console.error('[OportunidadesContext] Erro no refresh:', error);
      setError('Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (autoLoad && isAuthenticated && user) {
      console.log('[OportunidadesContext] Carregamento automático iniciado para:', user.nome);
      refreshData();
    }
  }, [autoLoad, isAuthenticated, user]);

  // Filtrar oportunidades
  const filteredOportunidades = React.useMemo(() => {
    if (!oportunidades || oportunidades.length === 0) {
      return [];
    }

    let filtered = [...oportunidades];

    // Aplicar filtros
    if (filters.dataInicio) {
      filtered = filtered.filter(op => 
        new Date(op.data_indicacao) >= filters.dataInicio!
      );
    }

    if (filters.dataFim) {
      filtered = filtered.filter(op => 
        new Date(op.data_indicacao) <= filters.dataFim!
      );
    }

    if (filters.status && filters.status !== "todos") {
      filtered = filtered.filter(op => op.status === filters.status);
    }

    if (filters.empresaOrigem) {
      filtered = filtered.filter(op => op.empresa_origem_id === filters.empresaOrigem);
    }

    if (filters.empresaDestino) {
      filtered = filtered.filter(op => op.empresa_destino_id === filters.empresaDestino);
    }

    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(op =>
        op.nome_lead.toLowerCase().includes(searchLower) ||
        op.empresa_origem?.nome.toLowerCase().includes(searchLower) ||
        op.empresa_destino?.nome.toLowerCase().includes(searchLower) ||
        op.observacoes?.toLowerCase().includes(searchLower)
      );
    }

    console.log('[OportunidadesContext] Filtros aplicados:', {
      total: oportunidades.length,
      filtrados: filtered.length,
      filtros: filters
    });

    return filtered;
  }, [oportunidades, filters]);

  const contextValue: OportunidadesContextType = {
    oportunidades,
    filteredOportunidades,
    empresas,
    usuarios,
    isLoading,
    error,
    filters,
    setFilters,
    refreshData,
    loadOportunidades,
  };

  return (
    <OportunidadesContext.Provider value={contextValue}>
      {children}
    </OportunidadesContext.Provider>
  );
};
