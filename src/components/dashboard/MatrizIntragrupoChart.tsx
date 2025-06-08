import React from "react";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Matriz intragrupo aprimorada:
 * - Tabela com heatmap visual (cor proporcional ao valor).
 * - Tooltips nativos shadcn/ui.
 * - Primeira coluna e linha fixas.
 * - Zeros exibidos como "–" para menos ruído.
 * - Layout responsivo e rolagem horizontal.
 */
export const MatrizIntragrupoChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  // Todas empresas intragrupo que aparecem como origem ou destino
  const empresasSet = React.useMemo(() => {
    const set = new Set<string>();
    filteredOportunidades.forEach((op) => {
      if (op.empresa_origem?.tipo === "intragrupo") set.add(op.empresa_origem.nome);
      if (op.empresa_destino?.tipo === "intragrupo") set.add(op.empresa_destino.nome);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [filteredOportunidades]);

  // Monta a matriz: [origem][destino] = quantidade
  const matriz = React.useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    empresasSet.forEach((origem) => {
      m[origem] = {};
      empresasSet.forEach((destino) => {
        m[origem][destino] = 0;
      });
    });
    filteredOportunidades.forEach((op) => {
      const origem = op.empresa_origem?.nome;
      const destino = op.empresa_destino?.nome;
      if (
        op.empresa_origem?.tipo === "intragrupo" &&
        op.empresa_destino?.tipo === "intragrupo" &&
        origem &&
        destino
      ) {
        m[origem][destino] += 1;
      }
    });
    return m;
  }, [filteredOportunidades, empresasSet]);

  // Descobre o valor máximo para normalizar cor do heatmap
  const maxValue = React.useMemo(() => {
    let max = 0;
    empresasSet.forEach((origem) =>
      empresasSet.forEach((destino) => {
        max = Math.max(max, matriz[origem]?.[destino] ?? 0);
      })
    );
    return max;
  }, [empresasSet, matriz]);

  // Gera cor de fundo baseada na intensidade do valor
  function getCellColor(value: number) {
    if (!value || maxValue === 0) return { backgroundColor: "#f3f4f6" }; // gray-100
    // Escala azul: de #e0f2fe (claro) a #2563eb (escuro)
    const percent = Math.min(value / maxValue, 1);
    const r = Math.round(224 - 112 * percent); // 224 -> 112
    const g = Math.round(242 - 114 * percent); // 242 -> 128
    const b = Math.round(254 - 213 * percent); // 254 -> 41
    return { backgroundColor: `rgb(${r},${g},${b})` };
  }

  if (empresasSet.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma empresa intragrupo encontrada</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <table className="min-w-max border-collapse text-xs">
          <thead>
            <tr>
              <th className="border p-1 sticky left-0 z-10 bg-white font-bold text-left">
                Origem \ Destino
              </th>
              {empresasSet.map((destino) => (
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
            {empresasSet.map((origem) => (
              <tr key={origem}>
                <td className="border p-1 sticky left-0 z-10 bg-white font-bold" title={origem}>
                  {origem}
                </td>
                {empresasSet.map((destino) => {
                  const value = matriz[origem][destino];
                  return (
                    <td
                      key={destino}
                      className="border p-1 text-center"
                      style={getCellColor(value)}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span tabIndex={0} style={{ cursor: value > 0 ? "pointer" : "default" }}>
                            {value > 0 ? value : <span style={{ opacity: 0.4 }}>–</span>}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {origem} → {destino}: {value} indicação{value === 1 ? "" : "s"}
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
          <span className="inline-block align-middle" style={{ width: 18, height: 12, backgroundColor: "#e0f2fe", border: "1px solid #cbd5e1" }} />
          Menos indicações
          <span className="inline-block align-middle" style={{ width: 18, height: 12, backgroundColor: "#2563eb", border: "1px solid #1e40af" }} />
          Mais indicações
        </div>
      </div>
    </TooltipProvider>
  );
};
