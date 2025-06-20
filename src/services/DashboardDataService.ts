import { supabase } from '@/lib/supabase'; // Ajuste o caminho se necessário
import { StatusOportunidade } from '@/types'; // Ajuste o caminho se necessário
import { format } from 'date-fns';

// Tipos de retorno esperados pelas funções, para clareza
// (Estes podem já existir em @/types, mas são colocados aqui para referência durante a criação do serviço)
interface BalancoData {
  tipo: 'Enviadas' | 'Recebidas';
  valor: number;
}

interface RankingData {
  parceiro_nome: string; // ou 'parceiro' se for decidido mapear para o formato antigo
  indicacoes_total: number; // ou 'indicacoes'
}

interface StatusDistributionData {
  status: string;
  total: number;
}

export class DashboardDataService {
  private static formatDateOrNull(date: Date | null): string | null {
    return date ? format(date, 'yyyy-MM-dd') : null;
  }

  static async getBalancoGrupoParcerias(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null,
    status: StatusOportunidade | null
  ): Promise<BalancoData[]> {
    try {
      const { data, error } = await supabase.rpc('get_balanco_grupo_parcerias_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        empresa_id_param: empresaId,
        status_param: status,
      });

      if (error) throw error;

      const result = data?.[0];
      if (result) {
        return [
          { tipo: 'Enviadas', valor: result.enviadas_count || 0 },
          { tipo: 'Recebidas', valor: result.recebidas_count || 0 }
        ];
      }
      return [
        { tipo: 'Enviadas', valor: 0 },
        { tipo: 'Recebidas', valor: 0 }
      ];
    } catch (error) {
      console.error('Error in DashboardDataService.getBalancoGrupoParcerias:', error);
      return [ // Retornar um valor padrão em caso de erro, consistente com a função original
        { tipo: 'Enviadas', valor: 0 },
        { tipo: 'Recebidas', valor: 0 }
      ];
    }
  }

  static async getRankingParceirosEnviadas(
    dataInicio: Date | null,
    dataFim: Date | null,
    status: StatusOportunidade | null
  ): Promise<RankingData[]> {
    try {
      const { data, error } = await supabase.rpc('get_ranking_parceiros_enviadas_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        status_param: status,
      });

      if (error) throw error;
      return (data || []) as RankingData[]; // Assumindo que a RPC retorna o formato esperado
    } catch (error) {
      console.error('Error in DashboardDataService.getRankingParceirosEnviadas:', error);
      return [];
    }
  }

  static async getRankingParceirosRecebidas(
    dataInicio: Date | null,
    dataFim: Date | null,
    status: StatusOportunidade | null
  ): Promise<RankingData[]> {
    try {
      const { data, error } = await supabase.rpc('get_ranking_parceiros_recebidas_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        status_param: status,
      });

      if (error) throw error;
      return (data || []) as RankingData[];
    } catch (error) {
      console.error('Error in DashboardDataService.getRankingParceirosRecebidas:', error);
      return [];
    }
  }

  static async getStatusDistribution(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null
  ): Promise<StatusDistributionData[]> {
    try {
      const { data, error } = await supabase.rpc('get_status_distribution_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        empresa_id_param: empresaId,
      });

      if (error) throw error;
      return (data || []) as StatusDistributionData[];
    } catch (error) {
      console.error('Error in DashboardDataService.getStatusDistribution:', error);
      return [];
    }
  }
}
