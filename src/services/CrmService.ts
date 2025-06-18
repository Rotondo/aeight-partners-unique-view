
import { supabase } from '@/integrations/supabase/client';
import { AgendaService } from './AgendaService';
import type { CrmAcao, MetodoComunicacao, StatusAcaoCrm } from '@/types/diario';

/**
 * Service para operações do CRM com integração automática à agenda
 */
export class CrmService {
  /**
   * Carrega todas as ações do CRM
   */
  static async loadAcoes(): Promise<CrmAcao[]> {
    try {
      const { data, error } = await supabase
        .from('diario_crm_acoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar ações CRM:', error);
        throw error;
      }

      // Buscar dados dos parceiros separadamente se necessário
      const acoesComParceiros = await Promise.all((data || []).map(async (acao) => {
        let parceiro = undefined;
        
        if (acao.partner_id) {
          const { data: parceiroDados } = await supabase
            .from('empresas')
            .select('id, nome, tipo')
            .eq('id', acao.partner_id)
            .single();
          
          if (parceiroDados) {
            parceiro = {
              id: parceiroDados.id,
              nome: parceiroDados.nome,
              tipo: parceiroDados.tipo
            };
          }
        }

        return {
          id: acao.id,
          description: acao.description || '',
          communication_method: acao.communication_method,
          status: acao.status,
          partner_id: acao.partner_id,
          user_id: acao.user_id,
          content: acao.content,
          next_step_date: acao.next_step_date,
          next_steps: acao.next_steps,
          metadata: this.safeParseMetadata(acao.metadata),
          created_at: acao.created_at,
          parceiro
        };
      }));

      return acoesComParceiros;
    } catch (error) {
      console.error('Erro no loadAcoes:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova ação do CRM com integração automática à agenda
   */
  static async createAcao(acao: Partial<CrmAcao>, userId: string): Promise<CrmAcao | null> {
    try {
      const validation = CrmService.validateAcao(acao);
      if (!validation.isValid) {
        console.error('Ação inválida:', validation.errors);
        return null;
      }

      const metadata = {
        created_via: 'form',
        ...acao.metadata
      };

      const { data, error } = await supabase
        .from('diario_crm_acoes')
        .insert([{
          description: acao.description,
          content: acao.content || '',
          communication_method: acao.communication_method,
          status: acao.status || 'pendente',
          type: acao.communication_method === 'ligacao' ? 'audio' : 
                acao.communication_method === 'reuniao_meet' ? 'video' : 'text',
          partner_id: acao.partner_id,
          user_id: userId,
          next_step_date: acao.next_step_date,
          next_steps: acao.next_steps,
          metadata: metadata
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ação CRM:', error);
        throw error;
      }

      // INTEGRAÇÃO AUTOMÁTICA: Se há próximo passo com data, criar evento na agenda
      if (data && acao.next_step_date && acao.next_steps) {
        console.log('Criando evento na agenda automaticamente...');
        await AgendaService.createEventFromCrmNextStep(
          data.id,
          acao.next_step_date,
          acao.next_steps,
          acao.partner_id
        );
      }

      return data ? {
        id: data.id,
        description: data.description || '',
        communication_method: data.communication_method,
        status: data.status,
        partner_id: data.partner_id,
        user_id: data.user_id,
        content: data.content,
        next_step_date: data.next_step_date,
        next_steps: data.next_steps,
        metadata: this.safeParseMetadata(data.metadata),
        created_at: data.created_at
      } : null;
    } catch (error) {
      console.error('Erro no createAcao:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma ação do CRM com sincronização automática na agenda
   */
  static async updateAcao(id: string, updates: Partial<CrmAcao>): Promise<boolean> {
    try {
      const currentMetadata = updates.metadata || {};

      const { error } = await supabase
        .from('diario_crm_acoes')
        .update({
          description: updates.description,
          content: updates.content,
          communication_method: updates.communication_method,
          status: updates.status,
          next_step_date: updates.next_step_date,
          next_steps: updates.next_steps,
          metadata: currentMetadata
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar ação CRM:', error);
        throw error;
      }

      // SINCRONIZAÇÃO AUTOMÁTICA: Atualizar status do evento na agenda
      if (updates.status) {
        const agendaStatus = updates.status === 'concluida' ? 'completed' : 
                           updates.status === 'cancelada' ? 'canceled' : 'scheduled';
        
        console.log(`Sincronizando status na agenda: ${agendaStatus}`);
        await AgendaService.updateEventStatusFromCrm(id, agendaStatus);
      }

      return true;
    } catch (error) {
      console.error('Erro no updateAcao:', error);
      return false;
    }
  }

  /**
   * Exclui uma ação do CRM com remoção automática do evento na agenda
   */
  static async deleteAcao(id: string): Promise<boolean> {
    try {
      // INTEGRAÇÃO AUTOMÁTICA: Remover evento relacionado da agenda
      console.log('Removendo evento da agenda...');
      await AgendaService.deleteEventFromCrm(id);

      const { error } = await supabase
        .from('diario_crm_acoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ação CRM:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro no deleteAcao:', error);
      return false;
    }
  }

  /**
   * Filtra ações com próximos passos pendentes incluindo status temporal
   */
  static filterAcoesComProximosPassos(acoes: CrmAcao[]): CrmAcao[] & { overdue?: CrmAcao[]; upcoming?: CrmAcao[] } {
    const now = new Date();
    const proximosPassos = acoes.filter(acao => 
      acao.next_steps && 
      acao.status !== 'concluida' && 
      acao.status !== 'cancelada'
    );

    // Separar por status temporal
    const overdue = proximosPassos.filter(acao => {
      if (!acao.next_step_date) return false;
      return new Date(acao.next_step_date) < now;
    });

    const upcoming = proximosPassos.filter(acao => {
      if (!acao.next_step_date) return true; // Sem data = upcoming
      return new Date(acao.next_step_date) >= now;
    });

    const result = proximosPassos as CrmAcao[] & { overdue?: CrmAcao[]; upcoming?: CrmAcao[] };
    result.overdue = overdue;
    result.upcoming = upcoming;

    return result;
  }

  /**
   * Valida dados de uma ação antes de salvar
   */
  static validateAcao(acao: Partial<CrmAcao>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!acao.description?.trim()) {
      errors.push('Descrição é obrigatória');
    }

    if (!acao.content?.trim()) {
      errors.push('Conteúdo é obrigatório');
    }

    if (!acao.communication_method) {
      errors.push('Método de comunicação é obrigatório');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Analisa e retorna os dados de metadados de forma segura
   */
  private static safeParseMetadata(metadata: any): Record<string, any> {
    if (!metadata) return {};
    
    if (typeof metadata === 'object') {
      return metadata as Record<string, any>;
    }
    
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    
    return {};
  }
}
