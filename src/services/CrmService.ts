
import { ApiService } from './ApiService';
import type { CrmAcao } from '@/types/diario';

/**
 * Service para operações do CRM
 */
export class CrmService {
  /**
   * Carrega todas as ações do CRM
   */
  static async loadAcoes(): Promise<CrmAcao[]> {
    // Mock data por enquanto - será substituído por chamada real do Supabase
    const mockAcoes: CrmAcao[] = [
      {
        id: '1',
        description: 'Anotações da reunião',
        communication_method: 'reuniao_meet',
        status: 'concluida',
        user_id: 'user-1',
        content: 'Reunião produtiva com definições importantes.',
        created_at: new Date().toISOString()
      }
    ];
    
    return mockAcoes;
  }

  /**
   * Cria uma nova ação do CRM
   */
  static async createAcao(acao: Partial<CrmAcao>, userId: string): Promise<CrmAcao | null> {
    const novaAcao: CrmAcao = {
      id: Date.now().toString(),
      description: acao.description || '',
      communication_method: acao.communication_method || 'email',
      status: acao.status || 'pendente',
      partner_id: acao.partner_id,
      user_id: userId,
      content: acao.content || '',
      next_step_date: acao.next_step_date,
      next_steps: acao.next_steps,
      metadata: acao.metadata,
      created_at: new Date().toISOString()
    };

    // Mock - em produção faria a chamada real
    return novaAcao;
  }

  /**
   * Atualiza uma ação do CRM
   */
  static async updateAcao(id: string, updates: Partial<CrmAcao>): Promise<boolean> {
    // Mock - em produção faria a chamada real
    return true;
  }

  /**
   * Exclui uma ação do CRM
   */
  static async deleteAcao(id: string): Promise<boolean> {
    // Mock - em produção faria a chamada real
    return true;
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
}
