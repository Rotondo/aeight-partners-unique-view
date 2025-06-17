
import { supabase } from '../supabase';
import { StatusOportunidade } from '@/types';
import { formatDateOrNull, createEmpresaMap } from './helpers';

// Function to get ranking of partners by sent indications
export const getRankingParceirosEnviadas = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  status: StatusOportunidade | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select('id, empresa_origem_id, empresa_destino_id, status');

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
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

    const empresasMap = createEmpresaMap(empresas);

    const filteredData = oportunidades?.filter(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return origem?.tipo === 'parceiro' && destino?.tipo === 'intragrupo';
    }).map(op => ({
      parceiro_id: op.empresa_origem_id,
      parceiro_nome: empresasMap.get(op.empresa_origem_id)?.nome
    }));

    const grouped = filteredData?.reduce((acc: any, curr: any) => {
      if (!curr.parceiro_nome) return acc;
      
      if (!acc[curr.parceiro_nome]) {
        acc[curr.parceiro_nome] = {
          parceiro: curr.parceiro_nome,
          indicacoes: 0
        };
      }
      acc[curr.parceiro_nome].indicacoes++;
      return acc;
    }, {});

    return Object.values(grouped || {}).sort((a: any, b: any) => b.indicacoes - a.indicacoes);
  } catch (error) {
    console.error('Error in getRankingParceirosEnviadas:', error);
    return [];
  }
};

// Function to get ranking of partners by received indications
export const getRankingParceirosRecebidas = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  status: StatusOportunidade | null
) => {
  try {
    let query = supabase
      .from('oportunidades')
      .select('id, empresa_origem_id, empresa_destino_id, status');

    if (dataInicio) {
      query = query.gte('data_indicacao', formatDateOrNull(dataInicio));
    }
    
    if (dataFim) {
      query = query.lte('data_indicacao', formatDateOrNull(dataFim));
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

    const empresasMap = createEmpresaMap(empresas);

    const filteredData = oportunidades?.filter(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return origem?.tipo === 'intragrupo' && destino?.tipo === 'parceiro';
    }).map(op => ({
      parceiro_id: op.empresa_destino_id,
      parceiro_nome: empresasMap.get(op.empresa_destino_id)?.nome
    }));

    const grouped = filteredData?.reduce((acc: any, curr: any) => {
      if (!curr.parceiro_nome) return acc;
      
      if (!acc[curr.parceiro_nome]) {
        acc[curr.parceiro_nome] = {
          parceiro: curr.parceiro_nome,
          indicacoes: 0
        };
      }
      acc[curr.parceiro_nome].indicacoes++;
      return acc;
    }, {});

    return Object.values(grouped || {}).sort((a: any, b: any) => b.indicacoes - a.indicacoes);
  } catch (error) {
    console.error('Error in getRankingParceirosRecebidas:', error);
    return [];
  }
};
