import { useMemo } from "react";
import { Oportunidade } from "@/types";

// Hook para calcular KPIs a partir das oportunidades já filtradas
export function useDashboardStats(oportunidadesFiltradas: Oportunidade[]) {
  return useMemo(() => {
    const total = oportunidadesFiltradas.length;
    const ganhas = oportunidadesFiltradas.filter(op => op.status === "ganho").length;
    const perdidas = oportunidadesFiltradas.filter(op => op.status === "perdido").length;
    const andamento = oportunidadesFiltradas.filter(op => op.status !== "ganho" && op.status !== "perdido").length;
    const intra = oportunidadesFiltradas.filter(op => op.tipo_relacao === "intra").length;
    const extra = oportunidadesFiltradas.filter(op => op.tipo_relacao === "extra").length;
    const enviadas = oportunidadesFiltradas.filter(
      op =>
        op.tipo_relacao === "extra" &&
        op.empresa_origem?.tipo === "intragrupo" &&
        op.empresa_destino?.tipo === "parceiro"
    ).length;
    const recebidas = oportunidadesFiltradas.filter(
      op =>
        op.tipo_relacao === "extra" &&
        op.empresa_origem?.tipo === "parceiro" &&
        op.empresa_destino?.tipo === "intragrupo"
    ).length;
    const saldo = enviadas - recebidas;

    return {
      total,
      ganhas,
      perdidas,
      andamento,
      intra,
      extra,
      enviadas,
      recebidas,
      saldo,
    };
  }, [oportunidadesFiltradas]);
}
