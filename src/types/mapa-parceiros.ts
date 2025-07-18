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
  empresa_id: string;
  status: 'ativo' | 'inativo' | 'pendente';
  performance_score: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  associacoes?: AssociacaoParceiroEtapa[];
  empresa?: {
    id: string;
    nome: string;
    descricao?: string;
    tipo: string;
    logo_url?: string;
  };
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
  busca?: string;
  status?: string;
  etapaId?: string;
  subnivelId?: string;
  apenasSemEtapa?: boolean;
  apenasGaps?: boolean;
}

export interface MapaParceirosStats {
  totalParceiros: number;
  parceirosPorEtapa: Record<string, number>;
  parceirosPorSubnivel: Record<string, number>; // Adicionado para correção do erro
  parceirosAtivos: number;
  parceirosInativos: number;
  performanceMedia: number;
}
