import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Oportunidade } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';
import { useGrupoPerformance } from '../hooks/useGrupoPerformance';
import { TooltipHelper } from '@/components/dashboard/TooltipHelper';
import { Info, AlertCircle, TrendingUp, Target } from 'lucide-react';

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

  // Exibe todas as empresas do grupo que tenham ticket médio > 0 (ao menos uma oportunidade com valor)
  const dadosValidosGrafico = analysis.empresasPerformance.filter(emp =>
    emp.ticketMedioGeral > 0 || emp.ticketMedioIntra > 0 || emp.ticketMedioExtra > 0
  );

  // Tooltip customizado para o gráfico
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const empresa = analysis.empresasPerformance.find(emp => emp.empresa === label);
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <PrivateData type="currency">{formatCurrency(entry.value)}</PrivateData>
            </p>
          ))}
          {empresa && (
            <div className="text-xs text-gray-600 mt-2">
              <p>Total oportunidades: <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData></p>
              <p>Oportunidades com valor: <PrivateData type="asterisk">{empresa.qualidadeDados.totalComValor}</PrivateData></p>
              <p>Oportunidades ganhas: <PrivateData type="asterisk">{empresa.oportunidadesGanhas}</PrivateData></p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Indicador de Qualidade Geral */}
      {analysis.qualidadeGeral.totalOportunidadesComValor < 20 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            <strong>Atenção:</strong> Dados baseados em apenas {analysis.qualidadeGeral.totalOportunidadesComValor} oportunidades com valor. 
            Rankings podem não ser representativos. {analysis.qualidadeGeral.empresasComAmostraMinima} empresas do grupo com pelo menos uma oportunidade com valor.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Performance por Empresa do Grupo
            <TooltipHelper 
              content={
                <>
                  <div>
                    <b>Cálculo:</b><br/>
                    <ul className="list-disc ml-4">
                      <li>Ticket médio intra: média de valor das oportunidades com valor (&gt; 0), cuja origem é uma empresa do grupo.</li>
                      <li>Ticket médio extra: média de valor das oportunidades com valor (&gt; 0), cuja origem é um parceiro externo.</li>
                      <li>Ticket médio geral: média de valor de todas as oportunidades com valor (&gt; 0) para cada empresa do grupo.</li>
                    </ul>
                    <b>Regras:</b>
                    <ul className="list-disc ml-4">
                      <li>Inclui <b>todas</b> as empresas do grupo que possuem ao menos uma oportunidade com valor (&gt; 0) no período filtrado.</li>
                      <li>Não há restrição de quantidade mínima de oportunidades.</li>
                    </ul>
                  </div>
                </>
              }
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dadosValidosGrafico.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-center">
              <div>
                <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhuma empresa do grupo com dados suficientes</p>
                <p className="text-sm text-gray-500">Necessário ao menos uma oportunidade com valor</p>
              </div>
            </div>
          ) : (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosValidosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="empresa" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ticketMedioIntra" fill="#3b82f6" name="Ticket Médio Intra" />
                  <Bar dataKey="ticketMedioExtra" fill="#10b981" name="Ticket Médio Extra" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking por Ticket Médio
              <TooltipHelper content={
                <>
                  <div>
                    <b>Cálculo:</b>
                    <ul className="list-disc ml-4">
                      <li>Empresas do grupo ordenadas por ticket médio geral (média de valor de todas as oportunidades com valor &gt; 0 para a empresa).</li>
                    </ul>
                    <b>Regras:</b>
                    <ul className="list-disc ml-4">
                      <li>Inclui <b>todas</b> as empresas do grupo que possuem ao menos uma oportunidade com valor (&gt; 0) no período filtrado.</li>
                      <li>Não há restrição de quantidade mínima de oportunidades.</li>
                    </ul>
                  </div>
                </>
              }/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.rankingTicketMedio.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma empresa com dados suficientes</p>
                  <p className="text-xs">Necessário ao menos uma oportunidade com valor</p>
                </div>
              ) : (
                analysis.rankingTicketMedio.slice(0, 10).map((empresa, index) => (
                  <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {empresa.empresa}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <PrivateData type="asterisk">{empresa.qualidadeDados.totalComValor}</PrivateData> ops com valor
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        <PrivateData type="currency">
                          {formatCurrency(empresa.ticketMedioGeral)}
                        </PrivateData>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData> total
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ranking por Conversão
              <TooltipHelper content={
                <>
                  <div>
                    <b>Cálculo:</b>
                    <ul className="list-disc ml-4">
                      <li>Taxa de conversão = <b>oportunidades ganhas ÷ oportunidades criadas</b> para cada empresa do grupo.</li>
                      <li>Exemplo: 10 ganhas de 30 → 33,3%.</li>
                    </ul>
                    <b>Regras:</b>
                    <ul className="list-disc ml-4">
                      <li>Inclui <b>todas</b> as empresas do grupo com pelo menos uma oportunidade criada no período filtrado.</li>
                      <li>Não há restrição de quantidade mínima de oportunidades.</li>
                    </ul>
                  </div>
                </>
              }/>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.rankingConversao.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma empresa com dados suficientes</p>
                  <p className="text-xs">Necessário ao menos uma oportunidade criada</p>
                </div>
              ) : (
                analysis.rankingConversao.slice(0, 10).map((empresa, index) => (
                  <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{empresa.empresa}</div>
                        <div className="text-sm text-muted-foreground">
                          <PrivateData type="asterisk">{empresa.oportunidadesGanhas}</PrivateData> ganhas de <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        <PrivateData type="blur">
                          {empresa.taxaConversao.toFixed(1)}%
                        </PrivateData>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ticket: <PrivateData type="currency">{formatCurrency(empresa.ticketMedioGeral)}</PrivateData>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Qualidade dos Dados */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                <PrivateData type="asterisk">{analysis.qualidadeGeral.totalEmpresas}</PrivateData>
              </div>
              <div className="text-sm text-gray-600">Empresas analisadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                <PrivateData type="asterisk">{analysis.qualidadeGeral.empresasComAmostraMinima}</PrivateData>
              </div>
              <div className="text-sm text-gray-600">Com ao menos 1 op. com valor</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                <PrivateData type="asterisk">{analysis.qualidadeGeral.totalOportunidadesComValor}</PrivateData>
              </div>
              <div className="text-sm text-gray-600">Ops com valor</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                <PrivateData type="asterisk">{analysis.qualidadeGeral.totalGanhasComValor}</PrivateData>
              </div>
              <div className="text-sm text-gray-600">Ganhas com valor</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
