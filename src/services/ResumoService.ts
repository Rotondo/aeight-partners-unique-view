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
      console.log('[ResumoService] Gerando resumo:', { tipo, periodoInicio, periodoFim });
      
      // 1. Contar eventos no período
      const { data: eventos, error: eventosError } = await supabase
        .from('diario_agenda_eventos')
        .select('id, title, description, status, partner_id, start, end')
        .gte('start', periodoInicio)
        .lte('start', periodoFim);

      if (eventosError) {
        console.error('[ResumoService] Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      console.log('[ResumoService] Eventos encontrados:', eventos?.length || 0);

      // 2. Contar ações CRM no período
      const { data: acoesCrm, error: crmError } = await supabase
        .from('diario_crm_acoes')
        .select('id, description, content, metadata, partner_id, status, next_steps')
        .gte('created_at', periodoInicio)
        .lte('created_at', periodoFim);

      if (crmError) {
        console.error('[ResumoService] Erro ao buscar ações CRM:', crmError);
        throw crmError;
      }

      console.log('[ResumoService] Ações CRM encontradas:', acoesCrm?.length || 0);

      // 3. Contar parceiros únicos envolvidos
      const parceirosUnicos = new Set();
      eventos?.forEach(evento => {
        if (evento.partner_id) parceirosUnicos.add(evento.partner_id);
      });
      acoesCrm?.forEach(acao => {
        if (acao.partner_id) parceirosUnicos.add(acao.partner_id);
      });

      console.log('[ResumoService] Parceiros únicos:', parceirosUnicos.size);

      // 4. CORRIGIDO: Extrair principais realizações (incluir eventos agendados e realizados)
      const eventosRealizados = eventos?.filter(e => e.status === 'completed') || [];
      const eventosAgendados = eventos?.filter(e => e.status === 'scheduled') || [];
      const acoesConcluidas = acoesCrm?.filter(a => a.status === 'concluida') || [];
      const acoesEmAndamento = acoesCrm?.filter(a => a.status === 'em_andamento') || [];

      console.log('[ResumoService] Eventos por status:', {
        realizados: eventosRealizados.length,
        agendados: eventosAgendados.length,
        acoesConcluidas: acoesConcluidas.length,
        acoesEmAndamento: acoesEmAndamento.length
      });

      // CORRIGIDO: Incluir tanto eventos realizados quanto agendados
      const principaisRealizacoes = [
        ...eventosRealizados.map(e => `✅ ${e.title || e.description || 'Evento realizado'}`),
        ...eventosAgendados.map(e => `📅 ${e.title || e.description || 'Evento agendado'}`),
        ...acoesConcluidas.map(a => `✅ ${a.description || a.content?.substring(0, 50) + '...' || 'Ação CRM concluída'}`),
        ...acoesEmAndamento.map(a => `🔄 ${a.description || a.content?.substring(0, 50) + '...' || 'Ação CRM em andamento'}`)
      ].slice(0, 10); // Aumentar para 10 itens

      // 5. CORRIGIDO: Extrair próximos passos de forma mais robusta
      const proximosPassos = [
        // Próximos passos das ações CRM
        ...acoesCrm?.map(acao => acao.next_steps).filter(Boolean) || [],
        // Eventos agendados futuros como próximos passos
        ...eventosAgendados.map(evento => 
          `📅 ${evento.title} - ${new Date(evento.start).toLocaleDateString('pt-BR')}`
        )
      ].slice(0, 8); // Limitar a 8 itens

      console.log('[ResumoService] Próximos passos extraídos:', proximosPassos.length);

      // 6. Criar o resumo
      const resumo: DiarioResumo = {
        id: crypto.randomUUID(),
        tipo,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        titulo: `Resumo ${tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
        conteudo_resumo: this.generateConteudoResumo(
          eventos?.length || 0, 
          acoesCrm?.length || 0, 
          parceirosUnicos.size,
          eventosRealizados.length,
          eventosAgendados.length
        ),
        total_eventos: eventos?.length || 0,
        total_acoes_crm: acoesCrm?.length || 0,
        total_parceiros_envolvidos: parceirosUnicos.size,
        principais_realizacoes: principaisRealizacoes.length > 0 ? principaisRealizacoes : ['Nenhuma atividade registrada no período'],
        proximos_passos: proximosPassos.length > 0 ? proximosPassos : ['Nenhum próximo passo definido'],
        usuario_gerador_id: userId,
        created_at: new Date().toISOString()
      };

      console.log('[ResumoService] Resumo gerado:', {
        totalEventos: resumo.total_eventos,
        totalAcoes: resumo.total_acoes_crm,
        realizacoes: resumo.principais_realizacoes.length,
        proximosPassos: resumo.proximos_passos.length
      });

      // 7. Mapear tipo para formato do banco com tipos corretos
      const periodMapping: Record<TipoResumo, "week" | "month" | "quarter"> = {
        'semanal': 'week',
        'mensal': 'month',
        'trimestral': 'quarter'
      } as const;

      // 8. Salvar no banco (usando a tabela existente)
      const { data: savedResumo, error: saveError } = await supabase
        .from('diario_resumos')
        .insert({
          period: periodMapping[tipo],
          content: JSON.stringify({
            resumo_completo: resumo,
            detalhes_eventos: eventos,
            detalhes_acoes: acoesCrm,
            criterios_busca: { periodoInicio, periodoFim },
            debug_info: {
              eventosRealizados: eventosRealizados.length,
              eventosAgendados: eventosAgendados.length,
              acoesConcluidas: acoesConcluidas.length,
              acoesEmAndamento: acoesEmAndamento.length
            }
          })
        })
        .select()
        .single();

      if (saveError) {
        console.error('[ResumoService] Erro ao salvar:', saveError);
        throw saveError;
      }

      console.log('[ResumoService] Resumo salvo com sucesso:', savedResumo.id);
      return resumo;
    } catch (error) {
      console.error('[ResumoService] Erro ao gerar resumo:', error);
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

  private static generateConteudoResumo(
    totalEventos: number, 
    totalAcoes: number, 
    totalParceiros: number,
    eventosRealizados: number = 0,
    eventosAgendados: number = 0
  ): string {
    if (totalEventos === 0 && totalAcoes === 0) {
      return 'Período sem atividades registradas. Considere aumentar o engajamento ou revisar o período selecionado.';
    }

    let resumo = `Durante este período foram registrados ${totalEventos} eventos `;
    
    if (eventosRealizados > 0 || eventosAgendados > 0) {
      resumo += `(${eventosRealizados} realizados, ${eventosAgendados} agendados) `;
    }
    
    resumo += `e ${totalAcoes} ações de CRM, envolvendo ${totalParceiros} parceiros diferentes. `;
    
    if (eventosAgendados > eventosRealizados) {
      resumo += 'Foco em planejamento e eventos futuros.';
    } else if (totalEventos > totalAcoes) {
      resumo += 'Foco maior em eventos/reuniões.';
    } else {
      resumo += 'Foco maior em ações de follow-up.';
    }

    return resumo;
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
