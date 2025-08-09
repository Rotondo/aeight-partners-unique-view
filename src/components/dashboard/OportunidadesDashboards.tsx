import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingDown, Calculator, Users, Clock, Zap } from "lucide-react";
import DashboardStats from "./DashboardStats";
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

// Sistema de debug
import { CalculationDebugPanel } from "@/modules/calculation-debug/components/CalculationDebugPanel";

// UI base (dropdown)
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const TAB_OPTIONS = [
  {
    value: "quick-answers",
    label: "Respostas Rápidas",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    value: "quantities",
    label: "Análise de Quantidades",
  },
  {
    value: "values",
    label: "Análise de Valores",
  },
  {
    value: "grupo-performance",
    label: "Performance Grupo",
    icon: <Users className="h-4 w-4" />,
  },
  {
    value: "cycle-time",
    label: "Tempo Ciclo",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: "recebimento",
    label: "Recebimento",
    icon: <TrendingDown className="h-4 w-4" />,
  },
  {
    value: "metas",
    label: "Probabilidade Metas",
    icon: <Calculator className="h-4 w-4" />,
  },
  {
    value: "resultados",
    label: "Controle de Resultados",
    icon: <Target className="h-4 w-4" />,
  },
];

export const OportunidadesDashboards: React.FC = () => {
  const { filteredOportunidades, isLoading } = useOportunidades();
  const stats = useDashboardStats(filteredOportunidades);
  const { metas } = useMetas();
  const oportunidades = filteredOportunidades || [];
  const metasProgress = useMetasProgress(metas, oportunidades);
  const probabilidades = useMetaProbabilidade(metasProgress);

  // Estado para controlar o painel de debug
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Tab state
  const [tab, setTab] = useState<string>(TAB_OPTIONS[0].value);

  // Hook para filtros avançados
  const {
    filters: advancedFilters,
    setFilters: setAdvancedFilters,
    filteredOportunidades: finalFilteredOportunidades,
  } = useAdvancedFilters(oportunidades);

  // Indicador visual de filtro ativo
  const hasAdvancedFilters = advancedFilters.apenasEmpresasGrupo || advancedFilters.tipoRelacao !== "todos";

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
          <AdvancedFilters filters={advancedFilters} onFiltersChange={setAdvancedFilters} />
          {hasAdvancedFilters && (
            <div className="absolute -top-2 -right-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        <PeriodIndicator />
        <DashboardStats stats={stats} loading={isLoading} />
      </div>

      {/* Tabs em desktop/tablet, Dropdown em mobile */}
      <div>
        {/* Dropdown para mobile (até md) */}
        <div className="block md:hidden mb-2">
          <label htmlFor="dashboard-tab-select" className="sr-only">Selecionar seção</label>
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger id="dashboard-tab-select" className="w-full">
              <SelectValue placeholder="Selecionar seção" />
            </SelectTrigger>
            <SelectContent>
              {TAB_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Tabs horizontais para md+ */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="hidden md:flex flex-nowrap w-full gap-x-2">
            {TAB_OPTIONS.map(option => (
              <TabsTrigger key={option.value} value={option.value} className="flex items-center gap-2 min-w-max">
                {option.icon}
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="quick-answers" className={tab === "quick-answers" ? "space-y-6 block" : "hidden"}>
            <QuickAnswersSection oportunidades={finalFilteredOportunidades} />
          </TabsContent>
          <TabsContent value="quantities" className={tab === "quantities" ? "space-y-6 block" : "hidden"}>
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
          <TabsContent value="values" className={tab === "values" ? "space-y-6 block" : "hidden"}>
            <ValuesStatusAnalysis oportunidades={finalFilteredOportunidades} />
          </TabsContent>
          <TabsContent value="grupo-performance" className={tab === "grupo-performance" ? "space-y-6 block" : "hidden"}>
            <GrupoPerformanceAnalysis oportunidades={finalFilteredOportunidades} />
          </TabsContent>
          <TabsContent value="cycle-time" className={tab === "cycle-time" ? "space-y-6 block" : "hidden"}>
            <CycleTimeAnalysis oportunidades={finalFilteredOportunidades} />
          </TabsContent>
          <TabsContent value="recebimento" className={tab === "recebimento" ? "space-y-6 block" : "hidden"}>
            <RecebimentoAnalysis />
          </TabsContent>
          <TabsContent value="metas" className={tab === "metas" ? "space-y-6 block" : "hidden"}>
            <MetaProbabilidadeCalculos probabilidades={probabilidades} />
          </TabsContent>
          <TabsContent value="resultados" className={tab === "resultados" ? "space-y-6 block" : "hidden"}>
            <ResultadosControl />
          </TabsContent>
        </Tabs>
      </div>
      {/* Painel de Debug - sempre presente mas controlado */}
      <CalculationDebugPanel
        oportunidades={finalFilteredOportunidades}
        isVisible={showDebugPanel}
        onToggle={() => setShowDebugPanel(!showDebugPanel)}
      />
    </div>
  );
};
