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

// Aceita tanto array quanto objeto agrupado e converte para o formato correto
type IntraExtraBarChartData =
  | { tipo: string; enviadas: number; recebidas: number }[]
  | {
      intra?: { enviadas: number; recebidas: number };
      extra?: { enviadas: number; recebidas: number };
    };

function toBarChartArray(data: IntraExtraBarChartData): { tipo: string; enviadas: number; recebidas: number }[] {
  // Se já for array, retorna
  if (Array.isArray(data)) return data;

  // Se for objeto agrupado, converte para array
  const arr: { tipo: string; enviadas: number; recebidas: number }[] = [];
  if (data.intra) {
    arr.push({ tipo: "Intra Grupo", enviadas: data.intra.enviadas ?? 0, recebidas: data.intra.recebidas ?? 0 });
  }
  if (data.extra) {
    arr.push({ tipo: "Extra Grupo", enviadas: data.extra.enviadas ?? 0, recebidas: data.extra.recebidas ?? 0 });
  }
  return arr;
}

interface OportunidadesChartProps {
  chartData: IntraExtraBarChartData;
  periodo: "mes" | "quarter";
}

export const OportunidadesChart: React.FC<OportunidadesChartProps> = ({ chartData, periodo }) => {
  const data = React.useMemo(() => toBarChartArray(chartData), [chartData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Gráfico de Oportunidades ({periodo === "mes" ? "Mensal" : "Quarter"})
        </CardTitle>
      </CardHeader>
      <CardContent style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
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
};
