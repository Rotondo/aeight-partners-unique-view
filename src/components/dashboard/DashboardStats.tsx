
import React from 'react';
import { AreaChart, Zap } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { PrivateData } from '@/components/privacy/PrivateData';

interface DashboardStatsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardStatsSection: React.FC<DashboardStatsProps> = ({
  stats,
  loading
}) => {
  // Extração dos valores com fallback seguro
  const totalOportunidades = stats?.total?.total || 0;
  const oportunidadesGanhas = stats?.total?.ganho || 0;
  const oportunidadesPerdidas = stats?.total?.perdido || 0;
  const oportunidadesEmAndamento = (stats?.total?.em_contato || 0) + (stats?.total?.negociando || 0);

  // Log para diagnóstico
  if (typeof window !== "undefined" && stats) {
    console.log("[DashboardStatsSection] Valores renderizados:", {
      total: totalOportunidades,
      ganhas: oportunidadesGanhas,
      perdidas: oportunidadesPerdidas,
      emAndamento: oportunidadesEmAndamento
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <DashboardCard
        title="Total de Oportunidades"
        value={loading ? "..." : totalOportunidades}
        icon={<Zap className="h-4 w-4 text-primary" />}
        color="bg-primary/10"
        description="Total de indicações registradas"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Oportunidades Ganhas"
        value={loading ? "..." : oportunidadesGanhas}
        icon={<AreaChart className="h-4 w-4 text-green-500" />}
        color="bg-green-500/10"
        description="Negócios fechados com sucesso"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Oportunidades Perdidas"
        value={loading ? "..." : oportunidadesPerdidas}
        icon={<AreaChart className="h-4 w-4 text-destructive" />}
        color="bg-destructive/10"
        description="Negócios perdidos ou cancelados"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
      <DashboardCard
        title="Em Andamento"
        value={loading ? "..." : oportunidadesEmAndamento}
        icon={<AreaChart className="h-4 w-4 text-amber-500" />}
        color="bg-amber-500/10"
        description="Oportunidades em negociação"
        renderValue={(value) => (
          <PrivateData type="asterisk">
            {value}
          </PrivateData>
        )}
      />
    </div>
  );
};
