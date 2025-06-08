import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";

/**
 * Gráfico aprimorado de ranking de parceiros:
 * - Barras horizontais para melhor leitura.
 * - TOP 3 destacados por cor e troféu.
 * - Tooltip completo.
 * - Rolagem vertical para listas longas.
 * - Exibe todas as informações de enviadas, recebidas e total.
 */
export const RankingParceirosChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  // Calcula ranking por total de movimentações (enviadas + recebidas)
  const rankingData = React.useMemo(() => {
    const parceirosCount: Record<
      string,
      { parceiro: string; enviadas: number; recebidas: number; total: number }
    > = {};
    filteredOportunidades.forEach((op) => {
      const origem = op.empresa_origem;
      const destino = op.empresa_destino;

      if (origem?.tipo === "parceiro") {
        const nome = origem.nome;
        if (!parceirosCount[nome]) {
          parceirosCount[nome] = { parceiro: nome, enviadas: 0, recebidas: 0, total: 0 };
        }
        parceirosCount[nome].enviadas++;
        parceirosCount[nome].total++;
      }

      if (destino?.tipo === "parceiro") {
        const nome = destino.nome;
        if (!parceirosCount[nome]) {
          parceirosCount[nome] = { parceiro: nome, enviadas: 0, recebidas: 0, total: 0 };
        }
        parceirosCount[nome].recebidas++;
        parceirosCount[nome].total++;
      }
    });
    return Object.values(parceirosCount)
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [filteredOportunidades]);

  // Cores para TOP 3: ouro, prata, bronze
  const topColors = ["#f59e42", "#bfc4ca", "#e6bb3c"];
  // Troféus unicode para top 3
  const trofeus = ["🏆", "🥈", "🥉"];

  if (rankingData.length === 0) {
    return (
      <div className="h-[340px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum parceiro encontrado</p>
      </div>
    );
  }

  // Altura dinâmica: 40px por parceiro, min 340px
  const chartHeight = Math.max(340, rankingData.length * 40);

  return (
    <div style={{ height: chartHeight, maxHeight: 500, overflowY: rankingData.length > 12 ? "auto" : "visible" }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={rankingData}
          layout="vertical"
          margin={{ left: 120, right: 20, top: 20, bottom: 20 }}
          barCategoryGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="parceiro"
            width={110}
            tick={({ x, y, payload, index }) => {
              // Troféu para TOP 3
              const label = payload.value;
              const isTop = index < 3;
              return (
                <g>
                  <text x={x - 8} y={y + 4} textAnchor="end" fontWeight={isTop ? "bold" : "normal"} fontSize={12}>
                    {isTop ? `${trofeus[index]} ${label}` : label}
                  </text>
                </g>
              );
            }}
            interval={0}
          />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "enviadas"
                ? "Enviadas"
                : name === "recebidas"
                ? "Recebidas"
                : "Total",
            ]}
          />
          <Legend />
          <Bar dataKey="enviadas" fill="#3b82f6" name="Enviadas">
            {rankingData.map((_, idx) => (
              <Cell
                key={`cell-enviadas-${idx}`}
                fill={idx < 3 ? topColors[idx] : "#3b82f6"}
                opacity={idx < 3 ? 0.9 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="recebidas" fill="#10b981" name="Recebidas">
            {rankingData.map((_, idx) => (
              <Cell
                key={`cell-recebidas-${idx}`}
                fill={idx < 3 ? topColors[idx] : "#10b981"}
                opacity={idx < 3 ? 0.9 : 1}
              />
            ))}
          </Bar>
          <Bar dataKey="total" fill="#6366f1" name="Total" barSize={8} hide />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 text-xs text-muted-foreground">
        <span className="inline-block mr-2 align-middle" style={{ color: topColors[0] }}>
          {trofeus[0]}
        </span>
        Top 1 &nbsp;
        <span className="inline-block mx-2 align-middle" style={{ color: topColors[1] }}>
          {trofeus[1]}
        </span>
        Top 2 &nbsp;
        <span className="inline-block mx-2 align-middle" style={{ color: topColors[2] }}>
          {trofeus[2]}
        </span>
        Top 3
      </div>
    </div>
  );
};
