
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

// Status oficiais e seus mapeamentos
const STATUS_MAPPING: Record<string, string> = {
  "em_contato": "em_contato",
  "negociando": "negociando", 
  "ganho": "ganho",
  "perdido": "perdido",
  // Mapeamentos para status alternativos encontrados nos dados
  "contato": "em_contato",
  "apresentado": "em_contato",
  "sem contato": "perdido"
};

const STATUS_LIST = ["em_contato", "negociando", "ganho", "perdido"];

function normalizeStatus(status: any): string {
  if (typeof status !== "string") return "em_contato"; // fallback seguro
  
  const normalized = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  
  // Retorna o status mapeado ou o original normalizado se não encontrar mapeamento
  return STATUS_MAPPING[normalized] || normalized;
}

function normalizeTipoRelacao(tipo: any): string {
  if (typeof tipo !== "string") return "extra"; // fallback seguro
  
  return tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function countByStatus(arr: Oportunidade[]): DashboardStatsByStatus {
  const counts: Record<string, number> = {};
  const outros: Record<string, number> = {};
  
  arr.forEach(op => {
    const originalStatus = op.status || "em_contato";
    const normalizedStatus = normalizeStatus(originalStatus);
    
    // Se o status normalizado não está na lista oficial, conta como "outros"
    if (!STATUS_LIST.includes(normalizedStatus)) {
      outros[String(originalStatus)] = (outros[String(originalStatus)] || 0) + 1;
      // Para efeito de contagem, trata como "em_contato" se não conseguir mapear
      counts["em_contato"] = (counts["em_contato"] || 0) + 1;
    } else {
      counts[normalizedStatus] = (counts[normalizedStatus] || 0) + 1;
    }
  });

  // Garante todos os status conhecidos, mesmo que zero
  const res: DashboardStatsByStatus = {
    em_contato: counts["em_contato"] || 0,
    negociando: counts["negociando"] || 0,
    ganho: counts["ganho"] || 0,
    perdido: counts["perdido"] || 0,
    total: arr.length,
  };

  // Adiciona status desconhecidos apenas para diagnóstico
  if (Object.keys(outros).length > 0) {
    res.outros = outros;
    // Log para diagnóstico, mas não quebra a aplicação
    if (typeof window !== "undefined") {
      console.warn("[useDashboardStats] Status inesperados mapeados para 'em_contato':", outros);
    }
  }

  return res;
}

export function useDashboardStats(oportunidadesFiltradas?: Oportunidade[] | null): DashboardStats {
  return useMemo(() => {
    const oportunidades = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];
    
    // Log para diagnóstico
    if (typeof window !== "undefined" && oportunidades.length > 0) {
      console.log(`[useDashboardStats] Processando ${oportunidades.length} oportunidades`);
    }

    const intraOps = oportunidades.filter(
      op => normalizeTipoRelacao(op.tipo_relacao) === "intra"
    );
    const extraOps = oportunidades.filter(
      op => normalizeTipoRelacao(op.tipo_relacao) === "extra"
    );

    const totalStats = countByStatus(oportunidades);
    const intraStats = countByStatus(intraOps);
    const extraStats = countByStatus(extraOps);

    const enviadas = oportunidades.filter(
      op => normalizeTipoRelacao(op.tipo_movimentacao) === "enviada"
    ).length;
    const recebidas = oportunidades.filter(
      op => normalizeTipoRelacao(op.tipo_movimentacao) === "recebida"
    ).length;
    const saldo = enviadas - recebidas;

    const result = {
      total: totalStats,
      intra: intraStats,
      extra: extraStats,
      enviadas,
      recebidas,
      saldo,
    };

    // Log final para verificação
    if (typeof window !== "undefined") {
      console.log("[useDashboardStats] Resultado final:", {
        total: result.total.total,
        ganho: result.total.ganho,
        perdido: result.total.perdido,
        emContato: result.total.em_contato,
        negociando: result.total.negociando
      });
    }

    return result;
  }, [oportunidadesFiltradas]);
}

export default useDashboardStats;
