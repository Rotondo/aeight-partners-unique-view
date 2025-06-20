
import { supabase } from '../supabase';
import { StatusOportunidade } from '@/types';
import { formatDateOrNull, createEmpresaMap, filterByEmpresa } from './helpers';

// Function to get matriz intragrupo data
export const getMatrizIntragrupo = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    const { data, error } = await supabase.rpc('get_matriz_intragrupo_data', {
      data_inicio_param: formatDateOrNull(dataInicio),
      data_fim_param: formatDateOrNull(dataFim),
      empresa_id_param: empresaId,
      status_param: status,
    });

    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase.rpc('get_matriz_parcerias_data', {
      data_inicio_param: formatDateOrNull(dataInicio),
      data_fim_param: formatDateOrNull(dataFim),
      empresa_id_param: empresaId,
      status_param: status,
    });

    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase.rpc('get_qualidade_indicacoes_data', {
      data_inicio_param: formatDateOrNull(dataInicio),
      data_fim_param: formatDateOrNull(dataFim),
      empresa_id_param: empresaId,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getQualidadeIndicacoes:', error);
    return [];
  }
};
