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

interface StatusPieChartProps {
  statusChartData: { status: string; value: number }[];
  tipoFiltro: "all" | "intra" | "extra";
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ statusChartData, tipoFiltro }) => (
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
            data={statusChartData}
            dataKey="value"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {statusChartData.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
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
