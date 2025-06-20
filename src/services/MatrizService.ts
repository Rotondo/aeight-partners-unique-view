import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { StatusOportunidade } from '@/types';

/**
 * Service para operações de matriz (intragrupo e parcerias)
 */
export class MatrizService {
  private static formatDateOrNull = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd') : null;
  };

  static async getMatrizIntragrupo(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null,
    status: StatusOportunidade | null
  ) {
    try {
      const { data, error } = await supabase.rpc('get_matriz_intragrupo_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        empresa_id_param: empresaId,
        status_param: status,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getMatrizIntragrupo:', error);
      return [];
    }
  }

  static async getMatrizParcerias(
    dataInicio: Date | null,
    dataFim: Date | null,
    empresaId: string | null,
    status: StatusOportunidade | null
  ) {
    try {
      const { data, error } = await supabase.rpc('get_matriz_parcerias_data', {
        data_inicio_param: this.formatDateOrNull(dataInicio),
        data_fim_param: this.formatDateOrNull(dataFim),
        empresa_id_param: empresaId,
        status_param: status,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getMatrizParcerias:', error);
      return [];
    }
  }
}
