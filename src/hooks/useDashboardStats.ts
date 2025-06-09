import { useMemo } from "react";
import { Oportunidade } from "@/types";

export interface DashboardStatsByStatus {
  em_contato: number;
  negociando: number;
  ganho: number;
  perdido: number;
  outros?: Record<string, number>; // Para capturar status inesperados
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

// ATENÇÃO: só são status oficiais os abaixo, e só eles entram nos gráficos principais
const STATUS_LIST = ["em_contato", "negociando", "ganho", "perdido"];

function normalizeStatus(status: any): string {
  if (typeof status !== "string") return "";
  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function countByStatus(arr: Oportunidade[]): DashboardStatsByStatus {
  const counts: Record<string, number> = {};
  arr.forEach(op => {
    const status = normalizeStatus(op.status);
    counts[status] = (counts[status] || 0) + 1;
  });

  // Garante todos os status conhecidos, mesmo que zero
  const res: DashboardStatsByStatus = {
    em_contato: counts["em_contato"] || 0,
    negociando: counts["negociando"] || 0,
    ganho: counts["ganho"] || 0,
    perdido: counts["perdido"] || 0,
    total: arr.length,
  };

  // Adiciona status desconhecidos (diagnóstico)
  const outros: Record<string, number> = {};
  Object.keys(counts).forEach(k => {
    if (!STATUS_LIST.includes(k)) outros[k] = counts[k];
  });
  if (Object.keys(outros).length) {
    res.outros = outros;
  }

  return res;
}

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  const oportunidades = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];

  const intraOps = oportunidades.filter(
    op => typeof op.tipo_relacao === "string" && normalizeStatus(op.tipo_relacao) === "intra"
  );
  const extraOps = oportunidades.filter(
    op => typeof op.tipo_relacao === "string" && normalizeStatus(op.tipo_relacao) === "extra"
  );

  const totalStats = countByStatus(oportunidades);
  const intraStats = countByStatus(intraOps);
  const extraStats = countByStatus(extraOps);

  const enviadas = oportunidades.filter(
    op => typeof op.tipo_movimentacao === "string" && normalizeStatus(op.tipo_movimentacao) === "enviada"
  ).length;
  const recebidas = oportunidades.filter(
    op => typeof op.tipo_movimentacao === "string" && normalizeStatus(op.tipo_movimentacao) === "recebida"
  ).length;
  const saldo = enviadas - recebidas;

  // Diagnóstico: loga status desconhecidos
  if (typeof window !== "undefined") {
    if (totalStats.outros && Object.keys(totalStats.outros).length) {
      console.warn("[useDashboardStats] Status inesperados encontrados:", totalStats.outros);
    }
    if (intraStats.outros && Object.keys(intraStats.outros).length) {
      console.warn("[useDashboardStats] Status INTRA inesperados:", intraStats.outros);
    }
    if (extraStats.outros && Object.keys(extraStats.outros).length) {
      console.warn("[useDashboardStats] Status EXTRA inesperados:", extraStats.outros);
    }
  }

  return {
    total: totalStats,
    intra: intraStats,
    extra: extraStats,
    enviadas,
    recebidas,
    saldo,
  };
}

export default useDashboardStats;
