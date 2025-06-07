
import { supabase } from './supabase';
import { format } from 'date-fns';
import { StatusOportunidade } from '@/types';

// Helper function to format date safely
const formatDateOrNull = (date: Date | null) => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};

// Function to get funnel values analysis
export const getFunnelValuesAnalysis = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select('id, status, valor, empresa_origem_id, empresa_destino_id');

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
    }
    
    const { data: oportunidades, error } = await query;
    if (error) throw error;

    // Apply empresa filter if needed
    let filteredData = oportunidades || [];
    if (empresaId) {
      filteredData = filteredData.filter(op => 
        op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );
    }

    // Group by status and calculate values
    const statusValues = filteredData.reduce((acc: any, op: any) => {
      const status = op.status || 'em_contato';
      if (!acc[status]) {
        acc[status] = {
          status,
          total_valor: 0,
          count: 0,
          valor_medio: 0
        };
      }
      acc[status].count++;
      if (op.valor) {
        acc[status].total_valor += Number(op.valor);
      }
      return acc;
    }, {});

    // Calculate average values
    Object.values(statusValues).forEach((item: any) => {
      if (item.count > 0) {
        item.valor_medio = item.total_valor / item.count;
      }
    });

    return Object.values(statusValues);
  } catch (error) {
    console.error('Error in getFunnelValuesAnalysis:', error);
    return [];
  }
};

// Function to get opportunities without values
export const getOportunidadesSemValor = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select(`
        id,
        nome_lead,
        status,
        data_indicacao,
        empresa_origem:empresas!empresa_origem_id(nome),
        empresa_destino:empresas!empresa_destino_id(nome)
      `)
      .is('valor', null);

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
    }
    
    const { data: oportunidades, error } = await query;
    if (error) throw error;

    // Apply empresa filter if needed
    let filteredData = oportunidades || [];
    if (empresaId) {
      filteredData = filteredData.filter(op => 
        op.empresa_origem?.id === empresaId || op.empresa_destino?.id === empresaId
      );
    }

    return filteredData;
  } catch (error) {
    console.error('Error in getOportunidadesSemValor:', error);
    return [];
  }
};

// Function to get total pipeline value
export const getTotalPipelineValue = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select('valor, status, empresa_origem_id, empresa_destino_id')
      .not('valor', 'is', null);

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
    }
    
    const { data: oportunidades, error } = await query;
    if (error) throw error;

    // Apply empresa filter if needed
    let filteredData = oportunidades || [];
    if (empresaId) {
      filteredData = filteredData.filter(op => 
        op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );
    }

    const totalPipeline = filteredData.reduce((total, op) => total + Number(op.valor), 0);
    const totalGanho = filteredData
      .filter(op => op.status === 'ganho')
      .reduce((total, op) => total + Number(op.valor), 0);
    const totalPerdido = filteredData
      .filter(op => op.status === 'perdido')
      .reduce((total, op) => total + Number(op.valor), 0);
    const totalEmAndamento = filteredData
      .filter(op => op.status === 'em_contato' || op.status === 'negociando')
      .reduce((total, op) => total + Number(op.valor), 0);

    return {
      total_pipeline: totalPipeline,
      total_ganho: totalGanho,
      total_perdido: totalPerdido,
      total_em_andamento: totalEmAndamento,
      count_total: filteredData.length,
      count_ganho: filteredData.filter(op => op.status === 'ganho').length,
      count_perdido: filteredData.filter(op => op.status === 'perdido').length,
      count_em_andamento: filteredData.filter(op => op.status === 'em_contato' || op.status === 'negociando').length
    };
  } catch (error) {
    console.error('Error in getTotalPipelineValue:', error);
    return {
      total_pipeline: 0,
      total_ganho: 0,
      total_perdido: 0,
      total_em_andamento: 0,
      count_total: 0,
      count_ganho: 0,
      count_perdido: 0,
      count_em_andamento: 0
    };
  }
};
