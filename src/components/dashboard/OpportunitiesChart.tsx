
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { APP_CONFIG } from '@/lib/constants';

interface OpportunitiesChartProps {
  stats: any;
  loading: boolean;
}

export const OpportunitiesChart: React.FC<OpportunitiesChartProps> = ({ 
  stats, 
  loading 
}) => {
  const { filteredOportunidades } = useOportunidades();

  const monthlyData = React.useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthOportunidades = filteredOportunidades.filter(op => {
        const dataIndicacao = parseISO(op.data_indicacao);
        return dataIndicacao >= monthStart && dataIndicacao <= monthEnd;
      });

      const total = monthOportunidades.length;
      const ganhas = monthOportunidades.filter(op => op.status === 'ganho').length;
      const perdidas = monthOportunidades.filter(op => op.status === 'perdido').length;
      const emAndamento = monthOportunidades.filter(op => 
        op.status === 'em_contato' || op.status === 'negociando'
      ).length;

      return {
        mes: format(month, 'MMM/yy', { locale: ptBR }),
        total,
        ganhas,
        perdidas,
        emAndamento
      };
    });
  }, [filteredOportunidades]);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div style={{ height: APP_CONFIG.DEFAULTS.CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" fill={APP_CONFIG.CHART_COLORS.PURPLE} name="Total" />
          <Bar dataKey="ganhas" fill={APP_CONFIG.CHART_COLORS.SUCCESS} name="Ganhas" />
          <Bar dataKey="perdidas" fill={APP_CONFIG.CHART_COLORS.DANGER} name="Perdidas" />
          <Bar dataKey="emAndamento" fill={APP_CONFIG.CHART_COLORS.WARNING} name="Em Andamento" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
