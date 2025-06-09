import { useMemo } from "react";
import { Oportunidade, Empresa } from "@/types";

interface MatrizParceirosRow {
  parceiro: string;
  [intraNome: string]: string | number;
}

/**
 * Gera a matriz de oportunidades entre parceiros e empresas intragrupo.
 * Cada linha representa um parceiro e cada coluna uma empresa intragrupo.
 * O valor é o número de oportunidades entre eles.
 */
export function useMatrizParceiros(
  oportunidadesFiltradas: Oportunidade[],
  empresas: Empresa[]
): MatrizParceirosRow[] {
  return useMemo(() => {
    const parceiros = empresas.filter((e) => e.tipo === "parceiro");
    const intragrupo = empresas.filter((e) => e.tipo === "intragrupo");

    return parceiros.map((parceiro) => {
      const row: MatrizParceirosRow = { parceiro: parceiro.nome };
      intragrupo.forEach((intra) => {
        row[intra.nome] =
          oportunidadesFiltradas.filter(
            (op) =>
              op.tipo_relacao === "extra" &&
              ((op.empresa_origem_id === parceiro.id && op.empresa_destino_id === intra.id) ||
                (op.empresa_origem_id === intra.id && op.empresa_destino_id === parceiro.id))
          ).length;
      });
      return row;
    });
  }, [oportunidadesFiltradas, empresas]);
}
