
import { supabase } from './supabase';
import { format } from 'date-fns';

// Function to get matriz intragrupo data
export const getMatrizIntragrupo = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq(status ? 'status' : 'id', status || 'id')
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'intragrupo')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'intragrupo');

  if (error) throw error;
  
  if (empresaId) {
    data = data.filter(item => 
      item.empresa_origem.id === empresaId || 
      item.empresa_destino.id === empresaId
    );
  }
  
  // Group by origem and destino
  const grouped = data.reduce((acc: any, curr) => {
    const key = `${curr.empresa_origem.nome}-${curr.empresa_destino.nome}`;
    if (!acc[key]) {
      acc[key] = {
        origem: curr.empresa_origem.nome,
        destino: curr.empresa_destino.nome,
        total: 0
      };
    }
    acc[key].total++;
    return acc;
  }, {});
  
  return Object.values(grouped);
};

// Function to get matriz parcerias data
export const getMatrizParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq(status ? 'status' : 'id', status || 'id');

  if (error) throw error;
  
  // Filter for at least one side being a partner
  let filteredData = data.filter(item => 
    item.empresa_origem.tipo === 'parceiro' || 
    item.empresa_destino.tipo === 'parceiro'
  );
  
  if (empresaId) {
    filteredData = filteredData.filter(item => 
      item.empresa_origem.id === empresaId || 
      item.empresa_destino.id === empresaId
    );
  }
  
  // Group by origem and destino
  const grouped = filteredData.reduce((acc: any, curr) => {
    const key = `${curr.empresa_origem.nome}-${curr.empresa_destino.nome}`;
    if (!acc[key]) {
      acc[key] = {
        origem: curr.empresa_origem.nome,
        destino: curr.empresa_destino.nome,
        total: 0
      };
    }
    acc[key].total++;
    return acc;
  }, {});
  
  return Object.values(grouped);
};

// Function to get quality of indications data
export const getQualidadeIndicacoes = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      status
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (error) throw error;
  
  if (empresaId) {
    data = data.filter(item => 
      item.empresa_origem.id === empresaId || 
      item.empresa_destino.id === empresaId
    );
  }
  
  // Group by origem, destino and status
  const grouped = data.reduce((acc: any, curr) => {
    const key = `${curr.empresa_origem.nome}-${curr.empresa_destino.nome}-${curr.status}`;
    if (!acc[key]) {
      acc[key] = {
        origem: curr.empresa_origem.nome,
        destino: curr.empresa_destino.nome,
        status: curr.status,
        total: 0
      };
    }
    acc[key].total++;
    return acc;
  }, {});
  
  return Object.values(grouped);
};

// Function to get balance data between group and partnerships
export const getBalancoGrupoParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq(status ? 'status' : 'id', status || 'id');

  if (error) throw error;
  
  if (empresaId) {
    data = data.filter(item => 
      item.empresa_origem.id === empresaId || 
      item.empresa_destino.id === empresaId
    );
  }

  // Count sent from group to partners
  const enviadas = data.filter(item => 
    item.empresa_origem.tipo === 'intragrupo' && 
    item.empresa_destino.tipo === 'parceiro'
  ).length;

  // Count received by group from partners
  const recebidas = data.filter(item => 
    item.empresa_origem.tipo === 'parceiro' && 
    item.empresa_destino.tipo === 'intragrupo'
  ).length;
  
  return [
    { tipo: 'Enviadas', valor: enviadas },
    { tipo: 'Recebidas', valor: recebidas }
  ];
};

// Function to get ranking of partners by sent indications
export const getRankingParceirosEnviadas = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  status: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq(status ? 'status' : 'id', status || 'id')
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'parceiro')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'intragrupo');

  if (error) throw error;
  
  // Group by partner
  const grouped = data.reduce((acc: any, curr) => {
    const key = curr.empresa_origem.nome;
    if (!acc[key]) {
      acc[key] = {
        parceiro: key,
        indicacoes: 0
      };
    }
    acc[key].indicacoes++;
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a: any, b: any) => b.indicacoes - a.indicacoes);
};

// Function to get ranking of partners by received indications
export const getRankingParceirosRecebidas = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  status: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq(status ? 'status' : 'id', status || 'id')
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'intragrupo')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'parceiro');

  if (error) throw error;
  
  // Group by partner
  const grouped = data.reduce((acc: any, curr) => {
    const key = curr.empresa_destino.nome;
    if (!acc[key]) {
      acc[key] = {
        parceiro: key,
        indicacoes: 0
      };
    }
    acc[key].indicacoes++;
    return acc;
  }, {});
  
  return Object.values(grouped).sort((a: any, b: any) => b.indicacoes - a.indicacoes);
};

// Function to get status distribution
export const getStatusDistribution = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null
) => {
  const { data, error } = await supabase
    .from('oportunidades')
    .select(`
      status,
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (error) throw error;
  
  if (empresaId) {
    const { data: filteredData, error: filteredError } = await supabase
      .from('oportunidades')
      .select('*')
      .or(`empresa_origem_id.eq.${empresaId},empresa_destino_id.eq.${empresaId}`);
      
    if (filteredError) throw filteredError;
    data = filteredData;
  }
  
  // Group by status
  const grouped = data.reduce((acc: any, curr) => {
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
};
