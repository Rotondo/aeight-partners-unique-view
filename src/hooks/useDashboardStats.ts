import { useMemo } from "react";
import { Oportunidade } from "@/types";

export interface DashboardStats {
  total: number;
  ganhas: number;
  perdidas: number;
  emAndamento: number;
  intra: {
    total: number;
    ganhas: number;
    perdidas: number;
    emAndamento: number;
  };
  extra: {
    total: number;
    ganhas: number;
    perdidas: number;
    emAndamento: number;
  };
  enviadas: number;
  recebidas: number;
  saldo: number;
}

function statusLower(s: any): string {
  return (typeof s === "string" ? s : "").trim().toLowerCase();
}

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  const oportunidades: Oportunidade[] = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];

  // LOG: Array recebido
  if (typeof window !== "undefined") {
    console.log("[useDashboardStats] Oportunidades recebidas:", oportunidades);
  }

  return useMemo(() => {
    const total = oportunidades.length;

    // Totais globais por status
    const ganhas = oportunidades.filter(op => statusLower(op.status) === "ganho").length;
    const perdidas = oportunidades.filter(op => statusLower(op.status) === "perdido").length;
    const emAndamento = oportunidades.filter(op => {
      const status = statusLower(op.status);
      return status !== "ganho" && status !== "perdido";
    }).length;

    // INTRA
    const oportunidadesIntra = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "intra"
    );
    let intraGanhas = 0, intraPerdidas = 0, intraEmAndamento = 0;
    oportunidadesIntra.forEach(op => {
      const status = statusLower(op.status);
      if (status === "ganho") intraGanhas++;
      else if (status === "perdido") intraPerdidas++;
      else intraEmAndamento++;
    });
    const intra = {
      total: oportunidadesIntra.length,
      ganhas: intraGanhas,
      perdidas: intraPerdidas,
      emAndamento: intraEmAndamento,
    };

    // EXTRA
    const oportunidadesExtra = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "extra"
    );
    let extraGanhas = 0, extraPerdidas = 0, extraEmAndamento = 0;
    oportunidadesExtra.forEach(op => {
      const status = statusLower(op.status);
      if (status === "ganho") extraGanhas++;
      else if (status === "perdido") extraPerdidas++;
      else extraEmAndamento++;
    });
    const extra = {
      total: oportunidadesExtra.length,
      ganhas: extraGanhas,
      perdidas: extraPerdidas,
      emAndamento: extraEmAndamento,
    };

    const enviadas = oportunidades.filter(
      op => typeof op.tipo_movimentacao === "string" && op.tipo_movimentacao.toLowerCase() === "enviada"
    ).length;
    const recebidas = oportunidades.filter(
      op => typeof op.tipo_movimentacao === "string" && op.tipo_movimentacao.toLowerCase() === "recebida"
    ).length;
    const saldo = enviadas - recebidas;

    if (typeof window !== "undefined") {
      // LOG detalhado
      console.log("[useDashboardStats] Calculado: ", {
        total,
        ganhas,
        perdidas,
        emAndamento,
        intra,
        extra,
        enviadas,
        recebidas,
        saldo,
      });

      // Sanity check: intra/extra status soma deve bater com o total de cada
      if (intra.total !== intra.ganhas + intra.perdidas + intra.emAndamento) {
        console.warn(`[useDashboardStats] Soma dos status intra não bate: ${intra.total} != ${intra.ganhas} + ${intra.perdidas} + ${intra.emAndamento}`);
      }
      if (extra.total !== extra.ganhas + extra.perdidas + extra.emAndamento) {
        console.warn(`[useDashboardStats] Soma dos status extra não bate: ${extra.total} != ${extra.ganhas} + ${extra.perdidas} + ${extra.emAndamento}`);
      }
      // Sanity check: intra + extra deve ser igual ao total geral
      if (intra.total + extra.total !== total) {
        console.warn(`[useDashboardStats] Soma intra + extra não bate com total: ${intra.total} + ${extra.total} != ${total}`);
      }
    }

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

export default useDashboardStats;
