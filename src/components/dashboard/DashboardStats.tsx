
import React from 'react';
import { AreaChart, Zap } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { DashboardStats as DashboardStatsType } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  loading: boolean;
}

export const DashboardStatsSection: React.FC<DashboardStatsProps> = ({ 
  stats, 
  loading 
}) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <DashboardCard 
      title="Total de Oportunidades" 
      value={loading ? "..." : (stats?.totalOportunidades || 0)} 
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
      value={loading ? "..." : (stats?.oportunidadesGanhas || 0)} 
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
      value={loading ? "..." : (stats?.oportunidadesPerdidas || 0)} 
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
      value={loading ? "..." : (stats?.oportunidadesEmAndamento || 0)} 
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
