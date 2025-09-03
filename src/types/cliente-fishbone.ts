import { Empresa } from './empresa';
import { EtapaJornada, SubnivelEtapa } from './mapa-parceiros';

// Interface for cliente-etapa-fornecedores table
export interface ClienteEtapaFornecedor {
  id: string;
  cliente_id: string;
  etapa_id: string;
  subnivel_id?: string | null;
  empresa_fornecedora_id: string;
  observacoes?: string | null;
  ativo: boolean;
  data_mapeamento: string;
  created_at: string;
  updated_at: string;
}

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

// Interface for client options in selectors
export interface ClienteOption {
  id: string;
  nome: string;
  tipo?: string;
  descricao?: string;
  logo_url?: string;
  status?: boolean;
  empresa_proprietaria?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// Interface for fishbone zoom level control
export interface FishboneZoomLevel {
  level: 'overview' | 'medium' | 'detailed';
  showSubniveis: boolean;
  showAllFornecedores: boolean;
}

// Interface for the fishbone data structure
export interface ClienteFishboneView {
  cliente: {
    id: string;
    nome: string;
    descricao?: string;
    logo_url?: string;
  };
  etapas: {
    id: string;
    nome: string;
    descricao?: string;
    cor?: string;
    gaps: number;
    fornecedores: {
      id: string;
      nome: string;
      descricao?: string;
      is_parceiro: boolean;
      performance_score?: number;
      logo_url?: string;
    }[];
    subniveis: {
      id: string;
      nome: string;
      descricao?: string;
      fornecedores: {
        id: string;
        nome: string;
        is_parceiro: boolean;
        performance_score?: number;
        logo_url?: string;
      }[];
    }[];
  }[];
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