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

export type EmpresaTipoString = "intragrupo" | "parceiro" | "cliente";

export interface Empresa {
  id: string;
  nome: string;
  tipo: EmpresaTipoString;
  descricao?: string;
  status: boolean;
  created_at?: string;
}

// EmpresaCategoria (CompanyCategory)
export interface EmpresaCategoria {
  empresa_id: string;
  categoria_id: string;
}

// Contato (Contact)
export interface Contato {
  id?: string;
  empresa_id?: string;
  nome?: string;
  telefone?: string;
  email?: string;
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

// RepositorioMaterial (Partner Repository Material)
export interface RepositorioMaterial {
  id: string;
  empresa_id: string;
  categoria_id: string;
  nome: string;
  tipo_arquivo: string;
  tag_categoria: string[]; // Changed from string to string[]
  url_arquivo?: string;
  arquivo_upload?: string;
  validade_contrato?: string;
  data_upload: string;
  usuario_upload: string;
}

// RepositorioTag (Partner Repository Tag)
export interface RepositorioTag {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
}

// Oportunidade (Opportunity)
export type StatusOportunidade = 
  | "em_contato" 
  | "negociando" 
  | "ganho" 
  | "perdido" 
  | "Contato" 
  | "Apresentado" 
  | "Sem contato";

// Natureza da oportunidade (intra/extragrupo)
export type TipoNatureza = "intragrupo" | "extragrupo";

export interface Oportunidade {
  id: string;
  empresa_origem_id: string;
  empresa_destino_id: string;
  contato_id?: string;
  valor?: number;
  status: StatusOportunidade;
  data_indicacao: string;
  data_fechamento?: string;
  motivo_perda?: string;
  usuario_envio_id?: string;
  usuario_recebe_id?: string;
  usuario_recebe_nome?: string; // Executivo responsável
  observacoes?: string;
  nome_lead: string;
  tipo_natureza?: TipoNatureza; // "intragrupo" ou "extragrupo"
  // Propriedades calculadas para uso em dashboards
  tipo_relacao?: "intra" | "extra";
  isRemetente?: boolean;
  isDestinatario?: boolean;
  // Relações para UI
  empresa_origem?: Empresa;
  empresa_destino?: Empresa;
  contato?: Contato;
  usuario_envio?: Usuario;
  usuario_recebe?: Usuario;
  created_at?: string;
}

// IndicadoresParceiro (PartnerIndicators)
export type TamanhoEmpresa = "PP" | "P" | "M" | "G" | "GG";

export interface IndicadoresParceiro {
  id?: string;
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
  // Novos campos estruturados
  nome?: string;
  url?: string;
  icp?: string;
  oferta?: string;
  diferenciais?: string;
  cases_sucesso?: string;
  big_numbers?: string;
  ponto_forte?: string;
  ponto_fraco?: string;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  nota_quadrante?: number;
}

// OnePagerCliente - nova interface para relacionamento
export interface OnePagerCliente {
  id: string;
  onepager_id: string;
  cliente_id: string;
  created_at: string;
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

// ====== WISHLIST TYPES ======

// EmpresaCliente - Relacionamento empresa proprietária ↔ empresa cliente
export interface EmpresaCliente {
  id: string;
  empresa_proprietaria_id: string;
  empresa_cliente_id: string;
  data_relacionamento: string;
  status: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  empresa_proprietaria?: Empresa;
  empresa_cliente?: Empresa;
}

// WishlistItem - Itens de interesse/desejo entre empresas
export type WishlistStatus = "pendente" | "em_andamento" | "aprovado" | "rejeitado" | "convertido";

export interface WishlistItem {
  id: string;
  empresa_interessada_id: string;
  empresa_desejada_id: string;
  empresa_proprietaria_id: string;
  motivo?: string;
  prioridade: number; // 1 a 5
  status: WishlistStatus;
  data_solicitacao: string;
  data_resposta?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  empresa_interessada?: Empresa;
  empresa_desejada?: Empresa;
  empresa_proprietaria?: Empresa;
  apresentacoes?: WishlistApresentacao[];
}

// WishlistApresentacao - Histórico de apresentações facilitadas
export type TipoApresentacao = "email" | "reuniao" | "evento" | "digital" | "outro";
export type StatusApresentacao = "agendada" | "realizada" | "cancelada";

export interface WishlistApresentacao {
  id: string;
  wishlist_item_id: string;
  empresa_facilitadora_id: string;
  data_apresentacao: string;
  tipo_apresentacao: TipoApresentacao;
  status_apresentacao: StatusApresentacao;
  feedback?: string;
  converteu_oportunidade: boolean;
  oportunidade_id?: string;
  created_at: string;
  updated_at: string;
  // Relações para UI
  wishlist_item?: WishlistItem;
  empresa_facilitadora?: Empresa;
  oportunidade?: Oportunidade;
}

// ====== END WISHLIST TYPES ======

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
  nome: string;
  x: number;
  y: number;
  tamanho: TamanhoEmpresa;
  engajamento: number;
  color: string;
  empresaId: string;
}

// Filter types
export interface OportunidadesFilterParams {
  dataInicio?: string;
  dataFim?: string;
  empresaOrigemId?: string;
  empresaDestinoId?: string;
  status?: StatusOportunidade;
  usuarioId?: string;
  searchTerm?: string; // Adicionar campo de busca por texto
}

// Dashboard Types
export interface MatrizData {
  origem: string;
  destino: string;
  total: number;
}

export interface QualidadeData {
  origem: string;
  destino: string;
  status: string;
  total: number;
}

export interface BalancoData {
  tipo: string;
  valor: number;
}

export interface RankingData {
  parceiro: string;
  indicacoes: number;
}

export interface StatusData {
  status: string;
  total: number;
}

// Wishlist Dashboard Types
export interface WishlistStats {
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  apresentacoesRealizadas: number;
  conversaoOportunidades: number;
  empresasMaisDesejadas: { nome: string; total: number }[];
  facilitacoesPorParceiro: { parceiro: string; total: number }[];
}
