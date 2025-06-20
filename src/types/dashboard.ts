
// Dashboard types

export interface DashboardStatsByStatus {
  em_contato: number;
  negociando: number;
  proposta_enviada: number;
  aguardando_aprovacao: number;
  ganho: number;
  perdido: number;
  total: number;
}

export interface DashboardStats {
  total: DashboardStatsByStatus;
  intra: DashboardStatsByStatus;
  extra: DashboardStatsByStatus;
  enviadas: number;
  recebidas: number;
  saldo: number;
}

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
