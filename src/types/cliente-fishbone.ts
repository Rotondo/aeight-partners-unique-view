import { EtapaJornada, SubnivelEtapa } from './mapa-parceiros';
import { Empresa } from './empresa';

export interface ClienteEtapaFornecedor {
  id: string;
  cliente_id: string;
  etapa_id: string;
  subnivel_id?: string;
  empresa_fornecedora_id: string;
  data_mapeamento: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Relacionamentos populados
  cliente?: Empresa;
  etapa?: EtapaJornada;
  subnivel?: SubnivelEtapa;
  empresa_fornecedora?: EmpresaFornecedora;
}

export interface EmpresaFornecedora extends Empresa {
  is_parceiro: boolean; // Computed field baseado no tipo
  performance_score?: number;
  logo_url?: string;
}

export interface ClienteFishboneView {
  cliente: Empresa;
  etapas: EtapaClienteMapping[];
}

export interface EtapaClienteMapping extends EtapaJornada {
  fornecedores: EmpresaFornecedora[];
  subniveis: SubnivelClienteMapping[];
  gaps: number; // Número de subníveis sem fornecedores
}

export interface SubnivelClienteMapping extends SubnivelEtapa {
  fornecedores: EmpresaFornecedora[];
}

export interface FishboneZoomLevel {
  level: 'overview' | 'medium' | 'detailed';
  showSubniveis: boolean;
  showAllFornecedores: boolean;
}

export interface ClienteFishboneFilters {
  clienteIds: string[];
  zoomLevel: FishboneZoomLevel;
  showOnlyParceiros: boolean;
  showOnlyGaps: boolean;
  etapaId?: string;
}

export interface FishboneStats {
  totalClientes: number;
  totalEtapas: number;
  coberturaPorcentual: number;
  parceirosVsFornecedores: {
    parceiros: number;
    fornecedores: number;
  };
  gapsPorEtapa: Record<string, number>;
}