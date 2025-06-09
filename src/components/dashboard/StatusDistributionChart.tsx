import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

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

  // Calcula a contagem de cada status
  const statusCount = React.useMemo(() => {
    const count: Record<string, number> = {};
    filteredOportunidades.forEach((op) => {
      const status = op.status || 'indefinido';
      count[status] = (count[status] || 0) + 1;
    });
    return count;
  }, [filteredOportunidades]);

  // Monta array para o gráfico, separando conhecidos e "outros"
  const statusData = React.useMemo(() => {
    const data: { key: string; name: string; value: number; color: string }[] = [];

    // Status conhecidos
    Object.keys(STATUS_LABELS).forEach((status) => {
      if (statusCount[status] > 0) {
        data.push({
          key: status,
          name: STATUS_LABELS[status],
          value: statusCount[status],
          color: STATUS_COLORS[status],
        });
      }
    });

    // Status não mapeados (outros)
    Object.keys(statusCount).forEach((status) => {
      if (!(status in STATUS_LABELS) && statusCount[status] > 0) {
        data.push({
          key: status,
          name: status,
          value: statusCount[status],
          color: OTHER_STATUS_COLOR,
        });
      }
    });

    return data;
  }, [statusCount]);

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
