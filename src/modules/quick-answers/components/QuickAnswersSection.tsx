
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
  AlertCircle,
  Info
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
        <TooltipHelper content="Perguntas frequentes sobre oportunidades respondidas automaticamente com base nos dados filtrados. Rankings consideram apenas parceiros como fontes." />
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
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Melhor Fonte
              <TooltipHelper content="Parceiro que gerou maior valor total em negócios ganhos. Empresas do grupo não aparecem neste ranking." />
            </CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {answers.melhorEmpresaOrigem?.empresa || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {answers.melhorEmpresaOrigem && (
                <PrivateData type="currency">
                  {formatCurrency(answers.melhorEmpresaOrigem.valorTotal)} gerados
                </PrivateData>
              )}
            </p>
            {answers.qualidadeDados.empresasComRankingMinimo < 3 && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600">Poucos dados</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              Maior Ticket Médio
              <TooltipHelper content="Empresa do grupo com maior valor médio em oportunidades ganhas. Mínimo 2 negócios fechados." />
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
            {answers.qualidadeDados.empresasComTicketMinimo < 2 && (
              <div className="flex items-center gap-1 mt-1">
                <Info className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-amber-600">Poucos dados</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alert de Qualidade dos Dados */}
      {(answers.qualidadeDados.totalGanhasComValor < 5 || answers.qualidadeDados.totalFiltradoParceiros < 10) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Atenção: Poucos dados disponíveis</span>
            </div>
            <div className="text-xs text-amber-700 mt-1">
              • Apenas {answers.qualidadeDados.totalGanhasComValor} oportunidades ganhas com valor
              • {answers.qualidadeDados.totalFiltradoParceiros} indicações de parceiros
              • Rankings podem não ser representativos
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings Detalhados */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Ranking de Fontes Indicadoras
              <TooltipHelper content="APENAS PARCEIROS ordenados por valor total gerado em negócios ganhos. Mínimo 3 indicações para aparecer no ranking." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {answers.rankingOrigem.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum parceiro com dados suficientes</p>
                  <p className="text-xs">Mínimo: 3 indicações</p>
                </div>
              ) : (
                answers.rankingOrigem.slice(0, 8).map((empresa, index) => (
                  <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {empresa.empresa}
                          <Badge variant="secondary" className="text-xs">
                            PARCEIRO
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <PrivateData type="asterisk">{empresa.totalOportunidades}</PrivateData> indicações
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        <PrivateData type="currency">
                          {formatCurrency(empresa.valorTotal)}
                        </PrivateData>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <PrivateData type="blur">
                          {empresa.taxaConversao.toFixed(1)}% conversão
                        </PrivateData>
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
              Ticket Médio por Empresa
              <TooltipHelper content="Empresas do grupo ordenadas por ticket médio APENAS de oportunidades ganhas com valor. Mínimo 2 negócios fechados." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {answers.ticketMedioRanking.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhuma empresa com dados suficientes</p>
                  <p className="text-xs">Mínimo: 2 negócios ganhos</p>
                </div>
              ) : (
                answers.ticketMedioRanking.slice(0, 8).map((empresa, index) => (
                  <div key={empresa.empresa} className="flex justify-between items-center p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{empresa.empresa}</div>
                        <div className="text-sm text-muted-foreground">
                          <PrivateData type="asterisk">{empresa.totalComValor}</PrivateData> negócios ganhos
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
