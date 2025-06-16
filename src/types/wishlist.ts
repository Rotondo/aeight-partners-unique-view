// Tipos globais do módulo Wishlist & Networking

export type WishlistStatus =
  | "pendente"
  | "em_andamento"
  | "aprovado"
  | "rejeitado"
  | "convertido";

export type TipoApresentacao =
  | "email"
  | "reuniao"
  | "evento"
  | "digital"
  | "outro";

export type StatusApresentacao = "agendada" | "realizada" | "cancelada";

// Relacionamento entre parceiro (proprietário) e cliente
export interface EmpresaCliente {
  id: string;
  empresa_proprietaria_id: string;
  empresa_cliente_id: string;
  data_relacionamento: string;
  status: boolean;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  empresa_proprietaria?: {
    id: string;
    nome: string;
    tipo: string;
  };
  empresa_cliente?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// Solicitação de wishlist
export interface WishlistItem {
  id: string;
  empresa_interessada_id: string;
  empresa_desejada_id: string;
  empresa_proprietaria_id: string;
  motivo?: string;
  prioridade: number;
  status: WishlistStatus;
  data_solicitacao: string;
  data_resposta?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  empresa_interessada?: {
    id: string;
    nome: string;
    tipo: string;
  };
  empresa_desejada?: {
    id: string;
    nome: string;
    tipo: string;
  };
  empresa_proprietaria?: {
    id: string;
    nome: string;
    tipo: string;
  };
}

// Apresentação/facilitação de wishlist
export interface WishlistApresentacao {
  id: string;
  wishlist_item_id: string;
  empresa_facilitadora_id: string;
  data_apresentacao: string;
  tipo_apresentacao: TipoApresentacao;
  status_apresentacao: StatusApresentacao;
  feedback?: string;
  converteu_oportunidade?: boolean;
  oportunidade_id?: string;
  created_at?: string;
  updated_at?: string;
  empresa_facilitadora?: {
    id: string;
    nome: string;
    tipo: string;
  };
  wishlist_item?: WishlistItem;
}

// Estatísticas para o dashboard de wishlist
export interface WishlistStats {
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  apresentacoesRealizadas: number;
  conversaoOportunidades: number;
  empresasMaisDesejadas: Array<{ nome: string; count: number }>;
  facilitacoesPorParceiro: Array<{ nome: string; count: number }>;
  evolucao?: {
    totalSolicitacoes?: number | null;
    apresentacoesRealizadas?: number | null;
    conversaoOportunidades?: number | null;
  };
}
