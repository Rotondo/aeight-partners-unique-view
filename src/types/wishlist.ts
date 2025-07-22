import { WishlistStatus, TipoApresentacao, StatusApresentacao, PipelineFase } from './common';
import { Empresa } from './empresa';
import { Oportunidade } from './oportunidade';

// Wishlist types

export interface EmpresaCliente {
  id: string;
  empresa_proprietaria_id: string;
  empresa_cliente_id: string;
  data_relacionamento: string;
  status: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  empresa_proprietaria?: Empresa;
  empresa_cliente?: Empresa;
}

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
  created_at: string;
  updated_at: string;
  empresa_interessada?: Empresa;
  empresa_desejada?: Empresa;
  empresa_proprietaria?: Empresa;
  apresentacoes?: WishlistApresentacao[];
}

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
  executivo_responsavel_id?: string;
  data_planejada?: string;
  fase_pipeline: PipelineFase;
  created_at: string;
  updated_at: string;
  wishlist_item?: WishlistItem;
  empresa_facilitadora?: Empresa;
  oportunidade?: Oportunidade;
  executivo_responsavel?: { id: string; nome: string };
}

export interface WishlistStats {
  totalSolicitacoes: number;
  solicitacoesPendentes: number;
  solicitacoesAprovadas: number;
  apresentacoesRealizadas: number;
  conversaoOportunidades: number;
  empresasMaisDesejadas: { nome: string; total: number }[];
  facilitacoesPorParceiro: { parceiro: string; total: number }[];
}
