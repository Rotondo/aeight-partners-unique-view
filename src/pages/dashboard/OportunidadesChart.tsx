import React from "react";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OportunidadesChartProps {
  chartData: any[];
  periodo: "mes" | "quarter";
}

export const OportunidadesChart: React.FC<OportunidadesChartProps> = ({ chartData, periodo }) => (
  <Card>
    <CardHeader>
      <CardTitle>Gráfico de Oportunidades ({periodo === "mes" ? "Mensal" : "Quarter"})</CardTitle>
    </CardHeader>
    <CardContent style={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={periodo === "mes" ? "mes" : "quarter"} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="enviadas" fill="#0088fe" name="Enviadas" />
          <Bar dataKey="recebidas" fill="#00c49f" name="Recebidas" />
        </ReBarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
