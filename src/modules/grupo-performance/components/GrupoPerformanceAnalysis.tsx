
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Oportunidade } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';
import { useGrupoPerformance } from '../hooks/useGrupoPerformance';

interface GrupoPerformanceAnalysisProps {
  oportunidades: Oportunidade[];
}

export const GrupoPerformanceAnalysis: React.FC<GrupoPerformanceAnalysisProps> = ({
  oportunidades
}) => {
  const analysis = useGrupoPerformance(oportunidades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance por Empresa do Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.empresasPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="empresa" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    <PrivateData key="value" type="currency">{formatCurrency(value)}</PrivateData>,
                    name
                  ]}
                />
                <Bar dataKey="ticketMedioIntra" fill="#3b82f6" name="Ticket Médio Intra" />
                <Bar dataKey="ticketMedioExtra" fill="#10b981" name="Ticket Médio Extra" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ranking por Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.rankingTicketMedio.slice(0, 10).map((empresa, index) => (
                <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{empresa.empresa}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      <PrivateData type="currency">
                        {formatCurrency(empresa.ticketMedioGeral)}
                      </PrivateData>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData> oportunidades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking por Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.rankingConversao.slice(0, 10).map((empresa, index) => (
                <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{empresa.empresa}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      <PrivateData type="blur">
                        {empresa.taxaConversao.toFixed(1)}%
                      </PrivateData>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <PrivateData type="asterisk">{empresa.oportunidadesGanhas}</PrivateData>/
                      <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
