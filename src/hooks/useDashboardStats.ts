import { useMemo } from "react";
import { Oportunidade } from "@/types";

interface IntraExtraStats {
  total: number;
  ganhas: number;
  perdidas: number;
  emAndamento: number;
  valorTotal: number;
}

interface IntraExtraAnalysis {
  quantidades: Array<{
    name: string;
    total: number;
    ganhas: number;
    perdidas: number;
    emAndamento: number;
    valorTotal: number;
  }>;
  valores: Array<{
    name: string;
    valor: number;
  }>;
  conversao: Array<{
    name: string;
    taxa: number;
  }>;
}

export function useIntraExtraAnalysis(oportunidadesFiltradas?: Oportunidade[] | null): IntraExtraAnalysis {
  // Garante array válido e seguro
  const oportunidades: Oportunidade[] = Array.isArray(oportunidadesFiltradas) ? oportunidadesFiltradas : [];

  return useMemo(() => {
    // Função para calcular os stats robustamente
    const getStats = (arr: Oportunidade[]): IntraExtraStats => {
      const total = arr.length;
      const ganhas = arr.filter(op => typeof op.status === "string" && op.status.toLowerCase() === "ganho").length;
      const perdidas = arr.filter(op => typeof op.status === "string" && op.status.toLowerCase() === "perdido").length;
      // "Em Andamento" por exclusão: qualquer status não "ganho" e não "perdido"
      const emAndamento = total - ganhas - perdidas;
      const valorTotal = arr.reduce((sum, op) => sum + (op.valor || 0), 0);
      return { total, ganhas, perdidas, emAndamento, valorTotal };
    };

    // Filtra intragrupo e extragrupo de forma defensiva
    const intragrupo = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "intra"
    );
    const extragrupo = oportunidades.filter(
      op => typeof op.tipo_relacao === "string" && op.tipo_relacao.toLowerCase() === "extra"
    );

    const intraStats = getStats(intragrupo);
    const extraStats = getStats(extragrupo);

    return {
      quantidades: [
        { name: "Intragrupo", ...intraStats },
        { name: "Extragrupo", ...extraStats }
      ],
      valores: [
        { name: "Intragrupo", valor: intraStats.valorTotal },
        { name: "Extragrupo", valor: extraStats.valorTotal }
      ],
      conversao: [
        {
          name: "Intragrupo",
          taxa: intraStats.total > 0 ? (intraStats.ganhas / intraStats.total) * 100 : 0
        },
        {
          name: "Extragrupo",
          taxa: extraStats.total > 0 ? (extraStats.ganhas / extraStats.total) * 100 : 0
        }
      ]
    };
  }, [oportunidades]);
}
