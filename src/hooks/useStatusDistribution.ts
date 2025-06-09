import { useMemo } from "react";
import { Oportunidade } from "@/types";

interface StatusDistribution {
  name: string;
  value: number;
}

export function useStatusDistribution(oportunidadesFiltradas: Oportunidade[]): StatusDistribution[] {
  return useMemo(() => {
    const statusCount: Record<string, number> = {};
    oportunidadesFiltradas.forEach(op => {
      const key = op.status || "indefinido";
      statusCount[key] = (statusCount[key] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({
      name,
      value
    }));
  }, [oportunidadesFiltradas]);
}
