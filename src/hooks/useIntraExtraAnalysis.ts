import { useMemo } from "react";
import { Oportunidade } from "@/types";

export function useIntraExtraAnalysis(oportunidadesFiltradas: Oportunidade[]) {
  return useMemo(() => {
    const intragrupo = oportunidadesFiltradas.filter(op => op.tipo_relacao === "intra");
    const extragrupo = oportunidadesFiltradas.filter(op => op.tipo_relacao === "extra");

    const intraStats = {
      total: intragrupo.length,
      ganhas: intragrupo.filter(op => op.status === "ganho").length,
      perdidas: intragrupo.filter(op => op.status === "perdido").length,
      emAndamento: intragrupo.filter(op => op.status !== "ganho" && op.status !== "perdido").length,
      valorTotal: intragrupo.reduce((sum, op) => sum + (op.valor || 0), 0),
    };
    const extraStats = {
      total: extragrupo.length,
      ganhas: extragrupo.filter(op => op.status === "ganho").length,
      perdidas: extragrupo.filter(op => op.status === "perdido").length,
      emAndamento: extragrupo.filter(op => op.status !== "ganho" && op.status !== "perdido").length,
      valorTotal: extragrupo.reduce((sum, op) => sum + (op.valor || 0), 0),
    };

    return {
      quantidades: [
        { name: "Intragrupo", ...intraStats },
        { name: "Extragrupo", ...extraStats },
      ],
      valores: [
        { name: "Intragrupo", valor: intraStats.valorTotal },
        { name: "Extragrupo", valor: extraStats.valorTotal },
      ],
      conversao: [
        {
          name: "Intragrupo",
          taxa: intraStats.total > 0 ? (intraStats.ganhas / intraStats.total) * 100 : 0,
        },
        {
          name: "Extragrupo",
          taxa: extraStats.total > 0 ? (extraStats.ganhas / extraStats.total) * 100 : 0,
        },
      ],
    };
  }, [oportunidadesFiltradas]);
}
