import { supabase } from '@/integrations/supabase/client';
import type { DiarioResumo, TipoResumo } from '@/types/diario';

/**
 * Service para operações de resumos com dados reais
 */
export class ResumoService {
  /**
   * Gera um resumo baseado em dados reais do banco
   * Só permite geração se houver pelo menos UMA ação CRM real no período.
   */
  static async generateResumo(
    tipo: TipoResumo,
    periodoInicio: string,
    periodoFim: string,
    userId: string
  ): Promise<DiarioResumo | null> {
    try {
      console.log('[ResumoService] Gerando resumo:', { tipo, periodoInicio, periodoFim });

      // 1. Buscar eventos no período
      const { data: eventos, error: eventosError } = await supabase
        .from('diario_agenda_eventos')
        .select('id, title, description, status, partner_id, start, end')
        .gte('start', periodoInicio)
        .lte('start', periodoFim);

      if (eventosError) {
        console.error('[ResumoService] Erro ao buscar eventos:', eventosError);
        throw eventosError;
      }

      // 2. Buscar ações CRM no período
      const { data: acoesCrm, error: crmError } = await supabase
        .from('diario_crm_acoes')
        .select('id, description, content, metadata, partner_id, status, next_steps, created_at')
        .gte('created_at', periodoInicio)
        .lte('created_at', periodoFim);

      if (crmError) {
        console.error('[ResumoService] Erro ao buscar ações CRM:', crmError);
        throw crmError;
      }

      // 3. IMPEDIR geração de resumo sem ações CRM reais
      if (!acoesCrm || acoesCrm.length === 0) {
        console.warn('[ResumoService] Não existem ações de CRM reais no período selecionado. Resumo NÃO será gerado.');
        return null;
      }

      // 4. Parceiros únicos envolvidos (eventos + ações CRM)
      const parceirosUnicos = new Set<string>();
      eventos?.forEach(evento => {
        if (evento.partner_id) parceirosUnicos.add(evento.partner_id);
      });
      acoesCrm?.forEach(acao => {
        if (acao.partner_id) parceirosUnicos.add(acao.partner_id);
      });

      // 5. Extrair principais realizações
      const eventosRealizados = eventos?.filter(e => e.status === 'completed') || [];
      const eventosAgendados = eventos?.filter(e => e.status === 'scheduled') || [];
      const acoesConcluidas = acoesCrm?.filter(a => a.status === 'concluida') || [];
      const acoesEmAndamento = acoesCrm?.filter(a => a.status === 'em_andamento') || [];

      const principaisRealizacoes = [
        ...eventosRealizados.map(e => `✅ ${e.title || e.description || 'Evento realizado'}`),
        ...eventosAgendados.map(e => `📅 ${e.title || e.description || 'Evento agendado'}`),
        ...acoesConcluidas.map(a => `✅ ${a.description || (a.content?.substring(0, 50) + '...') || 'Ação CRM concluída'}`),
        ...acoesEmAndamento.map(a => `🔄 ${a.description || (a.content?.substring(0, 50) + '...') || 'Ação CRM em andamento'}`)
      ].slice(0, 10);

      // 6. Próximos passos
      const proximosPassos = [
        ...(acoesCrm?.map(acao => acao.next_steps).filter(Boolean) ?? []),
        ...eventosAgendados.map(evento =>
          `📅 ${evento.title} - ${new Date(evento.start).toLocaleDateString('pt-BR')}`
        )
      ].slice(0, 8);

      // 7. Criar objeto resumo
      const resumo: DiarioResumo = {
        id: crypto.randomUUID(),
        tipo,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        titulo: `Resumo ${tipo} - ${new Date().toLocaleDateString('pt-BR')}`,
        conteudo_resumo: this.generateConteudoResumo(
          eventos?.length || 0,
          acoesCrm.length,
          parceirosUnicos.size,
          eventosRealizados.length,
          eventosAgendados.length
        ),
        total_eventos: eventos?.length || 0,
        total_acoes_crm: acoesCrm.length,
        total_parceiros_envolvidos: parceirosUnicos.size,
        principais_realizacoes: principaisRealizacoes.length > 0 ? principaisRealizacoes : ['Nenhuma atividade registrada no período'],
        proximos_passos: proximosPassos.length > 0 ? proximosPassos : ['Nenhum próximo passo definido'],
        usuario_gerador_id: userId,
        created_at: new Date().toISOString()
      };

      // 8. Mapear tipo para formato do banco
      const periodMapping: Record<TipoResumo, "week" | "month" | "quarter"> = {
        'semanal': 'week',
        'mensal': 'month',
        'trimestral': 'quarter'
      };

      // 9. Sempre salva JSON completo no campo content
      const fullContent = {
        resumo_completo: resumo,
        detalhes_eventos: eventos ?? [],
        detalhes_acoes: acoesCrm ?? [],
        criterios_busca: { periodoInicio, periodoFim },
        debug_info: {
          eventosRealizados: eventosRealizados.length,
          eventosAgendados: eventosAgendados.length,
          acoesConcluidas: acoesConcluidas.length,
          acoesEmAndamento: acoesEmAndamento.length
        }
      };

      // 10. Salvar no banco
      const { data: savedResumo, error: saveError } = await supabase
        .from('diario_resumos')
        .insert({
          period: periodMapping[tipo],
          content: JSON.stringify(fullContent)
        })
        .select()
        .single();

      if (saveError) {
        console.error('[ResumoService] Erro ao salvar resumo:', saveError);
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
   * Carrega resumos salvos, garantindo retorno apenas de resumos válidos.
   */
  static async loadResumos(): Promise<DiarioResumo[]> {
    try {
      const { data, error } = await supabase
        .from('diario_resumos')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      // Só retorna resumos que possuem pelo menos uma ação CRM registrada (resumo válido)
      return (data || [])
        .map(item => {
          try {
            const content = typeof item.content === 'string' ? JSON.parse(item.content) : item.content;
            const resumo = content.resumo_completo;
            if (
              resumo &&
              typeof resumo === 'object' &&
              Array.isArray(resumo.principais_realizacoes) &&
              Array.isArray(resumo.proximos_passos) &&
              typeof resumo.total_acoes_crm === 'number' &&
              resumo.total_acoes_crm > 0
            ) {
              return resumo as DiarioResumo;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as DiarioResumo[];
    } catch (error) {
      console.error('Erro ao carregar resumos:', error);
      return [];
    }
  }

  /**
   * Busca detalhes específicos de um resumo para drill-down.
   * Sempre retorna arrays e objetos válidos (vazios, nunca undefined).
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
        eventos: Array.isArray(content.detalhes_eventos) ? content.detalhes_eventos : [],
        acoesCrm: Array.isArray(content.detalhes_acoes) ? content.detalhes_acoes : [],
        criterios: typeof content.criterios_busca === 'object' && content.criterios_busca !== null ? content.criterios_busca : {}
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do resumo:', error);
      return null;
    }
  }

  /**
   * Utilitário para parse seguro do metadata
   */
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

  /**
   * Gera o texto-resumo de acordo com os dados reais do período
   */
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

  /**
   * Resumo fallback nunca é retornado (apenas para erro grave/não esperado)
   */
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
