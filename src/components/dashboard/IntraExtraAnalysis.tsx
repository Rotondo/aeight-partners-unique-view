import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { PrivateData } from '@/components/privacy/PrivateData';

// Gera uma lista dos status únicos presentes no conjunto de oportunidades
function getAllStatuses(oportunidades: any[]): string[] {
  const statusSet = new Set<string>();
  oportunidades.forEach(op => {
    if (op.status && typeof op.status === "string") statusSet.add(op.status);
  });
  return Array.from(statusSet);
}

export const IntraExtraAnalysis: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  // Descobrir todos os status para garantir que todos aparecem no gráfico
  const allStatuses = React.useMemo(
    () => getAllStatuses(filteredOportunidades),
    [filteredOportunidades]
  );

  // Mapeia oportunidades por grupo e status
  const analysisData = React.useMemo(() => {
    const statsByGroup = (tipo: 'intragrupo' | 'extragrupo') => {
      // Filtra oportunidades do grupo
      const groupOportunidades = filteredOportunidades.filter(op =>
        tipo === "intragrupo"
          ? op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'
          : !(op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo')
      );

      // Conta por status
      const counts: Record<string, number> = {};
      allStatuses.forEach(status => {
        counts[status] = groupOportunidades.filter(op => op.status === status).length;
      });

      // Total
      counts.total = groupOportunidades.length;

      return counts;
    };

    const intra = statsByGroup("intragrupo");
    const extra = statsByGroup("extragrupo");

    return {
      quantidades: [
        { name: "Intragrupo", ...intra },
        { name: "Extragrupo", ...extra }
      ],
      valores: [
        {
          name: "Intragrupo",
          valor: filteredOportunidades
            .filter(op => op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo')
            .reduce((sum, op) => sum + (op.valor || 0), 0)
        },
        {
          name: "Extragrupo",
          valor: filteredOportunidades
            .filter(op => !(op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'))
            .reduce((sum, op) => sum + (op.valor || 0), 0)
        }
      ],
      conversao: [
        {
          name: "Intragrupo",
          taxa: intra.ganho && intra.total ? (intra.ganho / intra.total) * 100 : 0
        },
        {
          name: "Extragrupo",
          taxa: extra.ganho && extra.total ? (extra.ganho / extra.total) * 100 : 0
        }
      ]
    };
  }, [filteredOportunidades, allStatuses]);

  // Paleta de cores para barras (padrão + dinâmico)
  const STATUS_COLORS: Record<string, string> = {
    ganho: "#22c55e",
    perdido: "#ef4444",
    em_contato: "#3b82f6",
    negociando: "#fbbf24",
    contato: "#6366f1",
    apresentado: "#8b5cf6",
    "sem_contato": "#64748b",
    // fallback: outras cores automáticas
  };
  const dynamicColors = ["#2563eb", "#14b8a6", "#eab308", "#a21caf", "#f472b6", "#0ea5e9", "#facc15", "#10b981"];

  // Para pie chart
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
                {/* Gera uma barra para cada status encontrado */}
                {allStatuses.map((status, idx) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    name={status.charAt(0).toUpperCase() + status.slice(1)}
                    fill={STATUS_COLORS[status] || dynamicColors[idx % dynamicColors.length]}
                    stackId="a"
                  />
                ))}
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
