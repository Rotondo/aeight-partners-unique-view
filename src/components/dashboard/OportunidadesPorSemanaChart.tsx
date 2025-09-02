
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { format, getWeek, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyData {
  semana: string;
  intragrupo: number;
  extraParceiroGrupo: number;
  extraGrupoParceiro: number;
  intragroupoTrend?: number;
  extraParceiroGrupoTrend?: number;
  extraGrupoParceiroupTrend?: number;
}

interface LineVisibility {
  intragrupo: boolean;
  extraParceiroGrupo: boolean;
  extraGrupoParceiro: boolean;
}

interface TrendLineVisibility {
  intragrupo: boolean;
  extraParceiroGrupo: boolean;
  extraGrupoParceiro: boolean;
}

export const OportunidadesPorSemanaChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();
  
  const [lineVisibility, setLineVisibility] = useState<LineVisibility>({
    intragrupo: true,
    extraParceiroGrupo: true,
    extraGrupoParceiro: true,
  });

  const [trendVisibility, setTrendVisibility] = useState<TrendLineVisibility>({
    intragrupo: true,
    extraParceiroGrupo: true,
    extraGrupoParceiro: true,
  });

  // Função para calcular regressão linear
  const calculateLinearRegression = (dataPoints: number[]): { slope: number; intercept: number } => {
    const n = dataPoints.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    const xValues = Array.from({ length: n }, (_, i) => i);
    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = dataPoints.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * dataPoints[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
  };

  const processWeeklyData = (): WeeklyData[] => {
    if (!filteredOportunidades || filteredOportunidades.length === 0) {
      return [];
    }

    // Agrupar oportunidades por semana
    const weeklyMap = new Map<string, { intragrupo: number; extraParceiroGrupo: number; extraGrupoParceiro: number }>();

    filteredOportunidades.forEach((op) => {
      const dataIndicacao = new Date(op.data_indicacao);
      const semana = getWeek(dataIndicacao, { locale: ptBR });
      const ano = getYear(dataIndicacao);
      const chave = `Sem ${semana}/${ano}`;

      if (!weeklyMap.has(chave)) {
        weeklyMap.set(chave, { intragrupo: 0, extraParceiroGrupo: 0, extraGrupoParceiro: 0 });
      }

      const stats = weeklyMap.get(chave)!;

      // Categorizar por tipo de relação
      const origemTipo = op.empresa_origem?.tipo;
      const destinoTipo = op.empresa_destino?.tipo;

      if (origemTipo === 'intragrupo' && destinoTipo === 'intragrupo') {
        stats.intragrupo++;
      } else if (origemTipo === 'parceiro' && destinoTipo === 'intragrupo') {
        stats.extraParceiroGrupo++;
      } else if (origemTipo === 'intragrupo' && destinoTipo === 'parceiro') {
        stats.extraGrupoParceiro++;
      }
    });

    // Converter para array e ordenar por data
    const result: WeeklyData[] = Array.from(weeklyMap.entries())
      .map(([semana, stats]) => ({
        semana,
        intragrupo: stats.intragrupo,
        extraParceiroGrupo: stats.extraParceiroGrupo,
        extraGrupoParceiro: stats.extraGrupoParceiro,
      }))
      .sort((a, b) => {
        // Extrair ano e semana para ordenação
        const [semanaA, anoA] = a.semana.replace('Sem ', '').split('/').map(Number);
        const [semanaB, anoB] = b.semana.replace('Sem ', '').split('/').map(Number);
        
        if (anoA !== anoB) return anoA - anoB;
        return semanaA - semanaB;
      });

    // Calcular linhas de tendência se houver dados suficientes
    if (result.length >= 2) {
      const intragroupoValues = result.map(d => d.intragrupo);
      const extraParceiroGrupoValues = result.map(d => d.extraParceiroGrupo);
      const extraGrupoParceiroupValues = result.map(d => d.extraGrupoParceiro);

      const intragroupoRegression = calculateLinearRegression(intragroupoValues);
      const extraParceiroGrupoRegression = calculateLinearRegression(extraParceiroGrupoValues);
      const extraGrupoParceiroupRegression = calculateLinearRegression(extraGrupoParceiroupValues);

      result.forEach((dataPoint, index) => {
        dataPoint.intragroupoTrend = Math.max(0, Math.round(intragroupoRegression.slope * index + intragroupoRegression.intercept));
        dataPoint.extraParceiroGrupoTrend = Math.max(0, Math.round(extraParceiroGrupoRegression.slope * index + extraParceiroGrupoRegression.intercept));
        dataPoint.extraGrupoParceiroupTrend = Math.max(0, Math.round(extraGrupoParceiroupRegression.slope * index + extraGrupoParceiroupRegression.intercept));
      });
    }

    return result;
  };

  const data = processWeeklyData();

  const handleLineToggle = (lineKey: keyof LineVisibility) => {
    setLineVisibility(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  const handleTrendToggle = (lineKey: keyof TrendLineVisibility) => {
    setTrendVisibility(prev => ({
      ...prev,
      [lineKey]: !prev[lineKey]
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} oportunidades
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Semanal de Oportunidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Nenhuma oportunidade encontrada para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Semanal de Oportunidades</CardTitle>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Dados Reais</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intragrupo"
                  checked={lineVisibility.intragrupo}
                  onCheckedChange={() => handleLineToggle('intragrupo')}
                />
                <label
                  htmlFor="intragrupo"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Intragrupo
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraParceiroGrupo"
                  checked={lineVisibility.extraParceiroGrupo}
                  onCheckedChange={() => handleLineToggle('extraParceiroGrupo')}
                />
                <label
                  htmlFor="extraParceiroGrupo"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Parceiro → Grupo
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraGrupoParceiro"
                  checked={lineVisibility.extraGrupoParceiro}
                  onCheckedChange={() => handleLineToggle('extraGrupoParceiro')}
                />
                <label
                  htmlFor="extraGrupoParceiro"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Grupo → Parceiro
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Linhas de Tendência</h4>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="intragroupoTrend"
                  checked={trendVisibility.intragrupo}
                  onCheckedChange={() => handleTrendToggle('intragrupo')}
                />
                <label
                  htmlFor="intragroupoTrend"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-1 bg-blue-300 rounded-full border border-blue-400" style={{borderStyle: 'dashed'}}></div>
                  Tendência Intragrupo
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraParceiroGrupoTrend"
                  checked={trendVisibility.extraParceiroGrupo}
                  onCheckedChange={() => handleTrendToggle('extraParceiroGrupo')}
                />
                <label
                  htmlFor="extraParceiroGrupoTrend"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-1 bg-red-300 rounded-full border border-red-400" style={{borderStyle: 'dashed'}}></div>
                  Tendência Parceiro → Grupo
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="extraGrupoParceiroupTrend"
                  checked={trendVisibility.extraGrupoParceiro}
                  onCheckedChange={() => handleTrendToggle('extraGrupoParceiro')}
                />
                <label
                  htmlFor="extraGrupoParceiroupTrend"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div className="w-3 h-1 bg-green-300 rounded-full border border-green-400" style={{borderStyle: 'dashed'}}></div>
                  Tendência Grupo → Parceiro
                </label>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="semana" 
                className="text-xs fill-muted-foreground"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {lineVisibility.intragrupo && (
                <Line
                  type="monotone"
                  dataKey="intragrupo"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Intragrupo"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {lineVisibility.extraParceiroGrupo && (
                <Line
                  type="monotone"
                  dataKey="extraParceiroGrupo"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Parceiro → Grupo"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {lineVisibility.extraGrupoParceiro && (
                <Line
                  type="monotone"
                  dataKey="extraGrupoParceiro"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Grupo → Parceiro"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
              {trendVisibility.intragrupo && data.length >= 2 && (
                <Line
                  type="monotone"
                  dataKey="intragroupoTrend"
                  stroke="#93C5FD"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  name="Tendência Intragrupo"
                  dot={false}
                  activeDot={false}
                />
              )}
              {trendVisibility.extraParceiroGrupo && data.length >= 2 && (
                <Line
                  type="monotone"
                  dataKey="extraParceiroGrupoTrend"
                  stroke="#FCA5A5"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  name="Tendência Parceiro → Grupo"
                  dot={false}
                  activeDot={false}
                />
              )}
              {trendVisibility.extraGrupoParceiro && data.length >= 2 && (
                <Line
                  type="monotone"
                  dataKey="extraGrupoParceiroupTrend"
                  stroke="#6EE7B7"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  name="Tendência Grupo → Parceiro"
                  dot={false}
                  activeDot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
