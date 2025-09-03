import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MapeamentoAgrupado, MapeamentoFornecedor } from '@/types/cliente-fishbone';
import { EtapaJornada } from '@/types/mapa-parceiros';
import { Node, Edge } from '@xyflow/react';

// Constantes do layout do diagrama
const NODE_WIDTH = 200;
const NODE_HEIGHT = 60;
const HORIZONTAL_SPACING = 250;
const VERTICAL_SPACING = 120;

/**
 * Hook customizado para gerir a lógica da visualização Fishbone (espinha de peixe) e fornecer clientes para seleção.
 * Corrigido para trazer clientes vinculados às empresas do grupo intragrupo, conforme regras do negócio e documentação.
 * @param filtros - Filtros opcionais, como clienteIds para visualização específica.
 */
export const useClienteFishbone = (filtros: { clienteIds?: string[] }) => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoFornecedor[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Busca estrutura das etapas e subníveis da jornada (executa uma única vez no mount).
   */
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

  /**
   * Busca todos os clientes ativos que são clientes das empresas do grupo intragrupo.
   * Utiliza a tabela empresa_clientes, garantindo que o campo empresa_proprietaria seja do tipo 'intragrupo'.
   * Só retorna clientes ativos, evitando duplicidade.
   */
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      // Busca todas as relações empresa_proprietaria (intragrupo) -> empresa_cliente
      const { data, error } = await supabase
        .from('empresa_clientes')
        .select(`
          empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(id, nome, descricao, tipo, logo_url, status),
          empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(id, nome, tipo)
        `)
        .order('empresa_cliente.nome', { ascending: true });

      if (error) throw new Error(error.message);

      // Filtra apenas empresas clientes ativas, vinculadas a proprietárias do tipo intragrupo
      const clientesFormatados = (data || [])
        .filter((rel: any) =>
          rel.empresa_cliente &&
          rel.empresa_cliente.status === true &&
          rel.empresa_proprietaria &&
          rel.empresa_proprietaria.tipo === 'intragrupo'
        )
        .map((rel: any) => ({
          id: rel.empresa_cliente.id,
          nome: rel.empresa_cliente.nome,
          tipo: rel.empresa_cliente.tipo,
          descricao: rel.empresa_cliente.descricao,
          logo_url: rel.empresa_cliente.logo_url,
          status: rel.empresa_cliente.status,
          empresa_proprietaria: {
            id: rel.empresa_proprietaria.id,
            nome: rel.empresa_proprietaria.nome,
            tipo: rel.empresa_proprietaria.tipo,
          },
        }));

      setClientes(clientesFormatados);
    } catch (err: any) {
      setError('Falha ao carregar a lista de clientes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca dados detalhados do cliente selecionado e seus mapeamentos (fornecedores por etapa/subnível).
   */
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
  return { nodes, edges, fishboneData, loading, error, cliente, etapas, stats, clientes };
};