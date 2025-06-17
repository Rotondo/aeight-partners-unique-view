
import { supabase } from '../supabase';
import { StatusOportunidade } from '@/types';
import { formatDateOrNull, createEmpresaMap, filterByEmpresa } from './helpers';

// Function to get balance data between group and partnerships
export const getBalancoGrupoParcerias = async (
  dataInicio: Date | null,
  dataFim: Date | null,
  empresaId: string | null,
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
