
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
      console.log('[VTEX] Carregando campos customizados...');
      const { data, error } = await supabase
        .from('vtex_feedback_campos_customizados')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) {
        console.error('[VTEX] Erro ao carregar campos:', error);
        throw error;
      }
      
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
      
      console.log('[VTEX] Campos customizados carregados:', camposConvertidos.length);
      setCamposCustomizados(camposConvertidos);
    } catch (error) {
      console.error('[VTEX] Erro ao carregar campos customizados:', error);
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
      console.log('[VTEX] Carregando feedbacks...', oportunidadeId ? `para oportunidade ${oportunidadeId}` : 'todos');
      
      let query = supabase
        .from('vtex_feedback_oportunidades')
        .select('*')
        .order('created_at', { ascending: false });

      if (oportunidadeId) {
        query = query.eq('oportunidade_id', oportunidadeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[VTEX] Erro ao carregar feedbacks:', error);
        throw error;
      }
      
      const feedbacksConvertidos: VtexFeedbackOportunidade[] = (data || []).map(feedback => ({
        ...feedback,
        status: feedback.status as 'rascunho' | 'enviado',
        campos_customizados: feedback.campos_customizados ? 
          (typeof feedback.campos_customizados === 'object' ? feedback.campos_customizados as Record<string, any> : {}) 
          : {},
        usuario_responsavel_id: feedback.usuario_responsavel_id || null
      }));
      
      console.log('[VTEX] Feedbacks carregados:', feedbacksConvertidos.length);
      setFeedbacks(feedbacksConvertidos);
      return feedbacksConvertidos;
    } catch (error) {
      console.error('[VTEX] Erro ao carregar feedbacks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os feedbacks.",
        variant: "destructive"
      });
      return [];
    }
  };

  // Buscar oportunidades VTEX - Query melhorada com verificação de autenticação
  const fetchOportunidadesVtex = async (): Promise<Oportunidade[]> => {
    try {
      setLoading(true);
      console.log('[VTEX] Iniciando busca por oportunidades VTEX...');

      // Verificar se usuário está autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[VTEX] Usuário não autenticado:', authError);
        throw new Error('Usuário não autenticado');
      }

      console.log('[VTEX] Usuário autenticado:', user.id);

      // Buscar todas as oportunidades ativas com JOINs explícitos
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo, status),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo, status),
          usuario_envio:usuarios!usuario_envio_id(id, nome, email),
          usuario_recebe:usuarios!usuario_recebe_id(id, nome, email)
        `)
        .neq('status', 'perdido')
        .neq('status', 'ganho')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[VTEX] Erro na query Supabase:', error);
        throw error;
      }

      console.log('[VTEX] Total de oportunidades encontradas:', oportunidades?.length || 0);

      if (!oportunidades || oportunidades.length === 0) {
        console.log('[VTEX] Nenhuma oportunidade encontrada');
        return [];
      }

      // Filtrar oportunidades VTEX com verificação mais robusta
      const vtexOportunidades = oportunidades.filter(op => {
        try {
          const origemNome = op.empresa_origem?.nome?.toLowerCase() || '';
          const destinoNome = op.empresa_destino?.nome?.toLowerCase() || '';
          
          // Verificar se alguma das empresas contém 'vtex'
          const isVtexOrigem = origemNome.includes('vtex');
          const isVtexDestino = destinoNome.includes('vtex');
          const isVtex = isVtexOrigem || isVtexDestino;
          
          if (isVtex) {
            console.log('[VTEX] Oportunidade VTEX encontrada:', {
              id: op.id,
              lead: op.nome_lead,
              origem: origemNome,
              destino: destinoNome,
              isVtexOrigem,
              isVtexDestino
            });
          }
          
          return isVtex;
        } catch (filterError) {
          console.error('[VTEX] Erro ao filtrar oportunidade:', op.id, filterError);
          return false;
        }
      });

      console.log('[VTEX] Oportunidades VTEX filtradas:', vtexOportunidades.length);
      
      // Log detalhado das oportunidades encontradas
      vtexOportunidades.forEach((op, index) => {
        console.log(`[VTEX] ${index + 1}. ${op.nome_lead} - ${op.empresa_origem?.nome} → ${op.empresa_destino?.nome}`);
      });

      return vtexOportunidades;
      
    } catch (error) {
      console.error('[VTEX] Erro ao buscar oportunidades VTEX:', error);
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
      console.log('[VTEX] Salvando feedback:', { oportunidadeId, status });
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

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
          usuario_responsavel_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('[VTEX] Erro ao salvar feedback:', error);
        throw error;
      }

      console.log('[VTEX] Feedback salvo com sucesso:', data.id);
      toast({
        title: "Sucesso",
        description: `Feedback ${status === 'rascunho' ? 'salvo como rascunho' : 'enviado'} com sucesso!`
      });

      await fetchFeedbacks();
      return data;
    } catch (error) {
      console.error('[VTEX] Erro ao salvar feedback:', error);
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
      console.log('[VTEX] Atualizando feedback:', { feedbackId, status });
      
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

      if (error) {
        console.error('[VTEX] Erro ao atualizar feedback:', error);
        throw error;
      }

      console.log('[VTEX] Feedback atualizado com sucesso:', data.id);
      toast({
        title: "Sucesso",
        description: `Feedback ${status === 'rascunho' ? 'salvo como rascunho' : 'atualizado'} com sucesso!`
      });

      await fetchFeedbacks();
      return data;
    } catch (error) {
      console.error('[VTEX] Erro ao atualizar feedback:', error);
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

  // Verificar status do feedback
  const getStatusFeedback = (oportunidadeId: string) => {
    const ultimoFeedback = getUltimoFeedback(oportunidadeId);
    
    if (!ultimoFeedback) {
      return 'nunca_enviado';
    }
    
    const isPendente = temFeedbackPendente(oportunidadeId, ultimoFeedback.data_feedback);
    return isPendente ? 'atrasado' : 'em_dia';
  };

  // Estatísticas de controle
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

    console.log('[VTEX] Estatísticas calculadas:', stats);
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
