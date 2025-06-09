import { useMemo } from "react";
import { Oportunidade } from "@/types";

export interface DashboardStats {
  total: number;
  ganhas: number;
  perdidas: number;
  emAndamento: number;
  intra: number;
  extra: number;
  enviadas: number;
  recebidas: number;
  saldo: number;
}

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[]): DashboardStats {
  // Garante que oportunidadesFiltradas seja sempre um array
  const oportunidades: Oportunidade[] = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];

  return useMemo(() => {
    const total = oportunidades.length;
    const ganhas = oportunidades.filter(op => op.status === "ganho").length;
    const perdidas = oportunidades.filter(op => op.status === "perdido").length;
    // "Em andamento" = todo o restante
    const emAndamento = total - ganhas - perdidas;
    const intra = oportunidades.filter(op => op.tipo_relacao === "intra").length;
    const extra = oportunidades.filter(op => op.tipo_relacao === "extra").length;
    const enviadas = oportunidades.filter(op => op.tipo_movimentacao === "enviada").length;
    const recebidas = oportunidades.filter(op => op.tipo_movimentacao === "recebida").length;
    const saldo = enviadas - recebidas;

    return {
      total,
      ganhas,
      perdidas,
      emAndamento,
      intra,
      extra,
      enviadas,
      recebidas,
      saldo,
    };
  }, [oportunidades]);
}
