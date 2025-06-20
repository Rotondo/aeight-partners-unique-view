
import { supabase } from '@/lib/supabase';
import { StatusOportunidade } from '@/types';
import { format } from 'date-fns';

// Tipos de retorno esperados pelas funções
interface BalancoData {
  tipo: 'Enviadas' | 'Recebidas';
  valor: number;
}

interface RankingData {
  parceiro_nome: string;
  indicacoes_total: number;
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
      // Implementação local como fallback
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(tipo),
          empresa_destino:empresas!empresa_destino_id(tipo)
        `)
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      const filteredOps = (oportunidades || []).filter(op => 
        (!status || op.status === status) &&
        (!empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId)
      );

      const enviadas = filteredOps.filter(op => 
        op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'parceiro'
      ).length;

      const recebidas = filteredOps.filter(op => 
        op.empresa_origem?.tipo === 'parceiro' && op.empresa_destino?.tipo === 'intragrupo'
      ).length;

      return [
        { tipo: 'Enviadas', valor: enviadas },
        { tipo: 'Recebidas', valor: recebidas }
      ];
    } catch (error) {
      console.error('Error in DashboardDataService.getBalancoGrupoParcerias:', error);
      return [
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
      // Implementação local como fallback
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(nome, tipo),
          empresa_destino:empresas!empresa_destino_id(tipo)
        `)
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      const enviadas = (oportunidades || []).filter(op => 
        op.empresa_origem?.tipo === 'parceiro' && 
        op.empresa_destino?.tipo === 'intragrupo' &&
        (!status || op.status === status)
      );

      // Agrupar por parceiro
      const ranking = enviadas.reduce((acc: Record<string, number>, op) => {
        const parceiro = op.empresa_origem?.nome || 'Desconhecido';
        acc[parceiro] = (acc[parceiro] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(ranking)
        .map(([parceiro_nome, indicacoes_total]) => ({ parceiro_nome, indicacoes_total }))
        .sort((a, b) => b.indicacoes_total - a.indicacoes_total);
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
      // Implementação similar ao método anterior, mas invertendo origem/destino
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(tipo),
          empresa_destino:empresas!empresa_destino_id(nome, tipo)
        `)
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      const recebidas = (oportunidades || []).filter(op => 
        op.empresa_origem?.tipo === 'intragrupo' && 
        op.empresa_destino?.tipo === 'parceiro' &&
        (!status || op.status === status)
      );

      const ranking = recebidas.reduce((acc: Record<string, number>, op) => {
        const parceiro = op.empresa_destino?.nome || 'Desconhecido';
        acc[parceiro] = (acc[parceiro] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(ranking)
        .map(([parceiro_nome, indicacoes_total]) => ({ parceiro_nome, indicacoes_total }))
        .sort((a, b) => b.indicacoes_total - a.indicacoes_total);
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
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select('status, empresa_origem_id, empresa_destino_id')
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      const filteredOps = (oportunidades || []).filter(op => 
        !empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );

      const statusCounts = filteredOps.reduce((acc: Record<string, number>, op) => {
        const status = op.status || 'indefinido';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCounts).map(([status, total]) => ({ status, total }));
    } catch (error) {
      console.error('Error in DashboardDataService.getStatusDistribution:', error);
      return [];
    }
  }
}
