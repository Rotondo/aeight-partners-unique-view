
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend.isPositive ? '+' : ''}{trend.value}% em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const OportunidadesDashboards: React.FC = () => {
  // Dados simulados para demonstração
  const dashboardData = {
    totalOportunidades: 147,
    oportunidadesAbertas: 23,
    taxaConversao: 68.5,
    valorTotal: 'R$ 2.4M'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard de Oportunidades</h2>
        <p className="text-muted-foreground">
          Visão geral das oportunidades e indicadores de performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total de Oportunidades"
          value={dashboardData.totalOportunidades}
          description="Oportunidades registradas"
          icon={<Target />}
          trend={{ value: 12, isPositive: true }}
        />
        
        <DashboardCard
          title="Oportunidades Abertas"
          value={dashboardData.oportunidadesAbertas}
          description="Em andamento"
          icon={<Users />}
          trend={{ value: 8, isPositive: true }}
        />
        
        <DashboardCard
          title="Taxa de Conversão"
          value={`${dashboardData.taxaConversao}%`}
          description="Oportunidades convertidas"
          icon={<TrendingUp />}
          trend={{ value: 3.2, isPositive: true }}
        />
        
        <DashboardCard
          title="Valor Total"
          value={dashboardData.valorTotal}
          description="Valor estimado das oportunidades"
          icon={<DollarSign />}
          trend={{ value: 15.8, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades por Status</CardTitle>
            <CardDescription>
              Distribuição das oportunidades por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Em Contato</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between">
                <span>Negociando</span>
                <span className="font-medium">32</span>
              </div>
              <div className="flex justify-between">
                <span>Ganho</span>
                <span className="font-medium">58</span>
              </div>
              <div className="flex justify-between">
                <span>Perdido</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas atualizações nas oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nova oportunidade criada</span>
                <span className="text-muted-foreground">2h atrás</span>
              </div>
              <div className="flex justify-between">
                <span>Status atualizado para "Ganho"</span>
                <span className="text-muted-foreground">5h atrás</span>
              </div>
              <div className="flex justify-between">
                <span>Novo contato adicionado</span>
                <span className="text-muted-foreground">1d atrás</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
