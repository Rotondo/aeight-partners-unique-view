
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingDown, Calculator, BarChart3, Users, TrendingUp, Clock, Zap } from "lucide-react";
import { DashboardStatsSection } from "./DashboardStats";
import { OpportunitiesChart } from "./OpportunitiesChart";
import { IntraExtraAnalysis } from "./IntraExtraAnalysis";
import { MatrizIntragrupoChart } from "./MatrizIntragrupoChart";
import { MatrizParceriasChart } from "./MatrizParceriasChart";
import { QualidadeIndicacoesChart } from "./QualidadeIndicacoesChart";
import { BalancoGrupoParceriasChart } from "./BalancoGrupoParceriasChart";
import { RankingParceirosChart } from "./RankingParceirosChart";
import { PeriodIndicator } from "./PeriodIndicator";
import { ResultadosControl } from "./ResultadosControl";
import { RecebimentoAnalysis } from "./RecebimentoAnalysis";
import { MetaProbabilidadeCalculos } from "./MetaProbabilidadeCalculos";
import { OportunidadesFilter } from "@/components/oportunidades/OportunidadesFilter";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useMetas } from "@/hooks/useMetas";
import { useMetasProgress } from "@/hooks/useMetasProgress";
import { useMetaProbabilidade } from "@/hooks/useMetaProbabilidade";

// Módulos refatorados
import { AdvancedFilters } from "@/modules/filters-advanced/components/AdvancedFilters";
import { useAdvancedFilters } from "@/modules/filters-advanced/hooks/useAdvancedFilters";
import { ValuesStatusAnalysis } from "@/modules/values-analysis/components/ValuesStatusAnalysis";
import { GrupoPerformanceAnalysis } from "@/modules/grupo-performance/components/GrupoPerformanceAnalysis";
import { QuickAnswersSection } from "@/modules/quick-answers/components/QuickAnswersSection";
import { CycleTimeAnalysis } from "@/modules/cycle-time/components/CycleTimeAnalysis";

export const OportunidadesDashboards: React.FC = () => {
  const { filteredOportunidades, isLoading } = useOportunidades();
  const stats = useDashboardStats(filteredOportunidades);
  const { metas } = useMetas();
  const oportunidades = filteredOportunidades || [];
  const metasProgress = useMetasProgress(metas, oportunidades);
  const probabilidades = useMetaProbabilidade(metasProgress);

  // Hook para filtros avançados
  const { 
    filters: advancedFilters, 
    setFilters: setAdvancedFilters, 
    filteredOportunidades: finalFilteredOportunidades 
  } = useAdvancedFilters(oportunidades);

  // Indicador visual de filtro ativo
  const hasAdvancedFilters = advancedFilters.apenasEmpresasGrupo || advancedFilters.tipoRelacao !== 'todos';

  if (isLoading || !filteredOportunidades) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[250px]">
        <span className="text-muted-foreground text-lg">Carregando oportunidades...</span>
      </div>
    );
  }

  if (Array.isArray(filteredOportunidades) && filteredOportunidades.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[250px]">
        <span className="text-muted-foreground text-lg">Nenhuma oportunidade encontrada.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-4">
        <OportunidadesFilter />
        <div className="relative">
          <AdvancedFilters 
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
          />
          {hasAdvancedFilters && (
            <div className="absolute -top-2 -right-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <PeriodIndicator />
        <DashboardStatsSection stats={stats} loading={isLoading} />
      </div>

      <Tabs defaultValue="quick-answers" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="quick-answers" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Respostas Rápidas
          </TabsTrigger>
          <TabsTrigger value="quantities">Análise de Quantidades</TabsTrigger>
          <TabsTrigger value="values">Análise de Valores</TabsTrigger>
          <TabsTrigger value="grupo-performance" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Performance Grupo
          </TabsTrigger>
          <TabsTrigger value="cycle-time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tempo Ciclo
          </TabsTrigger>
          <TabsTrigger value="recebimento" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Recebimento
          </TabsTrigger>
          <TabsTrigger value="metas" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Probabilidade Metas
          </TabsTrigger>
          <TabsTrigger value="resultados" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Controle de Resultados
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick-answers" className="space-y-6">
          <QuickAnswersSection oportunidades={finalFilteredOportunidades} />
        </TabsContent>
        
        <TabsContent value="quantities" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Oportunidades por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OpportunitiesChart stats={stats} loading={isLoading} />
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
          <ValuesStatusAnalysis oportunidades={finalFilteredOportunidades} />
        </TabsContent>

        <TabsContent value="grupo-performance" className="space-y-6">
          <GrupoPerformanceAnalysis oportunidades={finalFilteredOportunidades} />
        </TabsContent>

        <TabsContent value="cycle-time" className="space-y-6">
          <CycleTimeAnalysis oportunidades={finalFilteredOportunidades} />
        </TabsContent>

        <TabsContent value="recebimento" className="space-y-6">
          <RecebimentoAnalysis />
        </TabsContent>

        <TabsContent value="metas" className="space-y-6">
          <MetaProbabilidadeCalculos probabilidades={probabilidades} />
        </TabsContent>

        <TabsContent value="resultados" className="space-y-6">
          <ResultadosControl />
        </TabsContent>
      </Tabs>
    </div>
  );
};
