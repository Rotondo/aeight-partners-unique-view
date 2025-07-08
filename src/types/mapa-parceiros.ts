export interface EtapaJornada {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  cor: string;
  icone?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  subniveis?: SubnivelEtapa[];
  parceiros?: ParceiroMapa[];
}

export interface SubnivelEtapa {
  id: string;
  etapa_id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  parceiros?: ParceiroMapa[];
}

export interface ParceiroMapa {
  id: string;
  empresa_id?: string;
  nome: string;
  descricao?: string;
  website?: string;
  contato_email?: string;
  contato_telefone?: string;
  logo_url?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  performance_score: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  associacoes?: AssociacaoParceiroEtapa[];
}

export interface AssociacaoParceiroEtapa {
  id: string;
  parceiro_id: string;
  etapa_id: string;
  subnivel_id?: string;
  data_associacao: string;
  ativo: boolean;
  created_at: string;
  parceiro?: ParceiroMapa;
  etapa?: EtapaJornada;
  subnivel?: SubnivelEtapa;
}

export interface MapaParceirosFiltros {
  etapa?: string;
  status?: string;
  busca?: string;
}

export interface MapaParceirosStats {
  totalParceiros: number;
  parceirosPorEtapa: Record<string, number>;
  parceirosAtivos: number;
  parceirosInativos: number;
  performanceMedia: number;
}