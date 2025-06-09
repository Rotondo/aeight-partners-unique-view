import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Mapeamento de cores para cada status
const STATUS_COLORS: Record<string, string> = {
  ganho: "#22c55e",
  perdido: "#ef4444",
  negociando: "#fbbf24",
  em_contato: "#3b82f6",
  Contato: "#6366f1",
  Apresentado: "#8b5cf6",
  "Sem contato": "#64748b",
  indefinido: "#8884d8"
};

type StatusGroupObject = {
  em_contato: number;
  negociando: number;
  ganho: number;
  perdido: number;
  outros?: Record<string, number>;
  total: number;
};

interface StatusPieChartProps {
  // Permite receber tanto o array quanto o objeto agrupado por status
  statusChartData: { status: string; value: number }[] | StatusGroupObject;
  tipoFiltro: "all" | "intra" | "extra";
}

function toChartArray(data: { status: string; value: number }[] | StatusGroupObject): { status: string; value: number }[] {
  // Se já for array, retorna!
  if (Array.isArray(data)) return data;

  // Se for objeto agrupado, transforma em array para o gráfico
  const arr: { status: string; value: number }[] = [
    { status: "em_contato", value: data.em_contato },
    { status: "negociando", value: data.negociando },
    { status: "ganho", value: data.ganho },
    { status: "perdido", value: data.perdido }
  ];

  if (data.outros) {
    Object.entries(data.outros).forEach(([key, value]) => {
      arr.push({ status: key, value });
    });
  }

  // Remove status zerados
  return arr.filter(d => d.value > 0);
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ statusChartData, tipoFiltro }) => {
  const chartData = React.useMemo(() => toChartArray(statusChartData), [statusChartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Distribuição por Status (
          {tipoFiltro === "all"
            ? "Todos"
            : tipoFiltro === "intra"
            ? "Intra Grupo"
            : "Extra Grupo"}
          )
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-${entry.status}-${idx}`}
                  fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || "#8884d8"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
