import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MapeamentoAgrupado, MapeamentoFornecedor, ClienteOption } from '@/types/cliente-fishbone';
import { EtapaJornada } from '@/types/mapa-parceiros';
import { Empresa } from '@/types/empresa';
import { Node, Edge } from '@xyflow/react';
import { validateFishboneHookData, logValidationResults } from '@/types/cliente-fishbone-validation';

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
  // Input validation
  if (filtros && filtros.clienteIds && !Array.isArray(filtros.clienteIds)) {
    console.warn('[useClienteFishbone] clienteIds must be an array, received:', typeof filtros.clienteIds);
    filtros = { clienteIds: [] };
  }
  
  if (filtros?.clienteIds && !filtros.clienteIds.every(id => typeof id === 'string' && id.length > 0)) {
    console.warn('[useClienteFishbone] All clienteIds must be non-empty strings:', filtros.clienteIds);
    filtros = { clienteIds: filtros.clienteIds.filter(id => typeof id === 'string' && id.length > 0) };
  }
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
   * Busca todos os clientes ativos que são clientes das empresas do grupo intragrupo.
   * Utiliza a tabela empresa_clientes, garantindo que o campo empresa_proprietaria seja do tipo 'intragrupo'.
   * Só retorna clientes ativos, evitando duplicidade.
   */
  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      console.log('[useClienteFishbone] Carregando lista de clientes...');
      
      const data = await retryAsync(async () => {
        // Busca todas as relações empresa_proprietaria (intragrupo) -> empresa_cliente
        // Fixed: Removed problematic order by nested field and logo_url field
        const { data, error } = await supabase
          .from('empresa_clientes')
          .select(`
            empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, descricao, tipo, status),
            empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo)
          `);

        if (error) {
          console.error('[useClienteFishbone] Erro na query empresa_clientes:', error);
          throw new Error(error.message);
        }
        
        return data;
      });

      // Filtra apenas empresas clientes ativas, vinculadas a proprietárias do tipo intragrupo
      const clientesFormatados: ClienteOption[] = (data || [])
        .filter((rel: EmpresaClienteRelation) => {
          const isValid = rel.empresa_cliente &&
            rel.empresa_cliente.status === true &&
            rel.empresa_proprietaria &&
            rel.empresa_proprietaria.tipo === 'intragrupo';
          
          if (!isValid) {
            console.log('[useClienteFishbone] Cliente filtrado:', rel.empresa_cliente?.nome, 'status:', rel.empresa_cliente?.status, 'proprietaria tipo:', rel.empresa_proprietaria?.tipo);
          }
          
          return isValid;
        })
        .map((rel: EmpresaClienteRelation): ClienteOption => ({
          id: rel.empresa_cliente!.id,
          nome: rel.empresa_cliente!.nome,
          tipo: rel.empresa_cliente!.tipo,
          descricao: rel.empresa_cliente!.descricao,
          status: rel.empresa_cliente!.status,
          empresa_proprietaria: {
            id: rel.empresa_proprietaria!.id,
            nome: rel.empresa_proprietaria!.nome,
            tipo: rel.empresa_proprietaria!.tipo,
          },
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome)); // Sort after filtering

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
    setLoadingDadosCliente(true);
    setError(null);
    try {
      console.log('[useClienteFishbone] Carregando dados do cliente:', id);
      
      const [clienteData, mapeamentosData] = await retryAsync(async () => {
        const [clienteRes, mapeamentosRes] = await Promise.all([
          supabase.from('empresas').select('*').eq('id', id).single(),
          supabase
            .from('cliente_etapa_fornecedores')
            .select('*, empresa_fornecedora:empresas(*)')
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
        
        return [clienteRes.data, mapeamentosRes.data];
      });
      
      console.log('[useClienteFishbone] Cliente carregado:', clienteData?.nome);
      console.log('[useClienteFishbone] Mapeamentos carregados:', mapeamentosData?.length);
      
      setCliente(clienteData);

      // Corrige o tipo de empresa_fornecedora para garantir compatibilidade com MapeamentoFornecedor
      const mapeamentosCorrigidos: MapeamentoFornecedor[] = (mapeamentosData || []).map((mapeamento: Record<string, any>): MapeamentoFornecedor => {
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
    } finally {
      setLoadingDadosCliente(false);
    }
  }, []);

  // Carrega estrutura e clientes no mount
  useEffect(() => {
    fetchEstruturaJornada();
    fetchClientes();
  }, [fetchEstruturaJornada, fetchClientes]);

  // Carrega dados do cliente selecionado
  useEffect(() => {
    if (filtros?.clienteIds && filtros.clienteIds.length === 1) {
      carregarDadosCliente(filtros.clienteIds[0]);
    } else if (filtros?.clienteIds && filtros.clienteIds.length > 1) {
      console.warn('[useClienteFishbone] Multiple clients selected, but only single client view is supported. Using first client:', filtros.clienteIds[0]);
      carregarDadosCliente(filtros.clienteIds[0]);
    } else {
      setCliente(null);
      setMapeamentos([]);
    }
  }, [filtros?.clienteIds, carregarDadosCliente]);

  /**
   * Monta a estrutura do diagrama Fishbone para o cliente selecionado,
   * agrupando etapas, subníveis e fornecedores.
   */
  const fishboneData = useMemo(() => {
    if (!filtros?.clienteIds || filtros.clienteIds.length === 0 || !cliente || etapas.length === 0) {
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
            fornecedores: fornecedoresDoSubnivel
              .filter(f => f.empresa_fornecedora) // Ensure valid supplier data
              .map(f => ({
                id: f.empresa_fornecedora_id,
                nome: f.empresa_fornecedora?.nome || 'Nome não disponível',
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
          fornecedores: fornecedoresDaEtapa
            .filter(f => f.empresa_fornecedora) // Ensure valid supplier data
            .map(f => ({
              id: f.empresa_fornecedora_id,
              nome: f.empresa_fornecedora?.nome || 'Nome não disponível',
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
    const totalFornecedores = mapeamentos.filter(m => m.empresa_fornecedora).length; // Only count valid suppliers
    const totalGaps = etapas.reduce((acc, etapa) => {
      const count = mapeamentos.filter(m => m.etapa_id === etapa.id && m.empresa_fornecedora).length;
      return acc + (count === 0 ? 1 : 0);
    }, 0);
    const totalEtapas = etapas.length;
    const etapasComFornecedores = etapas.filter(etapa =>
      mapeamentos.some(m => m.etapa_id === etapa.id && m.empresa_fornecedora)
    ).length;
    const coberturaPorcentual = totalEtapas > 0
      ? Math.round((etapasComFornecedores / totalEtapas) * 100)
      : 0;
    const parceirosVsFornecedores = {
      parceiros: totalParceiros,
      fornecedores: Math.max(0, totalFornecedores - totalParceiros)
    };
    const gapsPorEtapa: Record<string, number> = {};
    etapas.forEach((etapa) => {
      const count = mapeamentos.filter(m => m.etapa_id === etapa.id && m.empresa_fornecedora).length;
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

  // Validate all data before returning
  const validationResult = useMemo(() => {
    return validateFishboneHookData({
      fishboneData,
      clientes,
      cliente,
      etapas,
      mapeamentos
    });
  }, [fishboneData, clientes, cliente, etapas, mapeamentos]);

  // Log validation results in development
  useEffect(() => {
    logValidationResults('useClienteFishbone', validationResult);
  }, [validationResult]);

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
      carregarDadosCliente: filtros?.clienteIds && filtros.clienteIds.length >= 1 
        ? () => carregarDadosCliente(filtros.clienteIds[0]) 
        : null
    },
    // Validation results for debugging
    validation: validationResult,
    // Debug information (only in development)
    ...(process.env.NODE_ENV === 'development' && { debug: debugInfo })
  };
};