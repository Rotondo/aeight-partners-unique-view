
import { useMemo } from "react";
import { Oportunidade } from "@/types";
import { useStatsCalculation } from "./useStatsCalculation";

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

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  const oportunidades = useMemo(() => 
    Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [], 
    [oportunidadesFiltradas]
  );

  const stats = useStatsCalculation(oportunidades);

  return useMemo(() => ({
    total: stats.total,
    intra: stats.intra,
    extra: stats.extra,
    enviadas: stats.enviadas,
    recebidas: stats.recebidas,
    saldo: stats.saldo,
  }), [stats]);
}

export default useDashboardStats;
