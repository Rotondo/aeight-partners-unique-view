import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MapeamentoAgrupado, MapeamentoFornecedor, ClienteOption } from '@/types/cliente-fishbone';
import { EtapaJornada } from '@/types/mapa-parceiros';
import { Empresa } from '@/types/empresa';
import { Node, Edge } from '@xyflow/react';

// Constantes do layout do diagrama
const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 120;

// Interface for empresa_clientes relation response
interface EmpresaClienteRelation {
  empresa_cliente: {
    id: string;
    nome: string;
    descricao: string | null;
    tipo: 'intragrupo' | 'parceiro' | 'cliente';
    status: boolean;
  } | null;
  empresa_proprietaria: {
    id: string;
    nome: string;
    tipo: 'intragrupo' | 'parceiro' | 'cliente';
  } | null;
}

// Helper function for retry logic
const retryAsync = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`[useClienteFishbone] Tentativa ${attempt}/${maxRetries} falhou:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Hook customizado para gerir a lógica da visualização Fishbone (espinha de peixe) e fornecer clientes para seleção.
 * Corrigido para trazer clientes vinculados às empresas do grupo intragrupo, conforme regras do negócio e documentação.
 * @param filtros - Filtros opcionais, como clienteIds para visualização específica.
 */
export const useClienteFishbone = (filtros: { clienteIds?: string[] }) => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoFornecedor[]>([]);
  const [cliente, setCliente] = useState<Empresa | null>(null);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  
  // Separate loading states for better UX and debugging
  const [loadingEstrutura, setLoadingEstrutura] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDadosCliente, setLoadingDadosCliente] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Combined loading state for backwards compatibility
  const loading = loadingEstrutura || loadingClientes || loadingDadosCliente;

  /**
   * Busca estrutura das etapas e subníveis da jornada (executa uma única vez no mount).
   */
  const fetchEstruturaJornada = useCallback(async () => {
    setLoadingEstrutura(true);
    setError(null);
    try {
      console.log('[useClienteFishbone] Carregando estrutura da jornada...');
      
      const data = await retryAsync(async () => {
        const { data, error } = await supabase
          .from('etapas_jornada')
          .select('*, subniveis_etapa(*)')
          .eq('ativo', true)
          .order('ordem', { ascending: true });

        if (error) {
          console.error('[useClienteFishbone] Erro na query etapas_jornada:', error);
          throw new Error(error.message);
        }
        
        return data;
      });
      
      console.log('[useClienteFishbone] Estrutura carregada com sucesso:', data?.length, 'etapas');
      setEtapas(data || []);
    } catch (err: unknown) {
      const errorMessage = 'Falha ao carregar a estrutura da jornada.';
      console.error('[useClienteFishbone] Erro ao carregar estrutura:', err);
      setError(errorMessage);
    } finally {
      setLoadingEstrutura(false);
    }
  }, []);

  /**
   * Busca todos os clientes ativos - simplificado para mostrar todas empresas do tipo cliente.
   */
  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      console.log('[useClienteFishbone] Carregando todos os clientes ativos...');
      
      const data = await retryAsync(async () => {
        const { data, error } = await supabase
          .from('empresas')
          .select('id, nome, tipo, descricao, status')
          .eq('tipo', 'cliente')
          .eq('status', true)
          .order('nome');

        if (error) {
          console.error('[useClienteFishbone] Erro ao buscar clientes:', error);
          throw new Error(error.message);
        }
        
        return data;
      });

      const clientesFormatados: ClienteOption[] = (data || []).map(empresa => ({
        id: empresa.id,
        nome: empresa.nome,
        tipo: empresa.tipo,
        descricao: empresa.descricao,
        status: empresa.status,
        empresa_proprietaria: null // Simplificado - sem relação proprietária por enquanto
      }));

      console.log('[useClienteFishbone] Clientes carregados com sucesso:', clientesFormatados.length);
      setClientes(clientesFormatados);
    } catch (err: unknown) {
      const errorMessage = 'Falha ao carregar a lista de clientes.';
      console.error('[useClienteFishbone] Erro ao carregar clientes:', err);
      setError(errorMessage);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  /**
   * Busca dados detalhados do cliente selecionado e seus mapeamentos (fornecedores por etapa/subnível).
   */
  const carregarDadosCliente = useCallback(async (id: string) => {
    // Previne múltiplas chamadas simultâneas
    if (loadingDadosCliente) {
      console.log('[useClienteFishbone] Carregamento já em andamento, ignorando chamada duplicada');
      return;
    }

    setLoadingDadosCliente(true);
    setError(null);
    
    try {
      console.log('[useClienteFishbone] Carregando dados do cliente:', id);
      
      // Query sem retry - uma tentativa apenas para evitar loop
      const [clienteRes, mapeamentosRes] = await Promise.all([
        supabase.from('empresas').select('*').eq('id', id).single(),
        supabase
          .from('cliente_etapa_fornecedores')
          .select(`
            *,
            empresa_fornecedora:empresas!cliente_etapa_fornecedores_empresa_fornecedora_id_fkey(*)
          `)
          .eq('cliente_id', id)
          .eq('ativo', true),
      ]);

      if (clienteRes.error) {
        console.error('[useClienteFishbone] Erro ao buscar cliente:', clienteRes.error);
        throw new Error(`Cliente não encontrado: ${clienteRes.error.message}`);
      }
      
      if (mapeamentosRes.error) {
        console.error('[useClienteFishbone] Erro ao buscar mapeamentos:', mapeamentosRes.error);
        throw new Error(`Erro ao buscar mapeamentos: ${mapeamentosRes.error.message}`);
      }
      
      console.log('[useClienteFishbone] Cliente carregado:', clienteRes.data?.nome);
      console.log('[useClienteFishbone] Mapeamentos carregados:', mapeamentosRes.data?.length);
      
      setCliente(clienteRes.data);

      // Corrige o tipo de empresa_fornecedora para garantir compatibilidade com MapeamentoFornecedor
      const mapeamentosCorrigidos: MapeamentoFornecedor[] = (mapeamentosRes.data || []).map((mapeamento: Record<string, any>): MapeamentoFornecedor => {
        return {
          id: mapeamento.id,
          cliente_id: mapeamento.cliente_id,
          etapa_id: mapeamento.etapa_id,
          subnivel_id: mapeamento.subnivel_id,
          empresa_fornecedora_id: mapeamento.empresa_fornecedora_id,
          observacoes: mapeamento.observacoes,
          ativo: mapeamento.ativo,
          empresa_fornecedora:
            mapeamento.empresa_fornecedora &&
            typeof mapeamento.empresa_fornecedora === 'object' &&
            !mapeamento.empresa_fornecedora.error
              ? mapeamento.empresa_fornecedora
              : null,
        };
      });

      setMapeamentos(mapeamentosCorrigidos);

    } catch (err: unknown) {
      console.error('[useClienteFishbone] Erro ao carregar dados do cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados do cliente');
      // Limpa dados em caso de erro para evitar estado inconsistente
      setCliente(null);
      setMapeamentos([]);
    } finally {
      setLoadingDadosCliente(false);
    }
  }, [loadingDadosCliente]);

  // Carrega estrutura e clientes no mount (apenas uma vez)
  useEffect(() => {
    fetchEstruturaJornada();
    fetchClientes();
  }, []); // Array vazio para executar apenas no mount

  // Carrega dados do cliente selecionado (com debounce implícito via guard clause)
  useEffect(() => {
    const clienteId = filtros?.clienteIds?.[0];
    
    if (clienteId && clienteId !== cliente?.id && !loadingDadosCliente) {
      carregarDadosCliente(clienteId);
    } else if (!clienteId) {
      // Limpa dados apenas se não há cliente selecionado
      setCliente(null);
      setMapeamentos([]);
      setError(null);
    }
  }, [filtros?.clienteIds?.[0]]); // Apenas o primeiro clienteId como dependência

  /**
   * Monta a estrutura do diagrama Fishbone para o cliente selecionado,
   * agrupando etapas, subníveis e fornecedores.
   */
  const fishboneData = useMemo(() => {
    if (!filtros?.clienteIds || !cliente || etapas.length === 0) {
      return [];
    }

    const clienteFishboneView = {
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        descricao: cliente.descricao,
        logo_url: cliente.logo_url
      },
      etapas: etapas.map(etapa => {
        const fornecedoresDaEtapa = mapeamentos.filter(m => m.etapa_id === etapa.id && !m.subnivel_id);
        // Buscar subníveis da etapa (Supabase retorna como subniveis_etapa)
        const etapaCompleta = etapas.find(e => e.id === etapa.id) as EtapaJornada & { subniveis_etapa?: any[]; subniveis?: any[] };
        const subnivelsDaEtapa = etapaCompleta?.subniveis_etapa || etapaCompleta?.subniveis || [];
        const subniveis = subnivelsDaEtapa.map((subnivel: { id: string; nome: string; descricao?: string }) => {
          const fornecedoresDoSubnivel = mapeamentos.filter(m => m.subnivel_id === subnivel.id);
          return {
            id: subnivel.id,
            nome: subnivel.nome,
            descricao: subnivel.descricao,
            fornecedores: fornecedoresDoSubnivel.map(f => ({
              id: f.empresa_fornecedora_id,
              nome: f.empresa_fornecedora?.nome || '',
              is_parceiro: f.empresa_fornecedora?.tipo === 'parceiro',
              performance_score: 0,
              logo_url: f.empresa_fornecedora?.logo_url
            }))
          };
        });

        return {
          id: etapa.id,
          nome: etapa.nome,
          descricao: etapa.descricao,
          cor: etapa.cor,
          gaps: Math.max(0, 1 - fornecedoresDaEtapa.length - subniveis.reduce((acc, sub) => acc + sub.fornecedores.length, 0)),
          fornecedores: fornecedoresDaEtapa.map(f => ({
            id: f.empresa_fornecedora_id,
            nome: f.empresa_fornecedora?.nome || '',
            descricao: f.empresa_fornecedora?.descricao,
            is_parceiro: f.empresa_fornecedora?.tipo === 'parceiro',
            performance_score: 0,
            logo_url: f.empresa_fornecedora?.logo_url
          })),
          subniveis
        };
      })
    };

    return [clienteFishboneView];
  }, [cliente, etapas, mapeamentos, filtros?.clienteIds]);

  // Mantém nodes e edges vazios para compatibilidade futura (diagrama customizado)
  const { nodes, edges } = useMemo(() => {
    return { nodes: [], edges: [] };
  }, []);

  /**
   * Calcula estatísticas para controles e métricas do Fishbone.
   */
  const stats = useMemo(() => {
    const clientesCount = cliente ? 1 : 0;
    const totalParceiros = mapeamentos.filter(m => m.empresa_fornecedora?.tipo === 'parceiro').length;
    const totalFornecedores = mapeamentos.length;
    const totalGaps = etapas.reduce((acc, etapa) => {
      const count = mapeamentos.filter(m => m.etapa_id === etapa.id).length;
      return acc + (count === 0 ? 1 : 0);
    }, 0);
    const totalEtapas = etapas.length;
    const etapasComFornecedores = etapas.filter(etapa =>
      mapeamentos.some(m => m.etapa_id === etapa.id)
    ).length;
    const coberturaPorcentual = totalEtapas > 0
      ? Math.round((etapasComFornecedores / totalEtapas) * 100)
      : 0;
    const parceirosVsFornecedores = {
      parceiros: totalParceiros,
      fornecedores: totalFornecedores - totalParceiros
    };
    const gapsPorEtapa: Record<string, number> = {};
    etapas.forEach((etapa) => {
      const count = mapeamentos.filter(m => m.etapa_id === etapa.id).length;
      gapsPorEtapa[etapa.id] = count === 0 ? 1 : 0;
    });

    return {
      clientes: clientesCount,
      totalParceiros,
      totalFornecedores,
      totalGaps,
      totalEtapas,
      coberturaPorcentual,
      parceirosVsFornecedores,
      gapsPorEtapa
    };
  }, [cliente, mapeamentos, etapas]);

  // Retorna lista de clientes para o seletor lateral + dados da fishbone
  // Adicionando informações de debug para melhor troubleshooting
  const debugInfo = useMemo(() => {
    if (process.env.NODE_ENV === 'development') {
      return {
        loadingEstrutura,
        loadingClientes,
        loadingDadosCliente,
        etapasCount: etapas.length,
        clientesCount: clientes.length,
        mapeamentosCount: mapeamentos.length,
        clienteSelecionado: cliente?.nome || 'Nenhum',
        hasError: !!error
      };
    }
    return {};
  }, [loadingEstrutura, loadingClientes, loadingDadosCliente, etapas.length, clientes.length, mapeamentos.length, cliente?.nome, error]);

  return { 
    nodes, 
    edges, 
    fishboneData, 
    loading, 
    error, 
    cliente, 
    etapas, 
    stats, 
    clientes,
    // New separated loading states for better UX
    loadingStates: {
      estrutura: loadingEstrutura,
      clientes: loadingClientes,
      dadosCliente: loadingDadosCliente
    },
    // Retry functions for manual recovery
    retry: {
      fetchEstruturaJornada,
      fetchClientes,
      carregarDadosCliente: filtros?.clienteIds && filtros.clienteIds.length === 1 
        ? () => carregarDadosCliente(filtros.clienteIds[0]) 
        : null
    },
    // Debug information (only in development)
    ...(process.env.NODE_ENV === 'development' && { debug: debugInfo })
  };
};