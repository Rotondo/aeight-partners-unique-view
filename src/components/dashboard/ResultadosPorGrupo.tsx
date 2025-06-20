
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ResultadosPorGrupo } from '@/types/metas';

interface ResultadosPorGrupoProps {
  resultados: ResultadosPorGrupo[];
}

export const ResultadosPorGrupoComponent: React.FC<ResultadosPorGrupoProps> = ({ resultados }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSegmentoLabel = (segmento: string) => {
    switch (segmento) {
      case 'intragrupo':
        return 'Intragrupo';
      case 'de_fora_para_dentro':
        return 'De Fora p/ Dentro';
      case 'tudo':
        return 'Total Geral';
      default:
        return segmento;
    }
  };

  const chartData = resultados.map(resultado => ({
    segmento: getSegmentoLabel(resultado.segmento),
    'Total': resultado.quantidade_total,
    'Ganho': resultado.quantidade_ganho,
    'Perdido': resultado.quantidade_perdido,
    'Em Andamento': resultado.quantidade_andamento
  }));

  const pieData = resultados.map(resultado => ({
    name: getSegmentoLabel(resultado.segmento),
    value: resultado.valor_total
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {resultados.map((resultado) => (
          <Card key={resultado.segmento}>
            <CardHeader>
              <CardTitle className="text-lg">
                {getSegmentoLabel(resultado.segmento)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Quantidade</p>
                  <p className="text-2xl font-bold">{resultado.quantidade_total}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(resultado.valor_total)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Conversão</span>
                  <Badge variant="outline">
                    {formatPercentage(resultado.taxa_conversao)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Ticket Médio</span>
                  <Badge variant="outline">
                    {formatCurrency(resultado.ticket_medio)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Ganhos:</span>
                  <span className="font-medium">{resultado.quantidade_ganho}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">Perdas:</span>
                  <span className="font-medium">{resultado.quantidade_perdido}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-600">Em Andamento:</span>
                  <span className="font-medium">{resultado.quantidade_andamento}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oportunidades por Segmento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segmento" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Ganho" stackId="a" fill="#22c55e" />
                <Bar dataKey="Em Andamento" stackId="a" fill="#eab308" />
                <Bar dataKey="Perdido" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
