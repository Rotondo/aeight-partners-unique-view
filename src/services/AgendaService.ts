
import { supabase } from '@/integrations/supabase/client';
import type { AgendaEvento, TipoEventoAgenda } from '@/types/diario';

/**
 * Service para operações da Agenda com integração ao CRM
 */
export class AgendaService {
  /**
   * Cria um evento na agenda a partir de um próximo passo do CRM
   */
  static async createEventFromCrmNextStep(
    crmActionId: string,
    nextStepDate: string,
    nextStepDescription: string,
    partnerId?: string
  ): Promise<AgendaEvento | null> {
    try {
      const startDate = new Date(nextStepDate);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora depois

      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .insert([{
          title: `Follow-up: ${nextStepDescription}`,
          description: `Próximo passo gerado automaticamente pelo CRM`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          status: 'scheduled',
          partner_id: partnerId,
          source: 'crm_integration',
          event_type: 'proximo_passo_crm',
          related_crm_action_id: crmActionId
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar evento da agenda:', error);
        return null;
      }

      return data ? {
        id: data.id,
        title: data.title,
        description: data.description,
        start: data.start,
        end: data.end,
        status: data.status,
        partner_id: data.partner_id,
        source: data.source,
        external_id: data.external_id,
        event_type: (data.event_type as TipoEventoAgenda) || 'proximo_passo_crm',
        related_crm_action_id: data.related_crm_action_id,
        created_at: data.created_at,
        updated_at: data.updated_at
      } : null;
    } catch (error) {
      console.error('Erro ao criar evento da agenda:', error);
      return null;
    }
  }

  /**
   * Atualiza o status de um evento na agenda baseado no CRM
   */
  static async updateEventStatusFromCrm(
    crmActionId: string,
    status: 'scheduled' | 'completed' | 'canceled'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .update({ status })
        .eq('related_crm_action_id', crmActionId);

      if (error) {
        console.error('Erro ao atualizar status do evento:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do evento:', error);
      return false;
    }
  }

  /**
   * Remove evento da agenda quando ação CRM é excluída
   */
  static async deleteEventFromCrm(crmActionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('diario_agenda_eventos')
        .delete()
        .eq('related_crm_action_id', crmActionId);

      if (error) {
        console.error('Erro ao deletar evento da agenda:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar evento da agenda:', error);
      return false;
    }
  }

  /**
   * Carrega todos os eventos da agenda
   */
  static async loadEventos(): Promise<AgendaEvento[]> {
    try {
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .order('start', { ascending: true });

      if (error) {
        console.error('Erro ao carregar eventos:', error);
        throw error;
      }

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
        event_type: (evento.event_type as TipoEventoAgenda) || 'outro',
        related_crm_action_id: evento.related_crm_action_id,
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
    } catch (error) {
      console.error('Erro no loadEventos:', error);
      throw error;
    }
  }

  /**
   * Carrega eventos atrasados
   */
  static async getOverdueEvents(): Promise<AgendaEvento[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .lt('start', now)
        .in('status', ['scheduled', 'synced'])
        .order('start', { ascending: true });

      if (error) {
        console.error('Erro ao carregar eventos atrasados:', error);
        return [];
      }

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
        event_type: (evento.event_type as TipoEventoAgenda) || 'outro',
        related_crm_action_id: evento.related_crm_action_id,
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
    } catch (error) {
      console.error('Erro ao carregar eventos atrasados:', error);
      return [];
    }
  }

  /**
   * Carrega próximos eventos
   */
  static async getUpcomingEvents(): Promise<AgendaEvento[]> {
    try {
      const now = new Date().toISOString();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data, error } = await supabase
        .from('diario_agenda_eventos')
        .select('*')
        .gte('start', now)
        .lte('start', nextWeek.toISOString())
        .in('status', ['scheduled', 'synced'])
        .order('start', { ascending: true });

      if (error) {
        console.error('Erro ao carregar próximos eventos:', error);
        return [];
      }

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
        event_type: (evento.event_type as TipoEventoAgenda) || 'outro',
        related_crm_action_id: evento.related_crm_action_id,
        created_at: evento.created_at,
        updated_at: evento.updated_at
      }));
    } catch (error) {
      console.error('Erro ao carregar próximos eventos:', error);
      return [];
    }
  }
}
