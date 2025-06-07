
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const StatusDistributionChart: React.FC = () => {
  const { filteredOportunidades, isLoading } = useOportunidades();

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  const statusCount = filteredOportunidades.reduce((acc: any, op: any) => {
    const status = op.status || 'em_contato';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
