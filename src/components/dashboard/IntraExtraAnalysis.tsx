
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { PrivateData } from '@/components/privacy/PrivateData';

export const IntraExtraAnalysis: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  const analysisData = React.useMemo(() => {
    const intragrupo = filteredOportunidades.filter(op => 
      op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'
    );
    const extragrupo = filteredOportunidades.filter(op => 
      !(op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo')
    );

    const intraStats = {
      total: intragrupo.length,
      ganhas: intragrupo.filter(op => op.status === 'ganho').length,
      perdidas: intragrupo.filter(op => op.status === 'perdido').length,
      emAndamento: intragrupo.filter(op => ['em_contato', 'negociando'].includes(op.status)).length,
      valorTotal: intragrupo.reduce((sum, op) => sum + (op.valor || 0), 0)
    };

    const extraStats = {
      total: extragrupo.length,
      ganhas: extragrupo.filter(op => op.status === 'ganho').length,
      perdidas: extragrupo.filter(op => op.status === 'perdido').length,
      emAndamento: extragrupo.filter(op => ['em_contato', 'negociando'].includes(op.status)).length,
      valorTotal: extragrupo.reduce((sum, op) => sum + (op.valor || 0), 0)
    };

    return {
      quantidades: [
        { name: 'Intragrupo', total: intraStats.total, ganhas: intraStats.ganhas, perdidas: intraStats.perdidas, emAndamento: intraStats.emAndamento },
        { name: 'Extragrupo', total: extraStats.total, ganhas: extraStats.ganhas, perdidas: extraStats.perdidas, emAndamento: extraStats.emAndamento }
      ],
      valores: [
        { name: 'Intragrupo', valor: intraStats.valorTotal },
        { name: 'Extragrupo', valor: extraStats.valorTotal }
      ],
      conversao: [
        { 
          name: 'Intragrupo', 
          taxa: intraStats.total > 0 ? (intraStats.ganhas / intraStats.total * 100) : 0 
        },
        { 
          name: 'Extragrupo', 
          taxa: extraStats.total > 0 ? (extraStats.ganhas / extraStats.total * 100) : 0 
        }
      ]
    };
  }, [filteredOportunidades]);

  const pieData = [
    { name: 'Intragrupo', value: analysisData.quantidades[0]?.total || 0, color: '#3b82f6' },
    { name: 'Extragrupo', value: analysisData.quantidades[1]?.total || 0, color: '#10b981' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quantidades: Intragrupo vs Extragrupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.quantidades}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total" fill="#94a3b8" />
                <Bar dataKey="ganhas" name="Ganhas" fill="#22c55e" />
                <Bar dataKey="perdidas" name="Perdidas" fill="#ef4444" />
                <Bar dataKey="emAndamento" name="Em Andamento" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valores: Intragrupo vs Extragrupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.valores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    <PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>,
                    'Valor Total'
                  ]}
                />
                <Bar dataKey="valor" name="Valor Total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.conversao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Conversão']}
                />
                <Bar dataKey="taxa" name="Taxa de Conversão" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
