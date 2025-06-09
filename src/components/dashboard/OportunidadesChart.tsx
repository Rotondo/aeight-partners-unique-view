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

// Permite tanto array quanto objeto agrupado (protege contra erro fatal)
function normalizeChartData(chartData: any, periodo: "mes" | "quarter") {
  // Se já for array, retorna
  if (Array.isArray(chartData)) return chartData;

  // Se for objeto agrupado por status, transforma em array apropriado para o gráfico
  if (
    chartData &&
    typeof chartData === "object" &&
    "em_contato" in chartData &&
    "negociando" in chartData &&
    "ganho" in chartData &&
    "perdido" in chartData &&
    "total" in chartData
  ) {
    // Exemplo: converte para [{name: status, value: ...}, ...]
    return [
      { [periodo === "mes" ? "mes" : "quarter"]: "Em Contato", enviadas: chartData.em_contato || 0 },
      { [periodo === "mes" ? "mes" : "quarter"]: "Negociando", enviadas: chartData.negociando || 0 },
      { [periodo === "mes" ? "mes" : "quarter"]: "Ganho", enviadas: chartData.ganho || 0 },
      { [periodo === "mes" ? "mes" : "quarter"]: "Perdido", enviadas: chartData.perdido || 0 },
      // Se quiser adicionar outros status personalizados:
      ...(chartData.outros
        ? Object.entries(chartData.outros).map(([k, v]) => ({
            [periodo === "mes" ? "mes" : "quarter"]: k,
            enviadas: v as number,
          }))
        : []),
    ];
  }

  // Caso não seja nenhum dos formatos esperados, retorna array vazio para evitar crash
  return [];
}

interface OportunidadesChartProps {
  chartData: any[] | object;
  periodo: "mes" | "quarter";
}

export const OportunidadesChart: React.FC<OportunidadesChartProps> = ({ chartData, periodo }) => {
  const data = React.useMemo(() => normalizeChartData(chartData, periodo), [chartData, periodo]);

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
};
