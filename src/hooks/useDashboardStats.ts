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

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  // Garante array válido
  const oportunidades: Oportunidade[] = Array.isArray(oportunidadesFiltradas)
    ? oportunidadesFiltradas
    : [];

  // Para depuração: remova após confirmar funcionamento
  if (typeof window !== "undefined") {
    console.log("DashboardStats oportunidades recebidas:", oportunidades);
  }

  return useMemo(() => {
    const total = oportunidades.length;

    // Filtros defensivos, aceitam status em minúsculo/maiúsculo
    const ganhas = oportunidades.filter(
      op => typeof op.status === "string" && op.status.toLowerCase() === "ganho"
    ).length;

    const perdidas = oportunidades.filter(
      op => typeof op.status === "string" && op.status.toLowerCase() === "perdido"
    ).length;

    // Todo o restante entra em andamento
    const emAndamento = total - ganhas - perdidas;

    const intra = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "intra"
    ).length;

    const extra = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "extra"
    ).length;

    const enviadas = oportunidades.filter(
      op => typeof op.tipo_movimentacao === "string" && op.tipo_movimentacao.toLowerCase() === "enviada"
    ).length;

    const recebidas = oportunidades.filter(
      op => typeof op.tipo_movimentacao === "string" && op.tipo_movimentacao.toLowerCase() === "recebida"
    ).length;

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
