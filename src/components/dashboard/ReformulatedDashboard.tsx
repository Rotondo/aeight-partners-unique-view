
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "./DashboardCard";
import { PrivateData } from "@/components/privacy/PrivateData";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  ArrowUpDown, 
  Calendar,
  Award,
  BarChart3
} from "lucide-react";

export const ReformulatedDashboard: React.FC = () => {
  const { filteredOportunidades, isLoading } = useOportunidades();
  const stats = useDashboardStats(filteredOportunidades);

  // Cálculos derivados para indicadores mais relevantes
  const totalOportunidades = stats?.total?.total || 0;
  const oportunidadesGanhas = stats?.total?.ganho || 0;
  const oportunidadesPerdidas = stats?.total?.perdido || 0;
  const emAndamento = (stats?.total?.em_contato || 0) + (stats?.total?.negociando || 0);
  
  const taxaConversao = totalOportunidades > 0 ? ((oportunidadesGanhas / totalOportunidades) * 100) : 0;
  const taxaPerda = totalOportunidades > 0 ? ((oportunidadesPerdidas / totalOportunidades) * 100) : 0;
  
  const saldoIndicacoes = (stats?.enviadas || 0) - (stats?.recebidas || 0);
  const intraVsExtra = ((stats?.intra?.total || 0) / Math.max(1, totalOportunidades)) * 100;

  // Simulação de valores financeiros para demonstração
  const valorMedioNegocio = oportunidadesGanhas > 0 ? 85000 : 0;
  const receitaPotencial = emAndamento * 65000;
  const metaMensal = 150000;
  const realizadoMes = oportunidadesGanhas * valorMedioNegocio;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({length: 8}).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total de Oportunidades"
          value={totalOportunidades}
          icon={<Users className="h-4 w-4" />}
          color="bg-blue-500/10"
          description="Indicações registradas"
          renderValue={(value) => (
            <PrivateData type="asterisk">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="Taxa de Conversão"
          value={`${taxaConversao.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          color="bg-green-500/10"
          description="Oportunidades convertidas"
          renderValue={(value) => (
            <PrivateData type="blur">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="Valor Médio por Negócio"
          value={`R$ ${(valorMedioNegocio / 1000).toFixed(0)}K`}
          icon={<DollarSign className="h-4 w-4" />}
          color="bg-emerald-500/10"
          description="Ticket médio dos fechamentos"
          renderValue={(value) => (
            <PrivateData type="currency">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="Receita Potencial"
          value={`R$ ${(receitaPotencial / 1000).toFixed(0)}K`}
          icon={<Target className="h-4 w-4" />}
          color="bg-amber-500/10"
          description="Em andamento estimado"
          renderValue={(value) => (
            <PrivateData type="currency">
              {value}
            </PrivateData>
          )}
        />
      </div>

      {/* Indicadores Secundários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Saldo de Indicações"
          value={saldoIndicacoes > 0 ? `+${saldoIndicacoes}` : saldoIndicacoes.toString()}
          icon={<ArrowUpDown className="h-4 w-4" />}
          color={saldoIndicacoes >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
          description="Enviadas vs Recebidas"
          renderValue={(value) => (
            <PrivateData type="asterisk">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="% Intragrupo"
          value={`${intraVsExtra.toFixed(1)}%`}
          icon={<BarChart3 className="h-4 w-4" />}
          color="bg-purple-500/10"
          description="Relação intra vs extra"
          renderValue={(value) => (
            <PrivateData type="blur">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="Meta vs Realizado"
          value={`${((realizadoMes / metaMensal) * 100).toFixed(0)}%`}
          icon={<Award className="h-4 w-4" />}
          color="bg-indigo-500/10"
          description={`R$ ${(realizadoMes / 1000).toFixed(0)}K / R$ ${(metaMensal / 1000).toFixed(0)}K`}
          renderValue={(value) => (
            <PrivateData type="blur">
              {value}
            </PrivateData>
          )}
        />

        <DashboardCard
          title="Oportunidades Ativas"
          value={emAndamento}
          icon={<Calendar className="h-4 w-4" />}
          color="bg-orange-500/10"
          description="Em contato + negociando"
          renderValue={(value) => (
            <PrivateData type="asterisk">
              {value}
            </PrivateData>
          )}
        />
      </div>

      {/* Cards de Detalhamento */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ganhas:</span>
              <PrivateData type="asterisk">
                <span className="font-medium text-green-600">{oportunidadesGanhas}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Perdidas:</span>
              <PrivateData type="asterisk">
                <span className="font-medium text-red-600">{oportunidadesPerdidas}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Em Andamento:</span>
              <PrivateData type="asterisk">
                <span className="font-medium text-amber-600">{emAndamento}</span>
              </PrivateData>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribuição Intra/Extra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Intragrupo:</span>
              <PrivateData type="asterisk">
                <span className="font-medium">{stats?.intra?.total || 0}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Extragrupo:</span>
              <PrivateData type="asterisk">
                <span className="font-medium">{stats?.extra?.total || 0}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Proporção:</span>
              <PrivateData type="blur">
                <span className="font-medium">
                  {stats?.intra?.total && stats?.extra?.total 
                    ? `${((stats.intra.total / stats.extra.total) * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </span>
              </PrivateData>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Fluxo de Indicações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Enviadas:</span>
              <PrivateData type="asterisk">
                <span className="font-medium text-blue-600">{stats?.enviadas || 0}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Recebidas:</span>
              <PrivateData type="asterisk">
                <span className="font-medium text-green-600">{stats?.recebidas || 0}</span>
              </PrivateData>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Saldo:</span>
              <PrivateData type="asterisk">
                <span className={`font-medium ${saldoIndicacoes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {saldoIndicacoes > 0 ? `+${saldoIndicacoes}` : saldoIndicacoes}
                </span>
              </PrivateData>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
