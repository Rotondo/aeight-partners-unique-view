
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useLazyDashboardStats } from "@/hooks/useLazyDashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  console.log('Index: Renderizando página principal otimizada');
  
  const { stats, loadStats } = useLazyDashboardStats();

  useEffect(() => {
    // Carregar apenas estatísticas básicas na inicialização
    loadStats();
  }, [loadStats]);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DemoModeIndicator />
      <div className="space-y-6">
        <QuickAccess />
        
        {/* Stats Cards Otimizadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Oportunidades</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? "..." : stats.totalOportunidades}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? "..." : stats.totalEmAndamento}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ganhos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? "..." : stats.totalGanhos}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.loading ? "..." : `R$ ${stats.valorTotalGanho.toLocaleString()}`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão para carregar dashboard completo */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Completo</CardTitle>
            <CardDescription>
              Acesse análises detalhadas e gráficos avançados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
            >
              Ver Dashboard Completo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
