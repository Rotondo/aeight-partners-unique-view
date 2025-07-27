import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { Oportunidade, Empresa, Usuario, OportunidadesFilterParams } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface OportunidadesContextType {
  oportunidades: Oportunidade[];
  filteredOportunidades: Oportunidade[];
  empresas: Empresa[];
  usuarios: Usuario[];
  isLoading: boolean;
  error: string | null;
  filterParams: OportunidadesFilterParams;
  setFilterParams: (params: OportunidadesFilterParams) => void;
  refreshData: () => Promise<void>;
  loadOportunidades: () => Promise<void>;
  getOportunidade: (id: string) => Promise<Oportunidade | null>;
  createOportunidade: (data: Partial<Oportunidade>) => Promise<boolean>;
  updateOportunidade: (id: string, data: Partial<Oportunidade>) => Promise<boolean>;
  deleteOportunidade: (id: string) => Promise<boolean>;
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
  const [filterParams, setFilterParams] = useState<OportunidadesFilterParams>({});

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
        .select("id, nome, tipo, status")
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
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo, status),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo, status),
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
      setOportunidades(data as Oportunidade[] || []);
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

  // Função para obter uma oportunidade específica
  const getOportunidade = async (id: string): Promise<Oportunidade | null> => {
    try {
      const { data, error } = await supabase
        .from("oportunidades")
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo, status),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo, status),
          usuario_envio:usuarios!usuario_envio_id(id, nome, email),
          usuario_recebe:usuarios!usuario_recebe_id(id, nome, email),
          contato:contatos(id, nome, email, telefone)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Oportunidade;
    } catch (error) {
      console.error('[OportunidadesContext] Erro ao buscar oportunidade:', error);
      return null;
    }
  };

  // Função para criar nova oportunidade
  const createOportunidade = async (data: Partial<Oportunidade>): Promise<boolean> => {
    try {
      // Garantir que os campos obrigatórios estejam presentes
      if (!data.empresa_origem_id || !data.empresa_destino_id || !data.nome_lead) {
        throw new Error('Campos obrigatórios faltando');
      }

      // Map status to valid database enum values
      let validStatus: string = 'em_contato'; // default value
      if (data.status) {
        const statusMapping: Record<string, string> = {
          'indicado': 'em_contato',
          'em_andamento': 'negociando',
          'fechado': 'ganho',
          'cancelado': 'perdido'
        };
        validStatus = statusMapping[data.status] || data.status;
      }

      // Prepare the insert data with only fields that exist in the database schema
      const insertData = {
        empresa_origem_id: data.empresa_origem_id,
        empresa_destino_id: data.empresa_destino_id,
        nome_lead: data.nome_lead,
        contato_id: data.contato_id || null,
        valor: data.valor || null,
        status: validStatus,
        data_indicacao: data.data_indicacao || new Date().toISOString(),
        data_fechamento: data.data_fechamento || null,
        motivo_perda: data.motivo_perda || null,
        usuario_envio_id: data.usuario_envio_id || null,
        usuario_recebe_id: data.usuario_recebe_id || null,
        observacoes: data.observacoes || null
      };

      const { error } = await supabase
        .from("oportunidades")
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Oportunidade criada",
        description: "A oportunidade foi criada com sucesso.",
      });

      await loadOportunidades();
      return true;
    } catch (error) {
      console.error('[OportunidadesContext] Erro ao criar oportunidade:', error);
      toast({
        title: "Erro ao criar oportunidade",
        description: "Ocorreu um erro ao criar a oportunidade.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para atualizar oportunidade
  const updateOportunidade = async (id: string, data: Partial<Oportunidade>): Promise<boolean> => {
    try {
      const updateData: any = {};
      
      // Mapear apenas os campos que podem ser atualizados
      if (data.empresa_origem_id) updateData.empresa_origem_id = data.empresa_origem_id;
      if (data.empresa_destino_id) updateData.empresa_destino_id = data.empresa_destino_id;
      if (data.nome_lead) updateData.nome_lead = data.nome_lead;
      if (data.contato_id !== undefined) updateData.contato_id = data.contato_id;
      if (data.valor !== undefined) updateData.valor = data.valor;
      if (data.status) updateData.status = data.status;
      if (data.data_indicacao) updateData.data_indicacao = data.data_indicacao;
      if (data.data_fechamento !== undefined) updateData.data_fechamento = data.data_fechamento;
      if (data.motivo_perda !== undefined) updateData.motivo_perda = data.motivo_perda;
      if (data.usuario_envio_id !== undefined) updateData.usuario_envio_id = data.usuario_envio_id;
      if (data.usuario_recebe_id !== undefined) updateData.usuario_recebe_id = data.usuario_recebe_id;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

      const { error } = await supabase
        .from("oportunidades")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Oportunidade atualizada",
        description: "A oportunidade foi atualizada com sucesso.",
      });

      await loadOportunidades();
      return true;
    } catch (error) {
      console.error('[OportunidadesContext] Erro ao atualizar oportunidade:', error);
      toast({
        title: "Erro ao atualizar oportunidade",
        description: "Ocorreu um erro ao atualizar a oportunidade.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para deletar oportunidade
  const deleteOportunidade = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("oportunidades")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Oportunidade excluída",
        description: "A oportunidade foi excluída com sucesso.",
      });

      await loadOportunidades();
      return true;
    } catch (error) {
      console.error('[OportunidadesContext] Erro ao deletar oportunidade:', error);
      toast({
        title: "Erro ao excluir oportunidade",
        description: "Ocorreu um erro ao excluir a oportunidade.",
        variant: "destructive",
      });
      return false;
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
    if (filterParams.dataInicio) {
      filtered = filtered.filter(op => 
        new Date(op.data_indicacao) >= new Date(filterParams.dataInicio!)
      );
    }

    if (filterParams.dataFim) {
      filtered = filtered.filter(op => 
        new Date(op.data_indicacao) <= new Date(filterParams.dataFim!)
      );
    }

    if (filterParams.status) {
      filtered = filtered.filter(op => op.status === filterParams.status);
    }

    if (filterParams.empresaOrigemId) {
      filtered = filtered.filter(op => op.empresa_origem_id === filterParams.empresaOrigemId);
    }

    if (filterParams.empresaDestinoId) {
      filtered = filtered.filter(op => op.empresa_destino_id === filterParams.empresaDestinoId);
    }

    if (filterParams.usuarioId) {
      filtered = filtered.filter(op => op.usuario_recebe_id === filterParams.usuarioId);
    }

    if (filterParams.searchTerm?.trim()) {
      const searchLower = filterParams.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(op =>
        op.nome_lead.toLowerCase().includes(searchLower) ||
        op.empresa_origem?.nome.toLowerCase().includes(searchLower) ||
        op.empresa_destino?.nome.toLowerCase().includes(searchLower) ||
        op.observacoes?.toLowerCase().includes(searchLower)
      );
    }

    if (filterParams.valorStatus) {
      if (filterParams.valorStatus === "com_valor") {
        filtered = filtered.filter(op => typeof op.valor === "number" && !isNaN(op.valor) && op.valor > 0);
      } else if (filterParams.valorStatus === "sem_valor") {
        filtered = filtered.filter(op => !(typeof op.valor === "number" && !isNaN(op.valor) && op.valor > 0));
      }
    }

    console.log('[OportunidadesContext] Filtros aplicados:', {
      total: oportunidades.length,
      filtrados: filtered.length,
      filtros: filterParams
    });

    return filtered;
  }, [oportunidades, filterParams]);

  const contextValue: OportunidadesContextType = {
    oportunidades,
    filteredOportunidades,
    empresas,
    usuarios,
    isLoading,
    error,
    filterParams,
    setFilterParams,
    refreshData,
    loadOportunidades,
    getOportunidade,
    createOportunidade,
    updateOportunidade,
    deleteOportunidade,
  };

  return (
    <OportunidadesContext.Provider value={contextValue}>
      {children}
    </OportunidadesContext.Provider>
  );
};
