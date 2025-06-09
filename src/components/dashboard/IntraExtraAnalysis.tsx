import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { PrivateData } from '@/components/privacy/PrivateData';

// Lista de status padrão na ordem desejada
const STATUS_ORDER = ["ganho", "perdido", "em_contato", "negociando", "contato", "apresentado", "sem_contato"];

const STATUS_LABELS: Record<string, string> = {
  ganho: "Ganha",
  perdido: "Perdida",
  em_contato: "Em Contato",
  negociando: "Negociando",
  contato: "Contato",
  apresentado: "Apresentado",
  sem_contato: "Sem Contato"
};

const STATUS_COLORS: Record<string, string> = {
  ganho: "#22c55e",
  perdido: "#ef4444",
  em_contato: "#3b82f6",
  negociando: "#fbbf24",
  contato: "#6366f1",
  apresentado: "#8b5cf6",
  sem_contato: "#64748b"
};

const DYNAMIC_COLORS = [
  "#2563eb", "#14b8a6", "#a21caf", "#eab308", "#f472b6", "#0ea5e9", "#facc15", "#10b981"
];

// Descobre todos os status únicos presentes nos dados, mantendo a ordem dos padrões primeiro
function getAllStatuses(oportunidades: any[]): string[] {
  const uniqueStatuses = Array.from(new Set(oportunidades.map(op => op.status).filter(Boolean)));
  const ordered = STATUS_ORDER.filter(status => uniqueStatuses.includes(status));
  const extras = uniqueStatuses.filter(status => !STATUS_ORDER.includes(status));
  return [...ordered, ...extras];
}

export const IntraExtraAnalysis: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();

  // Descobrir todos os status para garantir que todos aparecem no gráfico, ordem fixa
  const allStatuses = React.useMemo(
    () => getAllStatuses(filteredOportunidades),
    [filteredOportunidades]
  );

  // Monta os dados de contagem para cada grupo
  const groupStats = React.useMemo(() => {
    function statsFor(tipo: "intragrupo" | "extragrupo") {
      const ops = filteredOportunidades.filter(op =>
        tipo === "intragrupo"
          ? op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'
          : !(op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo')
      );
      const statusCounts: Record<string, number> = {};
      allStatuses.forEach(status => {
        statusCounts[status] = ops.filter(op => op.status === status).length;
      });
      return {
        statusCounts,
        total: ops.length
      };
    }
    return {
      intra: statsFor("intragrupo"),
      extra: statsFor("extragrupo")
    };
  }, [filteredOportunidades, allStatuses]);

  // Dados para o gráfico de barras
  const quantidadesData = [
    {
      name: "Intragrupo",
      ...groupStats.intra.statusCounts
    },
    {
      name: "Extragrupo",
      ...groupStats.extra.statusCounts
    }
  ];

  // Pie chart
  const pieData = [
    { name: 'Intragrupo', value: groupStats.intra.total, color: '#3b82f6' },
    { name: 'Extragrupo', value: groupStats.extra.total, color: '#10b981' }
  ];

  // Valores
  const valoresData = [
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
  ];

  // Conversao
  function taxaConversao(stats: { statusCounts: Record<string, number>, total: number }) {
    // Considera "ganho" como conversão
    return stats.total > 0 && stats.statusCounts.ganho
      ? (stats.statusCounts.ganho / stats.total) * 100
      : 0;
  }
  const conversaoData = [
    {
      name: "Intragrupo",
      taxa: taxaConversao(groupStats.intra)
    },
    {
      name: "Extragrupo",
      taxa: taxaConversao(groupStats.extra)
    }
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
          <div className="flex justify-between mb-2 text-sm font-bold text-muted-foreground">
            <span>Total Intragrupo: {groupStats.intra.total}</span>
            <span>Total Extragrupo: {groupStats.extra.total}</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quantidadesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                {allStatuses.map((status, idx) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    name={STATUS_LABELS[status] || status.charAt(0).toUpperCase() + status.slice(1)}
                    fill={STATUS_COLORS[status] || DYNAMIC_COLORS[idx % DYNAMIC_COLORS.length]}
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
          <div className="flex justify-between mb-2 text-sm font-bold text-muted-foreground">
            <span>
              Valor Total Intragrupo: <PrivateData type="currency">{formatCurrency(valoresData[0].valor)}</PrivateData>
            </span>
            <span>
              Valor Total Extragrupo: <PrivateData type="currency">{formatCurrency(valoresData[1].valor)}</PrivateData>
            </span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valoresData}>
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
              <BarChart data={conversaoData}>
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
