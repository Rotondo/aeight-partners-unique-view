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

export function useDashboardStats(oportunidadesFiltradas: Oportunidade[]): DashboardStats {
  return useMemo(() => {
    const total = oportunidadesFiltradas.length;
    const ganhas = oportunidadesFiltradas.filter(op => op.status === "ganho").length;
    const perdidas = oportunidadesFiltradas.filter(op => op.status === "perdido").length;
    // "Em andamento" agora conta todos que não sejam "ganho" nem "perdido"
    const emAndamento = oportunidadesFiltradas.filter(
      op => op.status !== "ganho" && op.status !== "perdido"
    ).length;
    const intra = oportunidadesFiltradas.filter(op => op.tipo_relacao === "intra").length;
    const extra = oportunidadesFiltradas.filter(op => op.tipo_relacao === "extra").length;
    const enviadas = oportunidadesFiltradas.filter(op => op.tipo_movimentacao === "enviada").length;
    const recebidas = oportunidadesFiltradas.filter(op => op.tipo_movimentacao === "recebida").length;
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
  }, [oportunidadesFiltradas]);
}
