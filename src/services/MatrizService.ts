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
      let query = supabase.from('oportunidades').select('id, empresa_origem_id, empresa_destino_id, status');
      
      if (dataInicio) {
        query = query.gte('data_indicacao', this.formatDateOrNull(dataInicio));
      }
      
      if (dataFim) {
        query = query.lte('data_indicacao', this.formatDateOrNull(dataFim));
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: oportunidades, error } = await query;
      if (error) throw error;

      const empresaIds = new Set<string>();
      oportunidades?.forEach(op => {
        if (op.empresa_origem_id) empresaIds.add(op.empresa_origem_id);
        if (op.empresa_destino_id) empresaIds.add(op.empresa_destino_id);
      });

      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('id, nome, tipo')
        .in('id', Array.from(empresaIds));
      
      if (empresasError) throw empresasError;

      const empresasMap = new Map();
      empresas?.forEach(empresa => {
        empresasMap.set(empresa.id, empresa);
      });

      let processedData = oportunidades
        ?.filter(op => {
          const origem = empresasMap.get(op.empresa_origem_id);
          const destino = empresasMap.get(op.empresa_destino_id);
          
          if (!origem || !destino) return false;
          
          const isIntragrupo = origem.tipo === 'intragrupo' && destino.tipo === 'intragrupo';
          
          if (!isIntragrupo) return false;
          
          if (empresaId) {
            return op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId;
          }
          
          return true;
        })
        .map(op => {
          const origem = empresasMap.get(op.empresa_origem_id);
          const destino = empresasMap.get(op.empresa_destino_id);
          
          return {
            origem_id: op.empresa_origem_id,
            destino_id: op.empresa_destino_id,
            origem: origem?.nome,
            destino: destino?.nome
          };
        });

      const grouped = processedData?.reduce((acc: any, curr: any) => {
        const key = `${curr.origem}-${curr.destino}`;
        if (!acc[key]) {
          acc[key] = {
            origem: curr.origem,
            destino: curr.destino,
            total: 0
          };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(grouped || {});
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
      let query = supabase.from('oportunidades').select('id, empresa_origem_id, empresa_destino_id, status');
      
      if (dataInicio) {
        query = query.gte('data_indicacao', this.formatDateOrNull(dataInicio));
      }
      
      if (dataFim) {
        query = query.lte('data_indicacao', this.formatDateOrNull(dataFim));
      }
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data: oportunidades, error } = await query;
      if (error) throw error;

      const empresaIds = new Set<string>();
      oportunidades?.forEach(op => {
        if (op.empresa_origem_id) empresaIds.add(op.empresa_origem_id);
        if (op.empresa_destino_id) empresaIds.add(op.empresa_destino_id);
      });

      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('id, nome, tipo')
        .in('id', Array.from(empresaIds));
      
      if (empresasError) throw empresasError;

      const empresasMap = new Map();
      empresas?.forEach(empresa => {
        empresasMap.set(empresa.id, empresa);
      });

      let processedData = oportunidades
        ?.filter(op => {
          const origem = empresasMap.get(op.empresa_origem_id);
          const destino = empresasMap.get(op.empresa_destino_id);
          
          if (!origem || !destino) return false;
          
          const hasParceiro = origem.tipo === 'parceiro' || destino.tipo === 'parceiro';
          
          if (!hasParceiro) return false;
          
          if (empresaId) {
            return op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId;
          }
          
          return true;
        })
        .map(op => {
          const origem = empresasMap.get(op.empresa_origem_id);
          const destino = empresasMap.get(op.empresa_destino_id);
          
          return {
            origem_id: op.empresa_origem_id,
            destino_id: op.empresa_destino_id,
            origem: origem?.nome,
            destino: destino?.nome
          };
        });

      const grouped = processedData?.reduce((acc: any, curr: any) => {
        const key = `${curr.origem}-${curr.destino}`;
        if (!acc[key]) {
          acc[key] = {
            origem: curr.origem,
            destino: curr.destino,
            total: 0
          };
        }
        acc[key].total++;
        return acc;
      }, {});

      return Object.values(grouped || {});
    } catch (error) {
      console.error('Error in getMatrizParcerias:', error);
      return [];
    }
  }
}
