
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

    const calculateFluxoIndicacoes = (ops: Oportunidade[]) => {
      // Enviadas: quando o grupo (intragrupo) envia para parceiros (extragrupo)
      const enviadas = ops.filter(op => {
        const origemTipo = normalizeRelacao(op.empresa_origem?.tipo);
        const destinoTipo = normalizeRelacao(op.empresa_destino?.tipo);
        return origemTipo === "intragrupo" && (destinoTipo === "parceiro" || destinoTipo === "cliente");
      }).length;
      
      // Recebidas: quando parceiros/clientes enviam para o grupo (intragrupo)
      const recebidas = ops.filter(op => {
        const origemTipo = normalizeRelacao(op.empresa_origem?.tipo);
        const destinoTipo = normalizeRelacao(op.empresa_destino?.tipo);
        return (origemTipo === "parceiro" || origemTipo === "cliente") && destinoTipo === "intragrupo";
      }).length;

      return {
        enviadas,
        recebidas,
        saldo: enviadas - recebidas
      };
    };

    const intraOps = oportunidades.filter(op => 
      normalizeRelacao(op.empresa_origem?.tipo) === "intragrupo" && 
      normalizeRelacao(op.empresa_destino?.tipo) === "intragrupo"
    );
    
    const extraOps = oportunidades.filter(op => 
      (normalizeRelacao(op.empresa_origem?.tipo) === "intragrupo" && normalizeRelacao(op.empresa_destino?.tipo) !== "intragrupo") ||
      (normalizeRelacao(op.empresa_origem?.tipo) !== "intragrupo" && normalizeRelacao(op.empresa_destino?.tipo) === "intragrupo") ||
      (normalizeRelacao(op.empresa_origem?.tipo) !== "intragrupo" && normalizeRelacao(op.empresa_destino?.tipo) !== "intragrupo")
    );

    const fluxo = calculateFluxoIndicacoes(oportunidades);

    return {
      total: calculateStatusCounts(oportunidades),
      intra: calculateStatusCounts(intraOps),
      extra: calculateStatusCounts(extraOps),
      enviadas: fluxo.enviadas,
      recebidas: fluxo.recebidas,
      saldo: fluxo.saldo
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
  if (typeof tipo !== "string") return "extragrupo";
  
  const normalized = tipo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  // Mapear os tipos para as categorias corretas
  const tipoMap: Record<string, string> = {
    "intragrupo": "intragrupo",
    "parceiro": "parceiro", 
    "cliente": "cliente"
  };
  
  return tipoMap[normalized] || "extragrupo";
};
