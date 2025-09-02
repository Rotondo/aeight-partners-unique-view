import { Empresa } from './empresa';
import { EtapaJornada, SubnivelEtapa } from './mapa-parceiros';

// Representa um fornecedor que foi mapeado para um cliente numa etapa específica.
export interface MapeamentoFornecedor {
  id: string;
  cliente_id: string;
  etapa_id: string;
  subnivel_id?: string | null;
  empresa_fornecedora_id: string;
  observacoes?: string | null;
  ativo: boolean;
  // Incluímos os dados completos da empresa fornecedora para ter acesso ao nome e tipo.
  empresa_fornecedora: Empresa;
}

// Estrutura que o nosso código vai usar para agrupar os fornecedores
// debaixo de cada etapa e subnível, pronta para ser desenhada no diagrama.
export interface MapeamentoAgrupado {
  etapa: EtapaJornada;
  subniveis: {
    subnivel: SubnivelEtapa;
    fornecedores: MapeamentoFornecedor[];
  }[];
  fornecedoresSemSubnivel: MapeamentoFornecedor[];
}

// Zoom level for fishbone diagram
export interface FishboneZoomLevel {
  level: 'overview' | 'medium' | 'detailed';
  label: string;
  description: string;
  showAllFornecedores: boolean;
  showSubniveis: boolean;
}

// Client fishbone view data
export interface ClienteFishboneView {
  cliente: Empresa;
  etapas: Array<{
    id: string;
    nome: string;
    descricao?: string;
    gaps: number;
    cor?: string;
    fornecedores: Array<{
      id: string;
      nome: string;
      tipo: string;
      descricao?: string;
      is_parceiro: boolean;
      performance_score?: number;
      logo_url?: string;
    }>;
    subniveis: Array<{
      id: string;
      nome: string;
      descricao?: string;
      fornecedores: Array<{
        id: string;
        nome: string;
        tipo: string;
        descricao?: string;
        is_parceiro: boolean;
        performance_score?: number;
        logo_url?: string;
      }>;
    }>;
  }>;
  mapeamentos: MapeamentoAgrupado[];
}

// Client etapa fornecedor relationship
export interface ClienteEtapaFornecedor {
  id: string;
  cliente_id: string;
  etapa_id: string;
  subnivel_id?: string | null;
  empresa_fornecedora_id: string;
  observacoes?: string | null;
  ativo: boolean;
}

// Empresa fornecedora
export interface EmpresaFornecedora {
  id: string;
  nome: string;
  tipo: string;
}

// Fishbone statistics
export interface FishboneStats {
  totalClientes: number;
  totalEtapas: number;
  totalFornecedores: number;
  gaps: number;
}

// Fishbone filters
export interface ClienteFishboneFilters {
  clientes: string[];
  etapas: string[];
  tipos: string[];
}