import React from "react";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const MatrizParceriasChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  // Conjunto de todas empresas do tipo "intragrupo" (colunas)
  const intragrupos = React.useMemo(() => {
    const set = new Set<string>();
    filteredOportunidades.forEach((op) => {
      if (op.empresa_destino?.tipo === "intragrupo") set.add(op.empresa_destino.nome);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [filteredOportunidades]);

  // Conjunto de todos os parceiros (linhas) e cálculo dos totais por parceiro
  const parceirosComTotais = React.useMemo(() => {
    const parceirosMap = new Map<string, number>();
    filteredOportunidades.forEach((op) => {
      if (op.empresa_origem?.tipo === "parceiro" && op.empresa_destino?.tipo === "intragrupo") {
        const nome = op.empresa_origem.nome;
        parceirosMap.set(nome, (parceirosMap.get(nome) || 0) + 1);
      }
    });
    // Retorna um array de nomes ordenado pelo total decrescente
    return Array.from(parceirosMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nome]) => nome);
  }, [filteredOportunidades]);

  // Monta matriz: [parceiro][intragrupo] = quantidade de indicações
  const matriz = React.useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    parceirosComTotais.forEach((parceiro) => {
      m[parceiro] = {};
      intragrupos.forEach((intra) => {
        m[parceiro][intra] = 0;
      });
    });
    filteredOportunidades.forEach((op) => {
      const origem = op.empresa_origem;
      const destino = op.empresa_destino;
      if (origem?.tipo === "parceiro" && destino?.tipo === "intragrupo") {
        m[origem.nome][destino.nome] += 1;
      }
    });
    return m;
  }, [filteredOportunidades, parceirosComTotais, intragrupos]);

  // Valor máximo para normalizar o heatmap
  const maxValue = React.useMemo(() => {
    let max = 0;
    parceirosComTotais.forEach((parceiro) =>
      intragrupos.forEach((intra) => {
        max = Math.max(max, matriz[parceiro]?.[intra] ?? 0);
      })
    );
    return max;
  }, [parceirosComTotais, intragrupos, matriz]);

  // Gradiente de cor para cada célula
  function getCellColor(value: number) {
    if (!value || maxValue === 0) return { backgroundColor: "#f3f4f6" }; // cinza claro
    const percent = Math.min(value / maxValue, 1);
    const r = Math.round(224 - 112 * percent); // 224 -> 112
    const g = Math.round(242 - 114 * percent); // 242 -> 128
    const b = Math.round(254 - 213 * percent); // 254 -> 41
    return { backgroundColor: `rgb(${r},${g},${b})` };
  }

  if (parceirosComTotais.length === 0 || intragrupos.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">
          Nenhum parceiro ou empresa intragrupo encontrado
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-xs">
          <thead>
            <tr>
              <th
                className="border p-1 sticky left-0 z-10 bg-white font-bold text-left"
                style={{ position: "sticky", left: 0, zIndex: 2, background: "#fff" }}
              >
                Parceiro \ Intragrupo
              </th>
              {intragrupos.map((destino) => (
                <th
                  key={destino}
                  className="border p-1 bg-slate-50 font-bold text-center"
                  style={{ minWidth: 90, maxWidth: 180 }}
                  title={destino}
                >
                  {destino}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parceirosComTotais.map((parceiro) => (
              <tr key={parceiro}>
                <td
                  className="border p-1 sticky left-0 z-10 bg-white font-bold"
                  style={{ position: "sticky", left: 0, zIndex: 1, background: "#fff" }}
                  title={parceiro}
                >
                  {parceiro}
                </td>
                {intragrupos.map((intra) => {
                  const value = matriz[parceiro][intra];
                  return (
                    <td
                      key={intra}
                      className="border p-1 text-center select-none"
                      style={getCellColor(value)}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} style={{ cursor: value > 0 ? "pointer" : "default" }}>
                            {value > 0 ? value : <span style={{ opacity: 0.4 }}>–</span>}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {parceiro} → {intra}: {value} indicação{value === 1 ? "" : "s"}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
          <span
            className="inline-block align-middle"
            style={{
              width: 18,
              height: 12,
              backgroundColor: "#e0f2fe",
              border: "1px solid #cbd5e1",
            }}
          />
          Menos indicações
          <span
            className="inline-block align-middle"
            style={{
              width: 18,
              height: 12,
              backgroundColor: "#2563eb",
              border: "1px solid #1e40af",
            }}
          />
          Mais indicações
        </div>
      </div>
    </TooltipProvider>
  );
};
