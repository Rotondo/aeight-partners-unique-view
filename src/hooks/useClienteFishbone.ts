import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ClienteFishboneView, 
  ClienteEtapaFornecedor, 
  EmpresaFornecedora,
  FishboneStats,
  ClienteFishboneFilters 
} from '@/types/cliente-fishbone';
import { EtapaJornada, SubnivelEtapa } from '@/types/mapa-parceiros';
import { Empresa } from '@/types/empresa';

export const useClienteFishbone = (filtros: ClienteFishboneFilters) => {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Empresa[]>([]);
  const [fishboneData, setFishboneData] = useState<ClienteFishboneView[]>([]);
  const [mapeamentos, setMapeamentos] = useState<ClienteEtapaFornecedor[]>([]);
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [subniveis, setSubniveis] = useState<SubnivelEtapa[]>([]);
  const [stats, setStats] = useState<FishboneStats>({
    totalClientes: 0,
    totalEtapas: 0,
    coberturaPorcentual: 0,
    parceirosVsFornecedores: { parceiros: 0, fornecedores: 0 },
    gapsPorEtapa: {}
  });
  const { toast } = useToast();

  // Carregar clientes disponíveis
  const carregarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('status', true)
        .eq('tipo', 'cliente')
        .order('nome');

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive"
      });
    }
  };

  // Carregar etapas e subníveis
  const carregarEtapasSubniveis = async () => {
    try {
      const [etapasResult, subniveisResult] = await Promise.all([
        supabase
          .from('etapas_jornada')
          .select('*')
          .eq('ativo', true)
          .order('ordem'),
        supabase
          .from('subniveis_etapa')
          .select('*')
          .eq('ativo', true)
          .order('etapa_id, ordem')
      ]);

      if (etapasResult.error) throw etapasResult.error;
      if (subniveisResult.error) throw subniveisResult.error;

      setEtapas(etapasResult.data || []);
      setSubniveis(subniveisResult.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar etapas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as etapas",
        variant: "destructive"
      });
    }
  };

  // Carregar mapeamentos
  const carregarMapeamentos = async () => {
    try {
      if (filtros.clienteIds.length === 0) {
        setMapeamentos([]);
        return;
      }

      const { data, error } = await supabase
        .from('cliente_etapa_fornecedores')
        .select(`
          *,
          cliente:empresas!cliente_id(*),
          etapa:etapas_jornada(*),
          subnivel:subniveis_etapa(*),
          empresa_fornecedora:empresas!empresa_fornecedora_id(*)
        `)
        .in('cliente_id', filtros.clienteIds)
        .eq('ativo', true);

      if (error) throw error;
      
      // Mapear dados com campo is_parceiro calculado
      const mapeamentosComParceiro = (data || []).map(item => ({
        ...item,
        empresa_fornecedora: item.empresa_fornecedora ? {
          ...item.empresa_fornecedora,
          is_parceiro: item.empresa_fornecedora.tipo === 'parceiro'
        } : undefined
      }));
      
      setMapeamentos(mapeamentosComParceiro);
    } catch (error: any) {
      console.error('Erro ao carregar mapeamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os mapeamentos",
        variant: "destructive"
      });
    }
  };

  // Processar dados do fishbone
  const processarFishboneData = () => {
    const clientesSelecionados = clientes.filter(c => 
      filtros.clienteIds.includes(c.id)
    );

    const fishboneViews: ClienteFishboneView[] = clientesSelecionados.map(cliente => {
      const etapasCliente = etapas.map(etapa => {
        const subniveisEtapa = subniveis.filter(s => s.etapa_id === etapa.id);
        
        const mapeamentosEtapa = mapeamentos.filter(m => 
          m.cliente_id === cliente.id && m.etapa_id === etapa.id
        );

        const fornecedoresEtapa: EmpresaFornecedora[] = mapeamentosEtapa.map(m => ({
          ...m.empresa_fornecedora!,
          is_parceiro: m.empresa_fornecedora?.tipo === 'parceiro'
        }));

        const subniveisComFornecedores = subniveisEtapa.map(subnivel => {
          const fornecedoresSubnivel = mapeamentos
            .filter(m => 
              m.cliente_id === cliente.id && 
              m.subnivel_id === subnivel.id
            )
            .map(m => ({
              ...m.empresa_fornecedora!,
              is_parceiro: m.empresa_fornecedora?.tipo === 'parceiro'
            }));

          return {
            ...subnivel,
            fornecedores: fornecedoresSubnivel
          };
        });

        const gaps = subniveisEtapa.filter(s => 
          !mapeamentos.some(m => 
            m.cliente_id === cliente.id && m.subnivel_id === s.id
          )
        ).length;

        return {
          ...etapa,
          fornecedores: fornecedoresEtapa,
          subniveis: subniveisComFornecedores,
          gaps
        };
      });

      return {
        cliente,
        etapas: etapasCliente
      };
    });

    setFishboneData(fishboneViews);
  };

  // Calcular estatísticas
  const calcularStats = () => {
    const totalMapeamentos = mapeamentos.length;
    const parceiros = mapeamentos.filter(m => 
      m.empresa_fornecedora?.tipo === 'parceiro'
    ).length;
    const fornecedores = totalMapeamentos - parceiros;

    const totalPossivel = filtros.clienteIds.length * subniveis.length;
    const cobertura = totalPossivel > 0 ? (totalMapeamentos / totalPossivel) * 100 : 0;

    const gapsPorEtapa: Record<string, number> = {};
    etapas.forEach(etapa => {
      const subniveisEtapa = subniveis.filter(s => s.etapa_id === etapa.id);
      const mapeamentosEtapa = mapeamentos.filter(m => m.etapa_id === etapa.id);
      const gaps = (subniveisEtapa.length * filtros.clienteIds.length) - mapeamentosEtapa.length;
      gapsPorEtapa[etapa.id] = gaps;
    });

    setStats({
      totalClientes: filtros.clienteIds.length,
      totalEtapas: etapas.length,
      coberturaPorcentual: Math.round(cobertura),
      parceirosVsFornecedores: { parceiros, fornecedores },
      gapsPorEtapa
    });
  };

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      await Promise.all([
        carregarClientes(),
        carregarEtapasSubniveis()
      ]);
      setLoading(false);
    };

    carregarDados();
  }, []);

  // Recarregar mapeamentos quando filtros mudarem
  useEffect(() => {
    carregarMapeamentos();
  }, [filtros.clienteIds]);

  // Processar dados quando mapeamentos mudarem
  useEffect(() => {
    if (etapas.length > 0 && subniveis.length > 0) {
      processarFishboneData();
      calcularStats();
    }
  }, [mapeamentos, etapas, subniveis, filtros.clienteIds]);

  return {
    loading,
    clientes,
    fishboneData,
    mapeamentos,
    etapas,
    subniveis,
    stats,
    refetch: carregarMapeamentos
  };
};