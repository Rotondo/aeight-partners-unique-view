
import { supabase } from '@/integrations/supabase/client';
import type { CrmAcao, MetodoComunicacao, StatusAcaoCrm } from '@/types/diario';

/**
 * Service para operações do CRM
 */
export class CrmService {
  /**
   * Carrega todas as ações do CRM
   */
  static async loadAcoes(): Promise<CrmAcao[]> {
    try {
      const { data, error } = await supabase
        .from('diario_crm_acoes')
        .select(`
          *,
          empresas:partner_id (
            id,
            nome,
            tipo
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar ações CRM:', error);
        throw error;
      }

      return (data || []).map(acao => ({
        id: acao.id,
        description: acao.content,
        communication_method: this.mapCommunicationMethod(acao.type),
        status: this.mapStatus(acao.metadata),
        partner_id: acao.partner_id,
        user_id: acao.user_id,
        content: acao.content,
        next_step_date: acao.next_step_date,
        next_steps: typeof acao.metadata === 'object' && acao.metadata ? 
          (acao.metadata as any).next_steps : undefined,
        metadata: typeof acao.metadata === 'object' ? acao.metadata as Record<string, any> : {},
        created_at: acao.created_at,
        parceiro: acao.empresas ? {
          id: acao.empresas.id,
          nome: acao.empresas.nome,
          tipo: acao.empresas.tipo
        } : undefined
      }));
    } catch (error) {
      console.error('Erro no loadAcoes:', error);
      throw error;
    }
  }

  /**
   * Cria uma nova ação do CRM
   */
  static async createAcao(acao: Partial<CrmAcao>, userId: string): Promise<CrmAcao | null> {
    try {
      const metadata = {
        description: acao.description,
        communication_method: acao.communication_method,
        status: acao.status,
        next_steps: acao.next_steps,
        ...acao.metadata
      };

      const { data, error } = await supabase
        .from('diario_crm_acoes')
        .insert([{
          content: acao.content || '',
          type: acao.communication_method === 'ligacao' ? 'audio' : 
                acao.communication_method === 'reuniao_meet' ? 'video' : 'text',
          partner_id: acao.partner_id,
          user_id: userId,
          next_step_date: acao.next_step_date,
          metadata: metadata
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ação CRM:', error);
        throw error;
      }

      return data ? {
        id: data.id,
        description: acao.description || '',
        communication_method: acao.communication_method || 'email',
        status: acao.status || 'pendente',
        partner_id: data.partner_id,
        user_id: data.user_id,
        content: data.content,
        next_step_date: data.next_step_date,
        next_steps: acao.next_steps,
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {},
        created_at: data.created_at
      } : null;
    } catch (error) {
      console.error('Erro no createAcao:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma ação do CRM
   */
  static async updateAcao(id: string, updates: Partial<CrmAcao>): Promise<boolean> {
    try {
      const currentMetadata = updates.metadata || {};
      const newMetadata = {
        ...currentMetadata,
        status: updates.status,
        next_steps: updates.next_steps
      };

      const { error } = await supabase
        .from('diario_crm_acoes')
        .update({
          content: updates.content,
          next_step_date: updates.next_step_date,
          metadata: newMetadata
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar ação CRM:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro no updateAcao:', error);
      return false;
    }
  }

  /**
   * Exclui uma ação do CRM
   */
  static async deleteAcao(id: string): Promise<boolean> {
    try {
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
   * Filtra ações com próximos passos pendentes
   */
  static filterAcoesComProximosPassos(acoes: CrmAcao[]): CrmAcao[] {
    return acoes.filter(acao => 
      acao.next_steps && 
      acao.status !== 'concluida' && 
      acao.status !== 'cancelada'
    );
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

  private static mapCommunicationMethod(type: string): MetodoComunicacao {
    switch (type) {
      case 'audio': return 'ligacao';
      case 'video': return 'reuniao_meet';
      case 'text': return 'email';
      default: return 'email';
    }
  }

  private static mapStatus(metadata: any): StatusAcaoCrm {
    if (typeof metadata === 'object' && metadata?.status) {
      return metadata.status;
    }
    return 'pendente';
  }
}
