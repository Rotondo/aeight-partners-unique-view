import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStatsSection } from "./DashboardStats";
import { OpportunitiesChart } from "./OpportunitiesChart";
import { ValuesFunnelAnalysis } from "./ValuesFunnelAnalysis";
import { IntraExtraAnalysis } from "./IntraExtraAnalysis";
import { MatrizIntragrupoChart } from "./MatrizIntragrupoChart";
import { MatrizParceriasChart } from "./MatrizParceriasChart";
import { QualidadeIndicacoesChart } from "./QualidadeIndicacoesChart";
import { BalancoGrupoParceriasChart } from "./BalancoGrupoParceriasChart";
import { RankingParceirosChart } from "./RankingParceirosChart";
import { StatusDistributionChart } from "./StatusDistributionChart";
import { PeriodIndicator } from "./PeriodIndicator";
import { OportunidadesFilter } from "@/components/oportunidades/OportunidadesFilter";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export const OportunidadesDashboards: React.FC = () => {
  const { filteredOportunidades, isLoading } = useOportunidades();
  const { stats, loading: statsLoading } = useDashboardStats(filteredOportunidades);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <OportunidadesFilter />
        <PeriodIndicator />
        <DashboardStatsSection stats={stats} loading={statsLoading} />
      </div>

      <Tabs defaultValue="quantities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quantities">Análise de Quantidades</TabsTrigger>
          <TabsTrigger value="values">Análise de Valores</TabsTrigger>
          <TabsTrigger value="intra-extra">Intra vs Extragrupo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quantities" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OpportunitiesChart stats={stats} loading={statsLoading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDistributionChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Matriz Intragrupo</CardTitle>
              </CardHeader>
              <CardContent>
                <MatrizIntragrupoChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Matriz Parcerias</CardTitle>
              </CardHeader>
              <CardContent>
                <MatrizParceriasChart />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Qualidade das Indicações</CardTitle>
              </CardHeader>
              <CardContent>
                <QualidadeIndicacoesChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Balanço Grupo x Parcerias</CardTitle>
              </CardHeader>
              <CardContent>
                <BalancoGrupoParceriasChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranking de Parceiros</CardTitle>
            </CardHeader>
            <CardContent>
              <RankingParceirosChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="values" className="space-y-6">
          <ValuesFunnelAnalysis />
        </TabsContent>

        <TabsContent value="intra-extra" className="space-y-6">
          <IntraExtraAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
};
