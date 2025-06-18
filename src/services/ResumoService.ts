
import { supabase } from '@/integrations/supabase/client';
import type { DiarioResumo, TipoResumo } from '@/types/diario';

/**
 * Service para operações de resumos com dados reais
 */
export class ResumoService {
  /**
   * Gera um resumo baseado em dados reais do banco
   */
  static async generateResumo(
    tipo: TipoResumo,
    periodoInicio: string,
    periodoFim: string,
    userId: string
  ): Promise<DiarioResumo | null> {
    try {
      // 1. Contar eventos no período
      const { data: eventos, error: eventosError } = await supabase
        .from('diario_agenda_eventos')
        .select('id, title, description, status')
        .gte('start', periodoInicio)
        .lte('start', periodoFim);

      if (eventosError) throw eventosError;

      // 2. Contar ações CRM no período
      const { data: acoesCrm, error: crmError } = await supabase
        .from('diario_crm_acoes')
        .select('id, content, metadata, partner_id')
        .gte('created_at', periodoInicio)
        .lte('created_at', periodoFim);

      if (crmError) throw crmError;

      // 3. Contar parceiros únicos envolvidos
      const parceirosUnicos = new Set();
      eventos?.forEach(evento => {
        if (evento.partner_id) parceirosUnicos.add(evento.partner_id);
      });
      acoesCrm?.forEach(acao => {
        if (acao.partner_id) parceirosUnicos.add(acao.partner_id);
      });

      // 4. Extrair principais realizações (eventos e ações concluídas)
      const eventosRealizados = eventos?.filter(e => e.status === 'completed') || [];
      const acoesConcluidas = acoesCrm?.filter(a => {
        const metadata = this.parseMetadata(a.metadata);
        return metadata?.status === 'concluida';
      }) || [];

      const principaisRealizacoes = [
        ...eventosRealizados.map(e => e.title || e.description || 'Evento realizado'),
        ...acoesConcluidas.map(a => {
          const metadata = this.parseMetadata(a.metadata);
          return metadata?.description || a.content?.substring(0, 50) + '...' || 'Ação CRM concluída';
        })
      ].slice(0, 5); // Limitar a 5 itens

      // 5. Extrair próximos passos pendentes
      const proximosPassos = acoesCrm?.map(acao => {
        const metadata = this.parseMetadata(acao.metadata);
        return metadata?.next_steps;
      }).filter(Boolean).slice(0, 5) || [];

      // 6. Criar o resumo
      const resumo: DiarioResumo = {
        id: crypto.randomUUID(),
        tipo,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        titulo: `Resumo ${tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
        conteudo_resumo: this.generateConteudoResumo(eventos?.length || 0, acoesCrm?.length || 0, parceirosUnicos.size),
        total_eventos: eventos?.length || 0,
        total_acoes_crm: acoesCrm?.length || 0,
        total_parceiros_envolvidos: parceirosUnicos.size,
        principais_realizacoes: principaisRealizacoes.length > 0 ? principaisRealizacoes : ['Nenhuma realização registrada no período'],
        proximos_passos: proximosPassos.length > 0 ? proximosPassos : ['Nenhum próximo passo definido'],
        usuario_gerador_id: userId,
        created_at: new Date().toISOString()
      };

      // 7. Salvar no banco (usando a tabela existente)
      const { data: savedResumo, error: saveError } = await supabase
        .from('diario_resumos')
        .insert({
          period: tipo,
          content: JSON.stringify({
            resumo_completo: resumo,
            detalhes_eventos: eventos,
            detalhes_acoes: acoesCrm,
            criterios_busca: { periodoInicio, periodoFim }
          })
        })
        .select()
        .single();

      if (saveError) throw saveError;

      return resumo;
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      throw error;
    }
  }

  /**
   * Carrega resumos salvos
   */
  static async loadResumos(): Promise<DiarioResumo[]> {
    try {
      const { data, error } = await supabase
        .from('diario_resumos')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => {
        try {
          const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
          return content.resumo_completo || this.createFallbackResumo(item);
        } catch {
          return this.createFallbackResumo(item);
        }
      });
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
      return [];
    }
  }

  /**
   * Busca detalhes específicos de um resumo para drill-down
   */
  static async getResumoDetails(resumoId: string): Promise<{
    eventos: any[];
    acoesCrm: any[];
    criterios: any;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('diario_resumos')
        .select('content')
        .eq('id', resumoId)
        .single();

      if (error) throw error;

      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      return {
        eventos: content.detalhes_eventos || [],
        acoesCrm: content.detalhes_acoes || [],
        criterios: content.criterios_busca || {}
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do resumo:', error);
      return null;
    }
  }

  private static parseMetadata(metadata: any): Record<string, any> {
    if (!metadata) return {};
    if (typeof metadata === 'object') return metadata;
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    return {};
  }

  private static generateConteudoResumo(totalEventos: number, totalAcoes: number, totalParceiros: number): string {
    if (totalEventos === 0 && totalAcoes === 0) {
      return 'Período sem atividades registradas. Considere aumentar o engajamento ou revisar o período selecionado.';
    }

    return `Durante este período foram registrados ${totalEventos} eventos e ${totalAcoes} ações de CRM, ` +
           `envolvendo ${totalParceiros} parceiros diferentes. ` +
           (totalEventos > totalAcoes ? 'Foco maior em eventos/reuniões.' : 'Foco maior em ações de follow-up.');
  }

  private static createFallbackResumo(item: any): DiarioResumo {
    return {
      id: item.id,
      tipo: item.period || 'semanal',
      periodo_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      periodo_fim: new Date().toISOString(),
      titulo: `Resumo ${item.period || 'semanal'}`,
      conteudo_resumo: 'Resumo gerado automaticamente',
      total_eventos: 0,
      total_acoes_crm: 0,
      total_parceiros_envolvidos: 0,
      principais_realizacoes: ['Dados não disponíveis'],
      proximos_passos: ['Dados não disponíveis'],
      usuario_gerador_id: '',
      created_at: item.generated_at || new Date().toISOString()
    };
  }
}
