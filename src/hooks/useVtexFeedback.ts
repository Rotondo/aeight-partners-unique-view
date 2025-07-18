
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { VtexFeedbackCampoCustomizado, VtexFeedbackOportunidade, VtexFeedbackFormData } from '@/types/vtex';
import { Oportunidade } from '@/types';

export const useVtexFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [camposCustomizados, setCamposCustomizados] = useState<VtexFeedbackCampoCustomizado[]>([]);
  const [feedbacks, setFeedbacks] = useState<VtexFeedbackOportunidade[]>([]);
  const { toast } = useToast();

  // Carregar campos customizados
  const fetchCamposCustomizados = async () => {
    try {
      const { data, error } = await supabase
        .from('vtex_feedback_campos_customizados')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      
      const camposConvertidos: VtexFeedbackCampoCustomizado[] = (data || []).map(campo => ({
        ...campo,
        tipo: campo.tipo as VtexFeedbackCampoCustomizado['tipo'],
        opcoes: campo.opcoes ? 
          (Array.isArray(campo.opcoes) ? 
            campo.opcoes
              .filter((item): item is string | number | boolean => item !== null && item !== undefined)
              .map(item => String(item))
              .filter((item): item is string => typeof item === 'string') : 
            null
          ) : null,
        descricao: campo.descricao || null
      }));
      
      setCamposCustomizados(camposConvertidos);
    } catch (error) {
      console.error('Erro ao carregar campos customizados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os campos customizados.",
        variant: "destructive"
      });
    }
  };

  // Carregar feedbacks
  const fetchFeedbacks = async (oportunidadeId?: string) => {
    try {
      let query = supabase
        .from('vtex_feedback_oportunidades')
        .select('*')
        .order('created_at', { ascending: false });

      if (oportunidadeId) {
        query = query.eq('oportunidade_id', oportunidadeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const feedbacksConvertidos: VtexFeedbackOportunidade[] = (data || []).map(feedback => ({
        ...feedback,
        status: feedback.status as 'rascunho' | 'enviado',
        campos_customizados: feedback.campos_customizados ? 
          (typeof feedback.campos_customizados === 'object' ? feedback.campos_customizados as Record<string, any> : {}) 
          : {},
        usuario_responsavel_id: feedback.usuario_responsavel_id || null
      }));
      
      setFeedbacks(feedbacksConvertidos);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os feedbacks.",
        variant: "destructive"
      });
    }
  };

  // Buscar oportunidades VTEX - Query corrigida e simplificada
  const fetchOportunidadesVtex = async (): Promise<Oportunidade[]> => {
    try {
      setLoading(true);
      console.log('Iniciando busca por oportunidades VTEX...');

      // Buscar todas as oportunidades ativas primeiro
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(*),
          empresa_destino:empresas!empresa_destino_id(*),
          usuario_envio:usuarios!usuario_envio_id(*),
          usuario_recebe:usuarios!usuario_recebe_id(*)
        `)
        .not('status', 'eq', 'perdido')
        .not('status', 'eq', 'ganho')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro na query Supabase:', error);
        throw error;
      }

      console.log('Total de oportunidades encontradas:', oportunidades?.length || 0);

      // Filtrar oportunidades VTEX localmente para evitar problemas de query
      const vtexOportunidades = (oportunidades || []).filter(op => {
        const origemNome = op.empresa_origem?.nome?.toLowerCase() || '';
        const destinoNome = op.empresa_destino?.nome?.toLowerCase() || '';
        const isVtex = origemNome.includes('vtex') || destinoNome.includes('vtex');
        
        if (isVtex) {
          console.log('Oportunidade VTEX encontrada:', op.nome_lead, '|', origemNome, '->', destinoNome);
        }
        
        return isVtex;
      });

      console.log('Oportunidades VTEX filtradas:', vtexOportunidades.length);
      return vtexOportunidades;
      
    } catch (error) {
      console.error('Erro ao buscar oportunidades VTEX:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as oportunidades VTEX.",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const salvarFeedback = async (
    oportunidadeId: string,
    formData: VtexFeedbackFormData,
    status: 'rascunho' | 'enviado' = 'enviado'
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vtex_feedback_oportunidades')
        .insert({
          oportunidade_id: oportunidadeId,
          empresa_lead: formData.empresa_lead,
          nome_lead: formData.nome_lead,
          sobrenome_lead: formData.sobrenome_lead,
          email_lead: formData.email_lead,
          telefone_lead: formData.telefone_lead,
          conseguiu_contato: formData.conseguiu_contato,
          contexto_breve: formData.contexto_breve,
          campos_customizados: formData.campos_customizados,
          status,
          usuario_responsavel_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Feedback ${status === 'rascunho' ? 'salvo como rascunho' : 'enviado'} com sucesso!`
      });

      await fetchFeedbacks();
      return data;
    } catch (error) {
      console.error('Erro ao salvar feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o feedback.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const atualizarFeedback = async (
    feedbackId: string,
    formData: VtexFeedbackFormData,
    status: 'rascunho' | 'enviado' = 'enviado'
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vtex_feedback_oportunidades')
        .update({
          empresa_lead: formData.empresa_lead,
          nome_lead: formData.nome_lead,
          sobrenome_lead: formData.sobrenome_lead,
          email_lead: formData.email_lead,
          telefone_lead: formData.telefone_lead,
          conseguiu_contato: formData.conseguiu_contato,
          contexto_breve: formData.contexto_breve,
          campos_customizados: formData.campos_customizados,
          status
        })
        .eq('id', feedbackId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Feedback ${status === 'rascunho' ? 'salvo como rascunho' : 'atualizado'} com sucesso!`
      });

      await fetchFeedbacks();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar feedback:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o feedback.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Lógica para verificar se feedback semanal está pendente
  const temFeedbackPendente = (oportunidadeId: string, dataUltimoFeedback?: string) => {
    if (!dataUltimoFeedback) return true;
    
    const ultimoFeedback = new Date(dataUltimoFeedback);
    const agora = new Date();
    const diferencaDias = Math.floor((agora.getTime() - ultimoFeedback.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferencaDias >= 7; // Feedback semanal obrigatório
  };

  // Obter último feedback de uma oportunidade
  const getUltimoFeedback = (oportunidadeId: string): VtexFeedbackOportunidade | null => {
    const feedbacksOportunidade = feedbacks.filter(f => f.oportunidade_id === oportunidadeId);
    return feedbacksOportunidade.length > 0 ? feedbacksOportunidade[0] : null;
  };

  // Verificar status do feedback (novo)
  const getStatusFeedback = (oportunidadeId: string) => {
    const ultimoFeedback = getUltimoFeedback(oportunidadeId);
    
    if (!ultimoFeedback) {
      return 'nunca_enviado';
    }
    
    const isPendente = temFeedbackPendente(oportunidadeId, ultimoFeedback.data_feedback);
    return isPendente ? 'atrasado' : 'em_dia';
  };

  // Estatísticas de controle (novo)
  const getEstatisticasFeedback = (oportunidades: Oportunidade[]) => {
    const stats = {
      total: oportunidades.length,
      nunca_enviado: 0,
      em_dia: 0,
      atrasado: 0
    };

    oportunidades.forEach(op => {
      const status = getStatusFeedback(op.id);
      stats[status as keyof typeof stats]++;
    });

    return stats;
  };

  useEffect(() => {
    fetchCamposCustomizados();
  }, []);

  return {
    loading,
    camposCustomizados,
    feedbacks,
    fetchCamposCustomizados,
    fetchFeedbacks,
    fetchOportunidadesVtex,
    salvarFeedback,
    atualizarFeedback,
    temFeedbackPendente,
    getUltimoFeedback,
    getStatusFeedback,
    getEstatisticasFeedback
  };
};
