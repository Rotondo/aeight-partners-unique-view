
import React, { useMemo } from "react";
import { Oportunidade } from "@/types";
import { useStatsCalculation } from "./useStatsCalculation";

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

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  console.log('[useDashboardStats] Starting hook execution', {
    reactAvailable: !!React,
    useMemoAvailable: !!useMemo,
    inputData: oportunidadesFiltradas
  });

  const oportunidades = useMemo(() => {
    // CORREÇÃO: Garantir array válido e loggar para debug
    const validArray = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];
    console.log('[useDashboardStats] Dados recebidos:', {
      isArray: Array.isArray(oportunidadesFiltradas),
      isNull: oportunidadesFiltradas === null,
      isUndefined: oportunidadesFiltradas === undefined,
      length: validArray.length,
      sample: validArray.slice(0, 2)
    });
    return validArray;
  }, [oportunidadesFiltradas]);

  const stats = useStatsCalculation(oportunidades);

  return useMemo(() => {
    console.log('[useDashboardStats] Stats calculadas:', {
      totalLength: oportunidades.length,
      totalGanho: stats.total.ganho,
      totalPerdido: stats.total.perdido,
      totalEmContato: stats.total.em_contato,
      totalNegociando: stats.total.negociando,
      totalAndamento: stats.total.em_contato + stats.total.negociando
    });

    return {
      total: stats.total,
      intra: stats.intra,
      extra: stats.extra,
      enviadas: stats.enviadas,
      recebidas: stats.recebidas,
      saldo: stats.saldo,
    };
  }, [stats, oportunidades.length]);
}

export default useDashboardStats;
