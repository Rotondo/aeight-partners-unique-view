
import { useMemo } from "react";
import type { Oportunidade } from "@/types";

/**
 * Hook especializado para cálculos de estatísticas
 */
export const useStatsCalculation = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    const calculateStatusCounts = (ops: Oportunidade[]) => {
      const counts = {
        em_contato: 0,
        negociando: 0,
        ganho: 0,
        perdido: 0,
        total: ops.length
      };

      ops.forEach(op => {
        const status = normalizeStatus(op.status);
        if (status in counts) {
          counts[status as keyof typeof counts]++;
        }
      });

      return counts;
    };

    const calculateMovimentacao = (ops: Oportunidade[]) => {
      const enviadas = ops.filter(op => 
        normalizeMovimentacao(op.tipo_movimentacao) === "enviada"
      ).length;
      
      const recebidas = ops.filter(op => 
        normalizeMovimentacao(op.tipo_movimentacao) === "recebida"
      ).length;

      return {
        enviadas,
        recebidas,
        saldo: enviadas - recebidas
      };
    };

    const intraOps = oportunidades.filter(op => 
      normalizeRelacao(op.tipo_relacao) === "intra"
    );
    
    const extraOps = oportunidades.filter(op => 
      normalizeRelacao(op.tipo_relacao) === "extra"
    );

    return {
      total: calculateStatusCounts(oportunidades),
      intra: calculateStatusCounts(intraOps),
      extra: calculateStatusCounts(extraOps),
      ...calculateMovimentacao(oportunidades)
    };
  }, [oportunidades]);
};

// Helper functions
const normalizeStatus = (status: any): string => {
  if (typeof status !== "string") return "em_contato";
  
  const normalized = status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  
  const statusMap: Record<string, string> = {
    "em_contato": "em_contato",
    "negociando": "negociando", 
    "ganho": "ganho",
    "perdido": "perdido",
    "contato": "em_contato",
    "apresentado": "em_contato",
    "sem contato": "perdido"
  };
  
  return statusMap[normalized] || "em_contato";
};

const normalizeRelacao = (tipo: any): string => {
  if (typeof tipo !== "string") return "extra";
  
  return tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};

const normalizeMovimentacao = (tipo: any): string => {
  if (typeof tipo !== "string") return "enviada";
  
  return tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
};
