
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
        titulo: 'Anotações da reunião',
        descricao: 'Principais pontos discutidos',
        tipo: 'texto',
        status: 'concluida',
        usuario_responsavel_id: 'user-1',
        conteudo_texto: 'Reunião produtiva com definições importantes.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      titulo: acao.titulo || '',
      descricao: acao.descricao || '',
      tipo: acao.tipo || 'texto',
      status: acao.status || 'pendente',
      parceiro_id: acao.parceiro_id,
      usuario_responsavel_id: userId,
      arquivo_audio: acao.arquivo_audio,
      arquivo_video: acao.arquivo_video,
      conteudo_texto: acao.conteudo_texto,
      data_prevista: acao.data_prevista,
      data_realizada: acao.data_realizada,
      proximos_passos: acao.proximos_passos,
      observacoes: acao.observacoes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
      acao.proximos_passos && 
      acao.status !== 'concluida' && 
      acao.status !== 'cancelada'
    );
  }

  /**
   * Valida dados de uma ação antes de salvar
   */
  static validateAcao(acao: Partial<CrmAcao>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!acao.titulo?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!acao.descricao?.trim()) {
      errors.push('Descrição é obrigatória');
    }

    if (acao.tipo === 'texto' && !acao.conteudo_texto?.trim()) {
      errors.push('Conteúdo de texto é obrigatório para este tipo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
