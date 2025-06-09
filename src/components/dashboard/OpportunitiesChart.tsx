
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardStats } from '@/types';

interface OpportunitiesChartProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const OpportunitiesChart: React.FC<OpportunitiesChartProps> = ({ 
  stats, 
  loading 
}) => (
  <Card className="md:col-span-4">
    <CardHeader>
      <CardTitle>Oportunidades por Mês</CardTitle>
      <CardDescription>
        Indicações registradas nos últimos 6 meses
      </CardDescription>
    </CardHeader>
    <CardContent className="pl-2">
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats?.oportunidadesPorMes || []}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill="hsl(var(--primary))" name="Oportunidades" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardContent>
  </Card>
);
