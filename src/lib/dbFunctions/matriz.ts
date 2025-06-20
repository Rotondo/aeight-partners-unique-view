
import { supabase } from '../supabase';
import { StatusOportunidade } from '@/types';
import { formatDateOrNull } from './helpers';

// Function to get matriz intragrupo data
export const getMatrizIntragrupo = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    // Implementação local como fallback para evitar erro de RPC
    const { data: oportunidades, error } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
        empresa_destino:empresas!empresa_destino_id(id, nome, tipo)
      `)
      .gte('data_indicacao', dataInicio ? formatDateOrNull(dataInicio) : '1900-01-01')
      .lte('data_indicacao', dataFim ? formatDateOrNull(dataFim) : '2100-12-31');

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
    console.error('Error in getMatrizIntragrupo:', error);
    return [];
  }
};

// Function to get matriz parcerias data
export const getMatrizParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    // Implementação local como fallback
    const { data: oportunidades, error } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
        empresa_destino:empresas!empresa_destino_id(id, nome, tipo)
      `)
      .gte('data_indicacao', dataInicio ? formatDateOrNull(dataInicio) : '1900-01-01')
      .lte('data_indicacao', dataFim ? formatDateOrNull(dataFim) : '2100-12-31');

    if (error) throw error;

    // Filtrar parcerias
    const parceriasData = (oportunidades || []).filter(op => 
      (op.empresa_origem?.tipo === 'parceiro' || op.empresa_destino?.tipo === 'parceiro') &&
      (!status || op.status === status) &&
      (!empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId)
    );

    return parceriasData;
  } catch (error) {
    console.error('Error in getMatrizParcerias:', error);
    return [];
  }
};

// Function to get quality of indications data
export const getQualidadeIndicacoes = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    // Implementação local como fallback
    const { data: oportunidades, error } = await supabase
      .from('oportunidades')
      .select(`
        *,
        empresa_origem:empresas!empresa_origem_id(id, nome, tipo),
        empresa_destino:empresas!empresa_destino_id(id, nome, tipo)
      `)
      .gte('data_indicacao', dataInicio ? formatDateOrNull(dataInicio) : '1900-01-01')
      .lte('data_indicacao', dataFim ? formatDateOrNull(dataFim) : '2100-12-31');

    if (error) throw error;

    const filteredData = (oportunidades || []).filter(op => 
      !empresaId || op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
    );

    return filteredData;
  } catch (error) {
    console.error('Error in getQualidadeIndicacoes:', error);
    return [];
  }
};
