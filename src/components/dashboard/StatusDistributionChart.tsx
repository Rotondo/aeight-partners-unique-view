
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const StatusDistributionChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const statusData = React.useMemo(() => {
    const statusCount = filteredOportunidades.reduce((acc, op) => {
      const status = op.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels: Record<string, string> = {
      'em_contato': 'Em Contato',
      'negociando': 'Negociando',
      'ganho': 'Ganho',
      'perdido': 'Perdido'
    };

    const colors = {
      'em_contato': '#3b82f6',
      'negociando': '#f59e0b',
      'ganho': '#10b981',
      'perdido': '#ef4444'
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [filteredOportunidades]);

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
