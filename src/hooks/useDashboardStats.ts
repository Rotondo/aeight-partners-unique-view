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
  // Garante array válido
  const oportunidades: Oportunidade[] = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];

  return useMemo(() => {
    const total = oportunidades.length;

    // Filtros robustos, aceitam status em minúsculo/maiúsculo e nulos
    const ganhas = oportunidades.filter(op =>
      typeof op.status === "string" && op.status.toLowerCase() === "ganho"
    ).length;

    const perdidas = oportunidades.filter(op =>
      typeof op.status === "string" && op.status.toLowerCase() === "perdido"
    ).length;

    // Todo o restante entra em andamento
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
