import { useMemo } from "react";
import { Oportunidade } from "@/types";

type Periodo = "mes" | "quarter";

interface OportunidadesPorPeriodo {
  label: string;
  total: number;
  ganhas: number;
  perdidas: number;
  andamento: number;
}

function getQuarter(date: Date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

function getQuarterLabel(date: Date) {
  return `Q${getQuarter(date)}/${date.getFullYear()}`;
}

function getMonthLabel(date: Date) {
  const mesLabel = date.toLocaleString("pt-BR", { month: "short" });
  return `${mesLabel}/${String(date.getFullYear()).slice(2)}`;
}

export function useOportunidadesPorPeriodo(
  oportunidadesFiltradas: Oportunidade[],
  periodo: Periodo
): OportunidadesPorPeriodo[] {
  return useMemo(() => {
    const agrupado: Record<string, OportunidadesPorPeriodo> = {};

    oportunidadesFiltradas.forEach((op) => {
      const d = new Date(op.data_indicacao);
      const label = periodo === "quarter" ? getQuarterLabel(d) : getMonthLabel(d);

      if (!agrupado[label]) {
        agrupado[label] = {
          label,
          total: 0,
          ganhas: 0,
          perdidas: 0,
          andamento: 0,
        };
      }
      agrupado[label].total += 1;
      if (op.status === "ganho") agrupado[label].ganhas += 1;
      else if (op.status === "perdido") agrupado[label].perdidas += 1;
      else agrupado[label].andamento += 1;
    });

    // Ordena por data (do mais antigo para o mais recente)
    return Object.values(agrupado).sort((a, b) => a.label.localeCompare(b.label));
  }, [oportunidadesFiltradas, periodo]);
}
