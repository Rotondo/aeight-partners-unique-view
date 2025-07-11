import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  EtapaJornada, 
  SubnivelEtapa, 
  ParceiroMapa, 
  AssociacaoParceiroEtapa,
  MapaParceirosFiltros,
  MapaParceirosStats
} from '@/types/mapa-parceiros';
import { toast } from '@/hooks/use-toast';
import { calcularContadoresParceiros } from '@/lib/utils';

export const useMapaParceiros = () => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [subniveis, setSubniveis] = useState<SubnivelEtapa[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroMapa[]>([]);
  const [associacoes, setAssociacoes] = useState<AssociacaoParceiroEtapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<MapaParceirosFiltros>({});

  // Carregar etapas
  const carregarEtapas = async () => {
    try {
      const { data, error } = await supabase
        .from('etapas_jornada')
        .select('*')
        .eq('ativo', true)
        .order('ordem');
      
      if (error) throw error;
      setEtapas(data || []);
      console.log('[MapaParceiros] Etapas carregadas:', data);
    } catch (error) {
      console.error('Erro ao carregar etapas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as etapas da jornada.",
        variant: "destructive",
      });
    }
  };

  // Carregar subníveis
  const carregarSubniveis = async () => {
    try {
      const { data, error } = await supabase
        .from('subniveis_etapa')
        .select('*')
        .eq('ativo', true)
        .order('etapa_id, ordem');
      
      if (error) throw error;
      setSubniveis(data || []);
      console.log('[MapaParceiros] Subníveis carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar subníveis:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os subníveis das etapas.",
        variant: "destructive",
      });
    }
  };

  // Carregar parceiros
  const carregarParceiros = async () => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .select(`
          *,
          empresa:empresas(id, nome, descricao, tipo)
        `)
        .order('created_at');
      
      if (error) throw error;
      setParceiros((data || []) as ParceiroMapa[]);
      console.log('[MapaParceiros] Parceiros carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os parceiros.",
        variant: "destructive",
      });
    }
  };

  // Carregar associações
  const carregarAssociacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('associacoes_parceiro_etapa')
        .select(`
          *,
          parceiro:parceiros_mapa(*),
          etapa:etapas_jornada(*),
          subnivel:subniveis_etapa(*)
        `)
        .eq('ativo', true);
      
      if (error) throw error;
      setAssociacoes((data || []) as AssociacaoParceiroEtapa[]);
      console.log('[MapaParceiros] Associacoes carregadas:', data);
    } catch (error) {
      console.error('Erro ao carregar associações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as associações.",
        variant: "destructive",
      });
    }
  };

  // Criar parceiro
  const criarParceiro = async (dadosParceiro: Partial<ParceiroMapa>) => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .insert(dadosParceiro as any)
        .select()
        .single();
      
      if (error) throw error;
      
      setParceiros(prev => [...prev, data as ParceiroMapa]);
      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Atualizar parceiro
  const atualizarParceiro = async (id: string, dadosParceiro: Partial<ParceiroMapa>) => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .update(dadosParceiro)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setParceiros(prev => prev.map(p => p.id === id ? data as ParceiroMapa : p));
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Deletar parceiro
  const deletarParceiro = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parceiros_mapa')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setParceiros(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Associar parceiro a etapa/subnível
  const associarParceiroEtapa = async (parceiroId: string, etapaId: string, subnivelId?: string) => {
    try {
      const { data, error } = await supabase
        .from('associacoes_parceiro_etapa')
        .insert([{
          parceiro_id: parceiroId,
          etapa_id: etapaId,
          subnivel_id: subnivelId
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await carregarAssociacoes(); // Recarregar para pegar os dados completos
      toast({
        title: "Sucesso",
        description: "Parceiro associado à etapa com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao associar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível associar o parceiro à etapa.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Remover associação
  const removerAssociacao = async (associacaoId: string) => {
    try {
      const { error } = await supabase
        .from('associacoes_parceiro_etapa')
        .delete()
        .eq('id', associacaoId);
      
      if (error) throw error;
      
      setAssociacoes(prev => prev.filter(a => a.id !== associacaoId));
      toast({
        title: "Sucesso",
        description: "Associação removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover associação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a associação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Filtrar dados
  const dadosFiltrados = () => {
    let etapasFiltradas = etapas;
    let parceirosFiltrados = parceiros;
    let associacoesFiltradas = associacoes;

    if (filtros.etapaId) {
      associacoesFiltradas = associacoesFiltradas.filter(a => a.etapa_id === filtros.etapaId);
    }

    if (filtros.status) {
      parceirosFiltrados = parceirosFiltrados.filter(p => p.status === filtros.status);
    }

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      parceirosFiltrados = parceirosFiltrados.filter(p => 
        p.empresa?.nome.toLowerCase().includes(busca) ||
        p.empresa?.descricao?.toLowerCase().includes(busca)
      );
    }

    return {
      etapas: etapasFiltradas,
      parceiros: parceirosFiltrados,
      associacoes: associacoesFiltradas,
      subniveis
    };
  };

  // Calcular estatísticas - CORRIGIDO para contar parceiros únicos
  const calcularStats = (): MapaParceirosStats => {
    const totalParceiros = parceiros.length;
    const parceirosAtivos = parceiros.filter(p => p.status === 'ativo').length;
    const parceirosInativos = parceiros.filter(p => p.status === 'inativo').length;
    
    // Usar função utilitária para contagem correta
    const { parceirosPorEtapa, parceirosPorSubnivel } = calcularContadoresParceiros(associacoes);

    const performanceMedia = parceiros.length > 0 
      ? parceiros.reduce((acc, p) => acc + p.performance_score, 0) / parceiros.length 
      : 0;

    return {
      totalParceiros,
      parceirosPorEtapa,
      parceirosPorSubnivel,
      parceirosAtivos,
      parceirosInativos,
      performanceMedia
    };
  };

  // Carregar todos os dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        carregarEtapas(),
        carregarSubniveis(),
        carregarParceiros(),
        carregarAssociacoes()
      ]);
      console.log('[MapaParceiros] Todos os dados carregados:', { etapas, subniveis, parceiros, associacoes });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    // Dados
    ...dadosFiltrados(),
    loading,
    filtros,
    stats: calcularStats(),
    
    // Funções
    setFiltros,
    carregarDados,
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao
  };
};