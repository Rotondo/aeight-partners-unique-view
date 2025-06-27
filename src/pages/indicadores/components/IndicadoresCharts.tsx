
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { IndicadoresParceiroWithEmpresa } from "../types";
import { CustomTooltip } from "./CustomTooltip";
import { maskName } from "../utils";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface IndicadoresChartsProps {
  filteredIndicadores: IndicadoresParceiroWithEmpresa[];
  selectedEmpresa: string;
}

export const IndicadoresCharts: React.FC<IndicadoresChartsProps> = ({
  filteredIndicadores,
  selectedEmpresa,
}) => {
  const { isDemoMode } = usePrivacy();

  const chartQuali = filteredIndicadores
    .sort((a, b) => b.potencial_leads - a.potencial_leads)
    .slice(0, 10)
    .map((ind) => ({
      nome: maskName(ind.empresa?.nome, isDemoMode),
      Potencial: ind.potencial_leads,
      Engajamento: ind.engajamento,
      Alinhamento: ind.alinhamento,
      "Pot. Investimento": ind.potencial_investimento,
    }));

  const chartClientes = filteredIndicadores.map((ind) => ({
    nome: maskName(ind.empresa?.nome, isDemoMode),
    "Base de Clientes": ind.base_clientes || 0,
  }));

  const maxShareValue = Math.max(...filteredIndicadores.map((i) =>
    i.share_of_wallet !== undefined && !isNaN(i.share_of_wallet) ? i.share_of_wallet : 0
  ), 0);
  
  const arredondaParaCima = (valor: number) => {
    if (valor <= 10) return 10;
    if (valor <= 20) return 20;
    if (valor <= 50) return 50;
    if (valor <= 100) return 100;
    return Math.ceil(valor / 10) * 10;
  };
  
  const maxShare = arredondaParaCima(maxShareValue);

  const chartShare = filteredIndicadores.map((ind) => ({
    nome: maskName(ind.empresa?.nome, isDemoMode),
    "Share of Wallet (%)": ind.share_of_wallet ? Number(ind.share_of_wallet.toFixed(2)) : 0,
  }));

  let radarData: { indicador: string; valor: number }[] = [];
  if (
    selectedEmpresa &&
    selectedEmpresa !== "all" &&
    filteredIndicadores.length === 1
  ) {
    const i = filteredIndicadores[0];
    radarData = [
      { indicador: "Potencial", valor: i.potencial_leads },
      { indicador: "Engajamento", valor: i.engajamento },
      { indicador: "Alinhamento", valor: i.alinhamento },
      { indicador: "Pot. Investimento", valor: i.potencial_investimento },
    ];
  }

  return (
    <>
      {!selectedEmpresa || selectedEmpresa === "all" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores Qualitativos (Top 10)</CardTitle>
              <CardDescription>
                Potencial, Engajamento, Alinhamento, Potencial de Investimento
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartQuali} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 5]} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Potencial" fill="#8884d8" />
                  <Bar dataKey="Engajamento" fill="#82ca9d" />
                  <Bar dataKey="Alinhamento" fill="#ffc658" />
                  <Bar dataKey="Pot. Investimento" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Base de Clientes</CardTitle>
              <CardDescription>
                Quantidade absoluta de clientes em cada parceiro
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartClientes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Base de Clientes" fill="#0088fe" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        filteredIndicadores.length === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Radar de Indicadores</CardTitle>
                <CardDescription>
                  Visualização dos principais indicadores qualitativos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="indicador" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      name={isDemoMode ? "" : filteredIndicadores[0].empresa?.nome}
                      dataKey="valor"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.5}
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Share of Wallet</CardTitle>
            <CardDescription>
              Percentual de clientes indicados sobre a base de cada parceiro
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartShare} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, maxShare]} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Share of Wallet (%)" fill="#a020f0" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};
