
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
    let query = supabase.from('oportunidades').select('id, empresa_origem_id, empresa_destino_id, status');
    
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
};

// Function to get matriz parcerias data
export const getMatrizParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    let query = supabase.from('oportunidades').select('id, empresa_origem_id, empresa_destino_id, status');
    
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
};

// Function to get quality of indications data
export const getQualidadeIndicacoes = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
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
    
    const { data: oportunidades, error } = await query;
    if (error) throw error;
    
    let filteredOportunidades = filterByEmpresa(oportunidades, empresaId);

    const empresaIds = new Set<string>();
    filteredOportunidades.forEach(op => {
      if (op.empresa_origem_id) empresaIds.add(op.empresa_origem_id);
      if (op.empresa_destino_id) empresaIds.add(op.empresa_destino_id);
    });

    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome, tipo')
      .in('id', Array.from(empresaIds));
    
    if (empresasError) throw empresasError;

    const empresasMap = createEmpresaMap(empresas);

    const processedData = filteredOportunidades.map(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return {
        origem: origem?.nome || 'Desconhecido',
        destino: destino?.nome || 'Desconhecido',
        status: op.status,
      };
    });

    const grouped = processedData.reduce((acc: any, curr: any) => {
      const key = `${curr.origem}-${curr.destino}-${curr.status}`;
      if (!acc[key]) {
        acc[key] = {
          origem: curr.origem,
          destino: curr.destino,
          status: curr.status,
          total: 0
        };
      }
      acc[key].total++;
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error('Error in getQualidadeIndicacoes:', error);
    return [];
  }
};
