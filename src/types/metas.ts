
// Tipos para o sistema de metas
export interface Meta {
  id: string;
  nome: string;
  descricao?: string;
  tipo_meta: 'quantidade' | 'valor';
  valor_meta: number;
  periodo: 'mensal' | 'trimestral';
  ano: number;
  mes?: number;
  trimestre?: number;
  segmento_grupo: 'intragrupo' | 'de_fora_para_dentro' | 'tudo';
  empresa_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  usuario_criador_id: string;
}

export interface MetaProgress {
  meta: Meta;
  realizado: number;
  percentual: number;
  status: 'abaixo' | 'dentro' | 'acima';
}

export interface ResultadosPorGrupo {
  segmento: string;
  quantidade_total: number;
  quantidade_ganho: number;
  quantidade_perdido: number;
  quantidade_andamento: number;
  valor_total: number;
  valor_ganho: number;
  valor_perdido: number;
  valor_andamento: number;
  taxa_conversao: number;
  ticket_medio: number;
}

export interface ResultadosPorEmpresa {
  empresa_id: string;
  empresa_nome: string;
  empresa_tipo: string;
  quantidade_total: number;
  valor_total: number;
  taxa_conversao: number;
  ticket_medio: number;
}
