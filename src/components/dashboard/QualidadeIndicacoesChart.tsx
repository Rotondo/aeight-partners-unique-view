
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const QualidadeIndicacoesChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const qualidadeData = React.useMemo(() => {
    const statusCount = filteredOportunidades.reduce((acc, op) => {
      const status = op.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels: Record<string, string> = {
      'em_contato': 'Em Contato',
      'negociando': 'Negociando',
      'ganho': 'Convertidas',
      'perdido': 'Perdidas'
    };

    const colors = {
      'em_contato': '#3b82f6',
      'negociando': '#f59e0b',
      'ganho': '#10b981',
      'perdido': '#ef4444'
    };

    const total = Object.values(statusCount).reduce((sum, count) => sum + count, 0);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      color: colors[status as keyof typeof colors] || '#6b7280'
    }));
  }, [filteredOportunidades]);

  if (qualidadeData.length === 0) {
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
            data={qualidadeData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {qualidadeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} oportunidades`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
