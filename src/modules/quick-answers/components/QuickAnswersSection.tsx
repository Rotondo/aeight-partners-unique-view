
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Building, 
  Clock,
  Award,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { Oportunidade } from '@/types';
import { PrivateData } from '@/components/privacy/PrivateData';
import { useQuickAnswers } from '../hooks/useQuickAnswers';
import { TooltipHelper } from '@/components/dashboard/TooltipHelper';

interface QuickAnswersSectionProps {
  oportunidades: Oportunidade[];
}

export const QuickAnswersSection: React.FC<QuickAnswersSectionProps> = ({
  oportunidades
}) => {
  const answers = useQuickAnswers(oportunidades);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Respostas Rápidas</h2>
        <TooltipHelper content="Perguntas frequentes sobre oportunidades respondidas automaticamente com base nos dados filtrados" />
      </div>

      {/* Cards de Respostas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Oportunidades
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="asterisk">
                {answers.totalOportunidades}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Para empresas do grupo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Em Aberto
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <PrivateData type="asterisk">
                {answers.emAberto}
              </PrivateData>
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam acompanhamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Melhor Fonte
            </CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {answers.melhorEmpresaOrigem?.empresa || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {answers.melhorEmpresaOrigem && (
                <PrivateData type="blur">
                  {answers.melhorEmpresaOrigem.taxaConversao.toFixed(1)}% conversão
                </PrivateData>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Maior Ticket Médio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {answers.empresaComMaiorTicket?.empresa || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {answers.empresaComMaiorTicket && (
                <PrivateData type="currency">
                  {formatCurrency(answers.empresaComMaiorTicket.ticketMedio)}
                </PrivateData>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Detalhados */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Ranking de Fontes Indicadoras
              <TooltipHelper content="Empresas ordenadas por qualidade das indicações (volume + taxa de conversão)" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {answers.rankingOrigem.slice(0, 8).map((empresa, index) => (
                <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {empresa.empresa}
                        <Badge variant={empresa.tipo === 'intragrupo' ? 'default' : 'secondary'} className="text-xs">
                          {empresa.tipo === 'intragrupo' ? 'IG' : empresa.tipo === 'parceiro' ? 'P' : 'C'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData> indicações
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
                      <PrivateData type="currency">
                        {formatCurrency(empresa.ticketMedio)}
                      </PrivateData>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Ticket Médio por Empresa
              <TooltipHelper content="Empresas do grupo ordenadas por ticket médio das oportunidades recebidas (apenas com valor)" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {answers.ticketMedioRanking.slice(0, 8).map((empresa, index) => (
                <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{empresa.empresa}</div>
                      <div className="text-sm text-muted-foreground">
                        <PrivateData type="asterisk">{empresa.totalComValor}</PrivateData> com valor
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      <PrivateData type="currency">
                        {formatCurrency(empresa.ticketMedio)}
                      </PrivateData>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <PrivateData type="currency">
                        Total: {formatCurrency(empresa.valorTotal)}
                      </PrivateData>
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
