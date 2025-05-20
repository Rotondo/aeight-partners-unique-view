// Common types

// Categoria (Category)
export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
}

// Empresa (Company)
export enum TipoEmpresa {
  INTRAGRUPO = "intragrupo",
  PARCEIRO = "parceiro",
  CLIENTE = "cliente"
}

export interface Empresa {
  id: string;
  nome: string;
  tipo: TipoEmpresa;
  descricao?: string;
  status: boolean;
}

// EmpresaCategoria (CompanyCategory)
export interface EmpresaCategoria {
  empresa_id: string;
  categoria_id: string;
}

// Contato (Contact)
export interface Contato {
  id: string;
  empresa_id: string;
  nome: string;
  telefone: string;
  email: string;
}

// Usuario (User)
export interface Usuario {
  id: string;
  nome: string;
  empresa_id: string;
  papel: "admin" | "user" | "manager";
  email: string;
  ativo: boolean;
}

// Oportunidade (Opportunity)
export type StatusOportunidade = "em_contato" | "negociando" | "ganho" | "perdido";

export interface Oportunidade {
  id: string;
  empresa_origem_id: string;
  empresa_destino_id: string;
  contato_id: string;
  valor?: number;
  status: StatusOportunidade;
  data_indicacao: string;
  data_fechamento?: string;
  motivo_perda?: string;
  usuario_envio_id: string;
  usuario_recebe_id?: string;
  observacoes?: string;
}

// IndicadoresParceiro (PartnerIndicators)
export type TamanhoEmpresa = "PP" | "P" | "M" | "G" | "GG";

export interface IndicadoresParceiro {
  id: string;
  empresa_id: string;
  potencial_leads: number;
  base_clientes?: number;
  engajamento: number;
  alinhamento: number;
  potencial_investimento: number;
  tamanho: TamanhoEmpresa;
  score_x?: number;
  score_y?: number;
  data_avaliacao: string;
}

// OnePager
export interface OnePager {
  id: string;
  empresa_id: string;
  categoria_id: string;
  url_imagem?: string;
  arquivo_upload?: string;
  data_upload: string;
}

// ShareIcp
export interface ShareIcp {
  id: string;
  empresa_id: string;
  share_of_wallet?: number;
  icp_alinhado?: boolean;
  observacoes?: string;
}

// HistoricoOportunidade (OpportunityHistory)
export interface HistoricoOportunidade {
  id: string;
  oportunidade_id: string;
  data_alteracao: string;
  campo_alterado: string;
  valor_antigo?: string;
  valor_novo?: string;
  usuario_id: string;
}

// Context types
export interface AuthContextType {
  user: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalOportunidades: number;
  oportunidadesGanhas: number;
  oportunidadesPerdidas: number;
  oportunidadesEmAndamento: number;
  oportunidadesPorMes: {
    mes: string;
    quantidade: number;
  }[];
}

// Quadrant types
export interface QuadrantPoint {
  id: string;
  empresaId: string;
  nome: string;
  x: number;
  y: number;
  tamanho: TamanhoEmpresa;
  engajamento: number;
  color: string;
}

// Filter types
export interface OportunidadesFilterParams {
  dataInicio?: string;
  dataFim?: string;
  empresaOrigemId?: string;
  empresaDestinoId?: string;
  status?: StatusOportunidade;
  usuarioId?: string;
}
