import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { useDashboardStats } from '@/hooks/useDashboardStats';

// Labels e cores oficiais
const STATUS_LABELS: Record<string, string> = {
  em_contato: 'Em Contato',
  negociando: 'Negociando',
  ganho: 'Ganho',
  perdido: 'Perdido',
};
const STATUS_COLORS: Record<string, string> = {
  em_contato: '#3b82f6',
  negociando: '#f59e0b',
  ganho: '#10b981',
  perdido: '#ef4444',
};
const OTHER_STATUS_COLOR = '#6b7280';

export const StatusDistributionChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();
  const stats = useDashboardStats(filteredOportunidades);

  // Sempre inclui todos os status conhecidos (mesmo se zero). Se houver "outros", inclui também para diagnóstico.
  const statusData = React.useMemo(() => {
    const data = [
      {
        key: 'em_contato',
        name: STATUS_LABELS['em_contato'],
        value: stats.total.em_contato,
        color: STATUS_COLORS['em_contato'],
      },
      {
        key: 'negociando',
        name: STATUS_LABELS['negociando'],
        value: stats.total.negociando,
        color: STATUS_COLORS['negociando'],
      },
      {
        key: 'ganho',
        name: STATUS_LABELS['ganho'],
        value: stats.total.ganho,
        color: STATUS_COLORS['ganho'],
      },
      {
        key: 'perdido',
        name: STATUS_LABELS['perdido'],
        value: stats.total.perdido,
        color: STATUS_COLORS['perdido'],
      },
    ];

    // Adiciona status inesperados (aparece em cinza)
    if (stats.total.outros) {
      Object.entries(stats.total.outros).forEach(([status, count]) => {
        data.push({
          key: status,
          name: status,
          value: count,
          color: OTHER_STATUS_COLOR,
        });
      });
    }

    // Só mostra status com valor > 0 (evita rótulos "zeros" no gráfico)
    return data.filter(d => d.value > 0);
  }, [stats.total]);

  if (statusData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistributionChart;
