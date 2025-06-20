
import { supabase } from '@/lib/supabase';
import { StatusOportunidade } from '@/types';
import { format } from 'date-fns';

export class MatrizService {
  private static formatDateOrNull(date: Date | null): string | null {
    return date ? format(date, 'yyyy-MM-dd') : null;
  }

  static async getMatrizIntragrupoData(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null,
    status: StatusOportunidade | null
  ) {
    try {
      // Implementação local sem RPC
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo)
        `)
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      // Filtrar apenas oportunidades intragrupo
      const intraData = (oportunidades || []).filter(op => 
        op.empresa_origem?.tipo === 'intragrupo' && 
        op.empresa_destino?.tipo === 'intragrupo' &&
        (!status || op.status === status) &&
        (!empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId)
      );

      return intraData;
    } catch (error) {
      console.error('Error in MatrizService.getMatrizIntragrupoData:', error);
      return [];
    }
  }

  static async getMatrizParceriasData(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null,
    status: StatusOportunidade | null
  ) {
    try {
      // Implementação local sem RPC
      const { data: oportunidades, error } = await supabase
        .from('oportunidades')
        .select(`
          *,
          empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
          empresa_destino:empresas!empresa_destino_id(id, nome, tipo)
        `)
        .gte('data_indicacao', dataInicio ? this.formatDateOrNull(dataInicio) : '1900-01-01')
        .lte('data_indicacao', dataFim ? this.formatDateOrNull(dataFim) : '2100-12-31');

      if (error) throw error;

      // Filtrar parcerias
      const parceriasData = (oportunidades || []).filter(op => 
        (op.empresa_origem?.tipo === 'parceiro' || op.empresa_destino?.tipo === 'parceiro') &&
        (!status || op.status === status) &&
        (!empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId)
      );

      return parceriasData;
    } catch (error) {
      console.error('Error in MatrizService.getMatrizParceriasData:', error);
      return [];
    }
  }
}
