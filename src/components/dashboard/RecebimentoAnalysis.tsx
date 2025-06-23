
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { useRecebimentoAnalysis } from '@/hooks/useRecebimentoAnalysis';
import { PrivateData } from '@/components/privacy/PrivateData';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const RecebimentoAnalysis: React.FC = () => {
  const { filteredOportunidades } = useOportunidades();
  const analysis = useRecebimentoAnalysis(filteredOportunidades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebidas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="asterisk">{analysis.totalRecebidas}</PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Oportunidades de fora para dentro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="currency">{formatCurrency(analysis.valorTotal)}</PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Soma de todas as oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="currency">{formatCurrency(analysis.ticketMedio)}</PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Valor médio por oportunidade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parceiros Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="asterisk">{analysis.porParceiro.length}</PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas que enviaram oportunidades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Parceiros por Valor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.porParceiro.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      <PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>,
                      'Valor Total'
                    ]}
                  />
                  <Bar dataKey="valor" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Médio por Parceiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.porParceiro.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      <PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>,
                      'Ticket Médio'
                    ]}
                  />
                  <Bar dataKey="ticketMedio" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.porStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percentual }) => `${status} (${percentual.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {analysis.porStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <CardTitle>Tendência Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analysis.tendenciaMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis 
                    yAxisId="quantidade" 
                    orientation="left"
                  />
                  <YAxis 
                    yAxisId="ticket" 
                    orientation="right"
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Ticket Médio') {
                        return [<PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>, name];
                      }
                      return [<PrivateData key="value" type="asterisk">{value}</PrivateData>, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="quantidade" dataKey="quantidade" fill="#3b82f6" name="Quantidade" />
                  <Line 
                    yAxisId="ticket" 
                    type="monotone" 
                    dataKey="ticketMedio" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Ticket Médio"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
