
import { supabase } from './supabase';
import { format } from 'date-fns';
import { StatusOportunidade } from '@/types';

// Helper function to format date safely
const formatDateOrNull = (date: Date | null) => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};

// Function to get matriz intragrupo data
export const getMatrizIntragrupo = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    // First fetch the base data without joins to prevent stack depth issues
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

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Filter and transform the data
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

    // Group by origem and destino
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
    // Use the same pattern as getMatrizIntragrupo for optimization
    // First fetch the base data without joins
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

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Filter and transform the data - for parcerias, at least one side is a parceiro
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

    // Group by origem and destino
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
    // Same optimization pattern
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
    
    // Apply empresa filter if needed
    let filteredOportunidades = oportunidades;
    if (empresaId) {
      filteredOportunidades = oportunidades.filter(op => 
        op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );
    }

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Process data with empresa names
    const processedData = filteredOportunidades.map(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return {
        origem: origem?.nome || 'Desconhecido',
        destino: destino?.nome || 'Desconhecido',
        status: op.status,
      };
    });

    // Group by origen, destino and status
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

// Function to get balance data between group and partnerships
export const getBalancoGrupoParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: StatusOportunidade | null
) => {
  try {
    // Optimize the query
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

    // Apply empresa filter if needed
    let filteredOportunidades = oportunidades;
    if (empresaId) {
      filteredOportunidades = oportunidades.filter(op => 
        op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );
    }

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Count sent from group to partners and received by group from partners
    let enviadas = 0;
    let recebidas = 0;

    filteredOportunidades.forEach(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      if (origem && destino) {
        if (origem.tipo === 'intragrupo' && destino.tipo === 'parceiro') {
          enviadas++;
        } else if (origem.tipo === 'parceiro' && destino.tipo === 'intragrupo') {
          recebidas++;
        }
      }
    });

    return [
      { tipo: 'Enviadas', valor: enviadas },
      { tipo: 'Recebidas', valor: recebidas }
    ];
  } catch (error) {
    console.error('Error in getBalancoGrupoParcerias:', error);
    return [];
  }
};

// Function to get ranking of partners by sent indications
export const getRankingParceirosEnviadas = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  status: StatusOportunidade | null
) => {
  try {
    // Similar optimization approach
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

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Filter: origin = partner, destination = intragroup
    const filteredData = oportunidades?.filter(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return origem?.tipo === 'parceiro' && destino?.tipo === 'intragrupo';
    }).map(op => ({
      parceiro_id: op.empresa_origem_id,
      parceiro_nome: empresasMap.get(op.empresa_origem_id)?.nome
    }));

    // Group by partner
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
    // Same optimization pattern
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

    // Fetch all relevant empresas in one go
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

    // Create a map for quick lookup
    const empresasMap = new Map();
    empresas?.forEach(empresa => {
      empresasMap.set(empresa.id, empresa);
    });

    // Filter: origin = intragroup, destination = partner
    const filteredData = oportunidades?.filter(op => {
      const origem = empresasMap.get(op.empresa_origem_id);
      const destino = empresasMap.get(op.empresa_destino_id);
      
      return origem?.tipo === 'intragrupo' && destino?.tipo === 'parceiro';
    }).map(op => ({
      parceiro_id: op.empresa_destino_id,
      parceiro_nome: empresasMap.get(op.empresa_destino_id)?.nome
    }));

    // Group by partner
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

// Function to get status distribution
export const getStatusDistribution = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  try {
    // Optimize the query
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

    // Apply empresa filter if needed
    let filteredData = oportunidades;
    if (empresaId) {
      filteredData = oportunidades.filter(op => 
        op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
      );
    }

    // Group by status
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
