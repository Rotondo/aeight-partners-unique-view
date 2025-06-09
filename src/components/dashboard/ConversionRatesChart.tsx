
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ConversionRatesChart: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const conversionData = React.useMemo(() => {
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

      const taxaConversao = total > 0 ? ((ganhas / total) * 100) : 0;
      const taxaPerda = total > 0 ? ((perdidas / total) * 100) : 0;

      return {
        mes: format(month, 'MMM/yy', { locale: ptBR }),
        total,
        ganhas,
        perdidas,
        emAndamento,
        taxaConversao: Number(taxaConversao.toFixed(1)),
        taxaPerda: Number(taxaPerda.toFixed(1))
      };
    });
  }, [filteredOportunidades]);

  if (conversionData.every(data => data.total === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">Nenhuma oportunidade encontrada nos últimos 6 meses</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={conversionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value, name) => [
              `${value}%`, 
              name === 'taxaConversao' ? 'Taxa de Conversão' : 'Taxa de Perda'
            ]}
            labelFormatter={(label) => `Mês: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="taxaConversao" 
            name="Taxa de Conversão" 
            fill="#10b981" 
          />
          <Bar 
            dataKey="taxaPerda" 
            name="Taxa de Perda" 
            fill="#ef4444" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
