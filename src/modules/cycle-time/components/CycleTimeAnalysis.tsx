
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Oportunidade } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';
import { useCycleTimeAnalysis } from '../hooks/useCycleTimeAnalysis';
import { TooltipHelper } from '@/components/dashboard/TooltipHelper';

interface CycleTimeAnalysisProps {
  oportunidades: Oportunidade[];
}

export const CycleTimeAnalysis: React.FC<CycleTimeAnalysisProps> = ({
  oportunidades
}) => {
  const analysis = useCycleTimeAnalysis(oportunidades);

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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Oportunidades em Aberto
              <TooltipHelper content="Total de oportunidades com status 'em_contato' ou 'negociando' para empresas do grupo" />
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="asterisk">
                {analysis.totalEmAndamento}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Necessitam acompanhamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Tempo Médio de Ciclo
              <TooltipHelper content="Tempo médio entre abertura e fechamento de oportunidades (considerando apenas as fechadas)" />
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="blur">
                {analysis.tempoMedioGeral} dias
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Ciclo geral do grupo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Empresas Analisadas
              <TooltipHelper content="Número de empresas do grupo com oportunidades fechadas ou em andamento" />
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.totalEmpresasAnalisadas}
            </div>
            <p className="text-xs text-muted-foreground">
              Com dados de ciclo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada por Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Análise de Ciclo por Empresa
            <TooltipHelper content="Tempo de fechamento, quantidade de oportunidades e ticket médio por empresa do grupo" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.metrics.map((metric, index) => (
              <div key={metric.empresa} className="flex justify-between items-center p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <div className="font-medium">{metric.empresa}</div>
                    <div className="text-sm text-muted-foreground">
                      <PrivateData type="asterisk">{metric.oportunidadesFechadas}</PrivateData> fechadas • {' '}
                      <PrivateData type="asterisk">{metric.emAndamento}</PrivateData> em aberto
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
                  <div>
                    <div className="text-sm text-muted-foreground">Tempo Médio</div>
                    <div className="font-medium">
                      <PrivateData type="blur">
                        {metric.tempoMedio} dias
                      </PrivateData>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Min/Max</div>
                    <div className="font-medium">
                      <PrivateData type="blur">
                        {metric.tempoMinimo}/{metric.tempoMaximo}
                      </PrivateData>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Mediana</div>
                    <div className="font-medium">
                      <PrivateData type="blur">
                        {metric.tempoMediana} dias
                      </PrivateData>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ticket Médio</div>
                    <div className="font-medium">
                      <PrivateData type="currency">
                        {formatCurrency(metric.ticketMedio)}
                      </PrivateData>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {analysis.metrics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma oportunidade fechada encontrada para análise de ciclo
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
