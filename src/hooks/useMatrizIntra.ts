import { useMemo } from "react";
import { Oportunidade, Empresa } from "@/types";

interface MatrizIntraRow {
  origem: string;
  [destino: string]: string | number;
}

/**
 * Gera a matriz de oportunidades intragrupo.
 * Cada linha representa uma empresa de origem e cada coluna uma empresa de destino.
 * O valor é o número de oportunidades entre elas (exceto diagonal).
 */
export function useMatrizIntra(
  oportunidadesFiltradas: Oportunidade[],
  empresas: Empresa[]
): MatrizIntraRow[] {
  return useMemo(() => {
    const intragrupo = empresas.filter((e) => e.tipo === "intragrupo");
    return intragrupo.map((origem) => {
      const row: MatrizIntraRow = { origem: origem.nome };
      intragrupo.forEach((destino) => {
        if (origem.id === destino.id) {
          row[destino.nome] = "-";
        } else {
          row[destino.nome] = oportunidadesFiltradas.filter(
            (op) =>
              op.tipo_relacao === "intra" &&
              op.empresa_origem_id === origem.id &&
              op.empresa_destino_id === destino.id
          ).length;
        }
      });
      return row;
    });
  }, [oportunidadesFiltradas, empresas]);
}
