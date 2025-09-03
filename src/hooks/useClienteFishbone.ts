import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MapeamentoAgrupado, MapeamentoFornecedor } from '@/types/cliente-fishbone';
import { EtapaJornada } from '@/types/mapa-parceiros';
import { Node, Edge } from '@xyflow/react';

// Constantes para o layout do diagrama
const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 120;

/**
 * Hook customizado para gerir a lógica da visualização em espinha de peixe (Fishbone).
 * Agora traz também a lista de clientes disponíveis para seleção.
 * @param filtros - Filtros (clienteIds, etc) para visualização.
 */
export const useClienteFishbone = (filtros: { clienteIds?: string[] }) => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoFornecedor[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca estrutura de etapas e subniveis uma única vez
  const fetchEstruturaJornada = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('etapas_jornada')
        .select('*, subniveis_etapa(*)')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw new Error(error.message);
      setEtapas(data || []);
    } catch (err: any) {
      setError('Falha ao carregar a estrutura da jornada.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca todos os clientes ativos para o seletor lateral
  // Busca clientes através da tabela empresa_clientes, filtrando por empresas proprietárias do tipo 'intragrupo'
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresa_clientes')
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, descricao, tipo, logo_url, status),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo)
        `)
        .eq('status', true)
        .eq('empresa_proprietaria.tipo', 'intragrupo')
        .order('empresa_cliente.nome', { ascending: true });

      if (error) throw new Error(error.message);

      // Transforma os dados para o formato esperado pelo componente (ClienteOption interface)
      const clientesFormatados = (data || [])
        .map((rel: any) => 
          rel.empresa_cliente && rel.empresa_proprietaria
            ? {
                id: rel.empresa_cliente.id,
                nome: rel.empresa_cliente.nome,
                tipo: rel.empresa_cliente.tipo,
                descricao: rel.empresa_cliente.descricao,
                logo_url: rel.empresa_cliente.logo_url,
                status: rel.empresa_cliente.status,
                // Informação da empresa proprietária no formato esperado pela interface ClienteOption
                empresa_proprietaria: {
                  id: rel.empresa_proprietaria.id,
                  nome: rel.empresa_proprietaria.nome,
                  tipo: rel.empresa_proprietaria.tipo,
                },
              }
            : null
        )
        .filter(Boolean);

      setClientes(clientesFormatados);
    } catch (err: any) {
      setError('Falha ao carregar a lista de clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Busca os dados do cliente e os seus mapeamentos
  const carregarDadosCliente = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const [clienteRes, mapeamentosRes] = await Promise.all([
        supabase.from('empresas').select('*').eq('id', id).single(),
        supabase
          .from('cliente_etapa_fornecedores')
          .select('*, empresa_fornecedora:empresas(*)')
          .eq('cliente_id', id)
          .eq('ativo', true),
      ]);

      if (clienteRes.error) throw new Error(`Cliente não encontrado: ${clienteRes.error.message}`);
      if (mapeamentosRes.error) throw new Error(`Erro ao buscar mapeamentos: ${mapeamentosRes.error.message}`);
      
      setCliente(clienteRes.data);

      // Corrige o tipo de empresa_fornecedora para garantir compatibilidade com MapeamentoFornecedor
      const mapeamentosCorrigidos = (mapeamentosRes.data || []).map((mapeamento: any) => {
        return {
          ...mapeamento,
          empresa_fornecedora:
            mapeamento.empresa_fornecedora &&
            typeof mapeamento.empresa_fornecedora === 'object' &&
            !mapeamento.empresa_fornecedora.error
              ? mapeamento.empresa_fornecedora
              : null,
        };
      });

      setMapeamentos(mapeamentosCorrigidos);

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
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
    } else {
      setCliente(null);
      setMapeamentos([]);
    }
  }, [filtros?.clienteIds, carregarDadosCliente]);

  // Transforma os dados em estrutura ClienteFishboneView
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
        // Buscar subníveis da etapa no estado global - do Supabase vem como subniveis_etapa
        const etapaCompleta = etapas.find(e => e.id === etapa.id) as any;
        const subnivelsDaEtapa = etapaCompleta?.subniveis_etapa || etapaCompleta?.subniveis || [];
        const subniveis = subnivelsDaEtapa.map((subnivel: any) => {
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

  // Calculamos nodes e edges vazios para manter compatibilidade
  const { nodes, edges } = useMemo(() => {
    return { nodes: [], edges: [] };
  }, []);

  // Cálculo das estatísticas para o FishboneControls
  const stats = useMemo(() => {
    // clientes: 1 se cliente está definido, 0 se não
    const clientesCount = cliente ? 1 : 0;
    // totalParceiros: soma dos fornecedores que são parceiros
    const totalParceiros = mapeamentos.filter(m => m.empresa_fornecedora?.tipo === 'parceiro').length;
    // totalFornecedores: soma total dos fornecedores
    const totalFornecedores = mapeamentos.length;
    // totalGaps: exemplo - etapas sem fornecedores
    const totalGaps = etapas.reduce((acc, etapa) => {
      const count = mapeamentos.filter(m => m.etapa_id === etapa.id).length;
      return acc + (count === 0 ? 1 : 0);
    }, 0);
    // totalEtapas
    const totalEtapas = etapas.length;
    // coberturaPorcentual: % de etapas que possuem ao menos um fornecedor
    const etapasComFornecedores = etapas.filter(etapa =>
      mapeamentos.some(m => m.etapa_id === etapa.id)
    ).length;
    const coberturaPorcentual = totalEtapas > 0
      ? Math.round((etapasComFornecedores / totalEtapas) * 100)
      : 0;
    // parceirosVsFornecedores
    const parceirosVsFornecedores = {
      parceiros: totalParceiros,
      fornecedores: totalFornecedores - totalParceiros
    };
    // gapsPorEtapa: id da etapa -> número de gaps (0 se tem fornecedor, 1 se não tem)
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

  // Retorna também a lista de clientes para o seletor lateral e dados da fishbone
  return { nodes, edges, fishboneData, loading, error, cliente, etapas, stats, clientes };
};