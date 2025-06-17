
// Dashboard types

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

export interface DashboardStatsByStatus {
  em_contato: number;
  negociando: number;
  ganho: number;
  perdido: number;
  outros?: Record<string, number>;
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
