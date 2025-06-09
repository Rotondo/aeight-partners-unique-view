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

export function useIntraExtraAnalysis(oportunidadesFiltradas: Oportunidade[]): IntraExtraAnalysis {
  return useMemo(() => {
    const intragrupo = oportunidadesFiltradas.filter(op => op.tipo_relacao === "intra");
    const extragrupo = oportunidadesFiltradas.filter(op => op.tipo_relacao === "extra");

    const getStats = (arr: Oportunidade[]): IntraExtraStats => ({
      total: arr.length,
      ganhas: arr.filter(op => op.status === "ganho").length,
      perdidas: arr.filter(op => op.status === "perdido").length,
      emAndamento: arr.filter(op => op.status !== "ganho" && op.status !== "perdido").length,
      valorTotal: arr.reduce((sum, op) => sum + (op.valor || 0), 0)
    });

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
  }, [oportunidadesFiltradas]);
}
