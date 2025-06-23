
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Calendar, Calculator } from 'lucide-react';
import { MetaProbabilidadeData } from '@/hooks/useMetaProbabilidade';
import { PrivateData } from '@/components/privacy/PrivateData';

interface MetaProbabilidadeCalculosProps {
  probabilidades: MetaProbabilidadeData[];
}

export const MetaProbabilidadeCalculos: React.FC<MetaProbabilidadeCalculosProps> = ({
  probabilidades
}) => {
  const formatValue = (value: number, tipo: 'quantidade' | 'valor') => {
    if (tipo === 'valor') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0
      }).format(value);
    }
    return value.toString();
  };

  const getTendenciaIcon = (tendencia: 'acima' | 'dentro' | 'abaixo') => {
    switch (tendencia) {
      case 'acima':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'dentro':
        return <Target className="h-4 w-4 text-yellow-600" />;
      case 'abaixo':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getTendenciaColor = (tendencia: 'acima' | 'dentro' | 'abaixo') => {
    switch (tendencia) {
      case 'acima':
        return 'bg-green-500';
      case 'dentro':
        return 'bg-yellow-500';
      case 'abaixo':
        return 'bg-red-500';
    }
  };

  if (probabilidades.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma meta com dados para cálculo de probabilidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {probabilidades.map((prob) => (
        <Card key={prob.meta.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTendenciaIcon(prob.tendencia)}
                  {prob.meta.nome}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">{prob.meta.tipo_meta}</Badge>
                  <Badge variant="outline">{prob.meta.periodo}</Badge>
                  <Badge 
                    variant="outline"
                    className={`text-white ${getTendenciaColor(prob.tendencia)}`}
                  >
                    {prob.probabilidadeAtingimento.toFixed(1)}% de probabilidade
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso da Meta</span>
                  <span>
                    <PrivateData type="blur">
                      {formatValue(prob.realizado, prob.meta.tipo_meta)} / {formatValue(prob.meta.valor_meta, prob.meta.tipo_meta)}
                    </PrivateData>
                  </span>
                </div>
                <Progress value={Math.min((prob.realizado / prob.meta.valor_meta) * 100, 100)} />
              </div>

              {/* Métricas de Tempo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Dias Passados</span>
                  </div>
                  <div className="text-lg font-bold">
                    <PrivateData type="asterisk">{prob.diasPassados}</PrivateData>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Dias Restantes</span>
                  </div>
                  <div className="text-lg font-bold">
                    <PrivateData type="asterisk">{prob.diasRestantes}</PrivateData>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Média Atual/Dia</span>
                  </div>
                  <div className="text-lg font-bold">
                    <PrivateData type="blur">
                      {formatValue(prob.mediaDiariaAtual, prob.meta.tipo_meta)}
                    </PrivateData>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Necessária/Dia</span>
                  </div>
                  <div className="text-lg font-bold">
                    <PrivateData type="blur">
                      {formatValue(prob.mediaDiariaNecessaria, prob.meta.tipo_meta)}
                    </PrivateData>
                  </div>
                </div>
              </div>

              {/* Projeções */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Projeções e Análise
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Projeção Final:</span>
                    <div className="font-bold">
                      <PrivateData type="blur">
                        {formatValue(prob.projecaoFinal, prob.meta.tipo_meta)}
                      </PrivateData>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Falta para Meta:</span>
                    <div className="font-bold">
                      <PrivateData type="blur">
                        {formatValue(prob.faltaParaMeta, prob.meta.tipo_meta)}
                      </PrivateData>
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ritmo Necessário:</span>
                    <div className="font-bold">
                      {prob.diasRestantes > 0 ? (
                        <PrivateData type="blur">
                          {formatValue(prob.faltaParaMeta / prob.diasRestantes, prob.meta.tipo_meta)}/dia
                        </PrivateData>
                      ) : (
                        'Meta finalizada'
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendações */}
              {prob.tendencia === 'abaixo' && prob.diasRestantes > 0 && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <div className="text-red-800 text-sm">
                    <strong>⚠️ Atenção:</strong> Para atingir a meta, é necessário aumentar o ritmo para{' '}
                    <PrivateData type="blur">
                      {formatValue(prob.faltaParaMeta / prob.diasRestantes, prob.meta.tipo_meta)}
                    </PrivateData>{' '}
                    por dia (atual: {formatValue(prob.mediaDiariaAtual, prob.meta.tipo_meta)}/dia).
                  </div>
                </div>
              )}

              {prob.tendencia === 'acima' && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <div className="text-green-800 text-sm">
                    <strong>✅ Excelente:</strong> Mantendo o ritmo atual, a meta será superada em{' '}
                    <PrivateData type="blur">
                      {formatValue(prob.projecaoFinal - prob.meta.valor_meta, prob.meta.tipo_meta)}
                    </PrivateData>.
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
