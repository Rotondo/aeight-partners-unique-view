
import { supabase } from '@/integrations/supabase/client';
import type { AgendaEvento } from '@/types/diario';

/**
 * Service para operações da Agenda com integração CRM
 */
export class AgendaService {
  /**
   * Cria um evento na agenda automaticamente a partir de um próximo passo do CRM
   */
  static async createEventFromCrmNextStep(
    crmActionId: string,
    nextStepDate: string,
    description: string,
    partnerId?: string
  ): Promise<AgendaEvento | null> {
    try {
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .insert([{
          title: `Próximo Passo: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`,
          description: description,
          start: nextStepDate,
          end: nextStepDate,
          status: 'scheduled',
          partner_id: partnerId,
          source: 'crm_integration',
          external_id: `crm-${crmActionId}`
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        start: data.start,
        end: data.end,
        status: data.status,
        partner_id: data.partner_id,
        source: data.source,
        external_id: data.external_id,
        event_type: 'proximo_passo_crm',
        related_crm_action_id: crmActionId,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Erro ao criar evento da agenda a partir do CRM:', error);
      return null;
    }
  }

  /**
   * Atualiza o status de um evento relacionado a uma ação CRM
   */
  static async updateEventStatusFromCrm(
    crmActionId: string,
    newStatus: 'scheduled' | 'completed' | 'canceled'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .update({ status: newStatus })
        .eq('external_id', `crm-${crmActionId}`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do evento:', error);
      return false;
    }
  }

  /**
   * Remove evento da agenda quando ação CRM é deletada
   */
  static async deleteEventFromCrm(crmActionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .delete()
        .eq('external_id', `crm-${crmActionId}`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar evento da agenda:', error);
      return false;
    }
  }

  /**
   * Busca eventos atrasados (próximos passos não concluídos)
   */
  static async getOverdueEvents(): Promise<AgendaEvento[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .eq('source', 'crm_integration')
        .eq('status', 'scheduled')
        .lt('start', now);

      if (error) throw error;

      return (data || []).map(evento => ({
        id: evento.id,
        title: evento.title,
        description: evento.description,
        start: evento.start,
        end: evento.end,
        status: evento.status,
        partner_id: evento.partner_id,
        source: evento.source,
        external_id: evento.external_id,
        event_type: 'proximo_passo_crm',
        related_crm_action_id: evento.external_id?.replace('crm-', ''),
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos atrasados:', error);
      return [];
    }
  }

  /**
   * Busca próximos eventos (próximos 7 dias)
   */
  static async getUpcomingEvents(): Promise<AgendaEvento[]> {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .eq('source', 'crm_integration')
        .eq('status', 'scheduled')
        .gte('start', now.toISOString())
        .lte('start', nextWeek.toISOString())
        .order('start', { ascending: true });

      if (error) throw error;

      return (data || []).map(evento => ({
        id: evento.id,
        title: evento.title,
        description: evento.description,
        start: evento.start,
        end: evento.end,
        status: evento.status,
        partner_id: evento.partner_id,
        source: evento.source,
        external_id: evento.external_id,
        event_type: 'proximo_passo_crm',
        related_crm_action_id: evento.external_id?.replace('crm-', ''),
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      return [];
    }
  }
}
