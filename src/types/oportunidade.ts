
import { StatusOportunidade, TipoNatureza } from './common';
import { Empresa, Contato } from './empresa';
import { Usuario } from './usuario';

// Oportunidade types

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
  usuario_recebe_nome?: string;
  observacoes?: string;
  nome_lead: string;
  tipo_natureza?: TipoNatureza;
  tipo_movimentacao?: string;
  usuario_origem_id?: string;
  usuario_destino_id?: string;
  tipo_relacao?: "intra" | "extra";
  isRemetente?: boolean;
  isDestinatario?: boolean;
  empresa_origem?: Empresa;
  empresa_destino?: Empresa;
  contato?: Contato;
  usuario_envio?: Usuario;
  usuario_recebe?: Usuario;
  created_at?: string;
}

export interface HistoricoOportunidade {
  id: string;
  oportunidade_id: string;
  data_alteracao: string;
  campo_alterado: string;
  valor_antigo?: string;
  valor_novo?: string;
  usuario_id: string;
}

export interface OportunidadesFilterParams {
  dataInicio?: string;
  dataFim?: string;
  empresaOrigemId?: string;
  empresaDestinoId?: string;
  status?: StatusOportunidade;
  usuarioId?: string;
  searchTerm?: string;
  valorStatus?: "all" | "com_valor" | "sem_valor";
}
