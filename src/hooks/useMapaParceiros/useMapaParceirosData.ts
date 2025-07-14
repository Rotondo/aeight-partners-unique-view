
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  EtapaJornada, 
  SubnivelEtapa, 
  ParceiroMapa, 
  AssociacaoParceiroEtapa
} from '@/types/mapa-parceiros';
import { toast } from '@/hooks/use-toast';

export const useMapaParceirosData = () => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [subniveis, setSubniveis] = useState<SubnivelEtapa[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroMapa[]>([]);
  const [associacoes, setAssociacoes] = useState<AssociacaoParceiroEtapa[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.log('[MapaParceiros] Todos os dados carregados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return {
    etapas,
    subniveis,
    parceiros,
    associacoes,
    loading,
    carregarDados,
    setEtapas,
    setSubniveis,
    setParceiros,
    setAssociacoes
  };
};
