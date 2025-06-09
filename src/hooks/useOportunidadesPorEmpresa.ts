import { useMemo } from "react";
import { Oportunidade, Empresa } from "@/types";

interface OportunidadesEmpresa {
  empresaId: string;
  empresaNome: string;
  enviadas: number;
  recebidas: number;
}

export function useOportunidadesPorEmpresa(
  oportunidadesFiltradas: Oportunidade[],
  empresas: Empresa[]
): OportunidadesEmpresa[] {
  return useMemo(() => {
    return empresas.map((empresa) => {
      const enviadas = oportunidadesFiltradas.filter(
        (op) => op.empresa_origem_id === empresa.id
      ).length;
      const recebidas = oportunidadesFiltradas.filter(
        (op) => op.empresa_destino_id === empresa.id
      ).length;
      return {
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        enviadas,
        recebidas,
      };
    });
  }, [oportunidadesFiltradas, empresas]);
}
