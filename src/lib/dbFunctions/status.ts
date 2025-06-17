
import { supabase } from '../supabase';
import { formatDateOrNull, filterByEmpresa } from './helpers';

// Function to get status distribution
export const getStatusDistribution = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select('id, status, empresa_origem_id, empresa_destino_id');

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
    }
    
    const { data: oportunidades, error } = await query;
    if (error) throw error;

    let filteredData = filterByEmpresa(oportunidades, empresaId);

    const grouped = filteredData.reduce((acc: any, curr: any) => {
      if (!acc[curr.status]) {
        acc[curr.status] = {
          status: curr.status,
          total: 0
        };
      }
      acc[curr.status].total++;
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error('Error in getStatusDistribution:', error);
    return [];
  }
};
