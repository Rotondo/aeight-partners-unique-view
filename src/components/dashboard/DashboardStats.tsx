import React from 'react';
import { AreaChart, Zap } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { DashboardStats as DashboardStatsType } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  loading: boolean;
}

// Garante compatibilidade com o formato retornado por useDashboardStats
function resolveStats(stats: DashboardStatsType | null) {
  // stats pode ser nulo ou no formato antigo (campos simples)
  if (!stats) {
    return {
      totalOportunidades: 0,
      oportunidadesGanhas: 0,
      oportunidadesPerdidas: 0,
      oportunidadesEmAndamento: 0,
    };
  }
  // Se vier no formato novo (DashboardStats)
  if ("total" in stats && typeof stats.total === "object") {
    const total = stats.total;
    return {
      totalOportunidades: total?.total ?? 0,
      oportunidadesGanhas: total?.ganho ?? 0,
      oportunidadesPerdidas: total?.perdido ?? 0,
      oportunidadesEmAndamento: (total?.em_contato ?? 0) + (total?.negociando ?? 0),
    };
  }
  // Fallback: formato antigo
  return {
    totalOportunidades: (stats as any)?.totalOportunidades || 0,
    oportunidadesGanhas: (stats as any)?.oportunidadesGanhas || 0,
    oportunidadesPerdidas: (stats as any)?.oportunidadesPerdidas || 0,
    oportunidadesEmAndamento: (stats as any)?.oportunidadesEmAndamento || 0,
  };
}

export const DashboardStatsSection: React.FC<DashboardStatsProps> = ({ 
  stats, 
  loading 
}) => {
  const {
    totalOportunidades,
    oportunidadesGanhas,
    oportunidadesPerdidas,
    oportunidadesEmAndamento
  } = resolveStats(stats);

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
