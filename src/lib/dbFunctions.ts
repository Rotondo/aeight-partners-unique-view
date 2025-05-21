import { supabase } from './supabase';
import { format } from 'date-fns';

// Function to get matriz intragrupo data
export const getMatrizIntragrupo = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  let query = supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'intragrupo')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'intragrupo');

  if (status) {
    query = query.eq('status', status);
  }

  const { data: initialData, error } = await query;

  if (error) throw error;

  // Filter by empresaId if provided
  let filteredData = initialData;
  if (empresaId && filteredData) {
    filteredData = filteredData.filter(item =>
      item.empresa_origem.id === empresaId ||
      item.empresa_destino.id === empresaId
    );
  }

  // Group by origem and destino
  const grouped = filteredData?.reduce((acc: any, curr) => {
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
  }, {}) || {};

  return Object.values(grouped);
};

// Function to get matriz parcerias data
export const getMatrizParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  let query = supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: initialData, error } = await query;

  if (error) throw error;

  // Filter for at least one side being a partner
  let filteredData = initialData?.filter(item =>
    item.empresa_origem.tipo === 'parceiro' ||
    item.empresa_destino.tipo === 'parceiro'
  ) || [];

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
  const { data: initialData, error } = await supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      status
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (error) throw error;

  // Filter by empresaId if provided
  let filteredData = initialData;
  if (empresaId && filteredData) {
    filteredData = filteredData.filter(item =>
      item.empresa_origem.id === empresaId ||
      item.empresa_destino.id === empresaId
    );
  }

  // Group by origem, destino and status
  const grouped = filteredData?.reduce((acc: any, curr) => {
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
  }, {}) || {};

  return Object.values(grouped);
};

// Function to get balance data between group and partnerships
export const getBalancoGrupoParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
  status: string | null
) => {
  let query = supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: initialData, error } = await query;

  if (error) throw error;

  // Filter by empresaId if provided
  let filteredData = initialData;
  if (empresaId && filteredData) {
    filteredData = filteredData.filter(item =>
      item.empresa_origem.id === empresaId ||
      item.empresa_destino.id === empresaId
    );
  }

  // Count sent from group to partners
  const enviadas = filteredData?.filter(item =>
    item.empresa_origem.tipo === 'intragrupo' &&
    item.empresa_destino.tipo === 'parceiro'
  ).length || 0;

  // Count received by group from partners
  const recebidas = filteredData?.filter(item =>
    item.empresa_origem.tipo === 'parceiro' &&
    item.empresa_destino.tipo === 'intragrupo'
  ).length || 0;

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
  let query = supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'parceiro')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'intragrupo');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by partner
  const grouped = (data || []).reduce((acc: any, curr) => {
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
  let query = supabase
    .from('oportunidades')
    .select(`
      empresa_origem:empresas!oportunidades_empresa_origem_id_fkey(id, nome, tipo),
      empresa_destino:empresas!oportunidades_empresa_destino_id_fkey(id, nome, tipo),
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null)
    .eq('empresas!oportunidades_empresa_origem_id_fkey.tipo', 'intragrupo')
    .eq('empresas!oportunidades_empresa_destino_id_fkey.tipo', 'parceiro');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by partner
  const grouped = (data || []).reduce((acc: any, curr) => {
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
  const { data: initialData, error } = await supabase
    .from('oportunidades')
    .select(`
      status,
      id
    `)
    .gte('data_indicacao', dataInicio ? format(dataInicio, 'yyyy-MM-dd') : null)
    .lte('data_indicacao', dataFim ? format(dataFim, 'yyyy-MM-dd') : null);

  if (error) throw error;

  let filteredData = initialData;
  if (empresaId) {
    const { data: empresaFilteredData, error: filteredError } = await supabase
      .from('oportunidades')
      .select('*')
      .or(`empresa_origem_id.eq.${empresaId},empresa_destino_id.eq.${empresaId}`);

    if (filteredError) throw filteredError;
    filteredData = empresaFilteredData;
  }

  // Group by status
  const grouped = (filteredData || []).reduce((acc: any, curr) => {
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
