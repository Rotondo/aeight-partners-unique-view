
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { TooltipHelper, tooltipTexts } from './TooltipHelper';
import type { ResultadosPorGrupo } from '@/types/metas';

interface ResultadosPorGrupoComponentProps {
  resultados: ResultadosPorGrupo[];
}

export const ResultadosPorGrupoComponent: React.FC<ResultadosPorGrupoComponentProps> = ({ resultados }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSegmentoName = (segmento: string) => {
    switch (segmento) {
      case 'intragrupo':
        return 'Intragrupo';
      case 'de_fora_para_dentro':
        return 'De Fora para Dentro';
      case 'tudo':
        return 'Todos os Segmentos';
      default:
        return segmento;
    }
  };

  const getSegmentoIcon = (segmento: string) => {
    switch (segmento) {
      case 'intragrupo':
        return <Users className="h-5 w-5" />;
      case 'de_fora_para_dentro':
        return <TrendingUp className="h-5 w-5" />;
      case 'tudo':
        return <Target className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  if (resultados.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum resultado encontrado</p>
            <p className="text-sm">Verifique os filtros aplicados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {resultados.map((resultado) => (
        <Card key={resultado.segmento}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getSegmentoIcon(resultado.segmento)}
              {getSegmentoName(resultado.segmento)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quantidade */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">Quantidade</h4>
                  <TooltipHelper content={tooltipTexts.grupo.quantidadeTotal} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-medium">{resultado.quantidade_total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ganho</span>
                    <span className="font-medium text-green-600">{resultado.quantidade_ganho}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Perdido</span>
                    <span className="font-medium text-red-600">{resultado.quantidade_perdido}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Andamento</span>
                    <span className="font-medium text-blue-600">{resultado.quantidade_andamento}</span>
                  </div>
                </div>
              </div>

              {/* Valor */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">Valor</h4>
                  <TooltipHelper content={tooltipTexts.grupo.valorTotal} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total</span>
                    <span className="font-medium">{formatCurrency(resultado.valor_total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ganho</span>
                    <span className="font-medium text-green-600">{formatCurrency(resultado.valor_ganho)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Perdido</span>
                    <span className="font-medium text-red-600">{formatCurrency(resultado.valor_perdido)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Andamento</span>
                    <span className="font-medium text-blue-600">{formatCurrency(resultado.valor_andamento)}</span>
                  </div>
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">Taxa de Conversão</h4>
                  <TooltipHelper content={tooltipTexts.grupo.taxaConversao} />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {resultado.taxa_conversao.toFixed(1)}%
                  </div>
                  <Progress value={resultado.taxa_conversao} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Ganho/Total</span>
                    <span>{resultado.quantidade_ganho}/{resultado.quantidade_total}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Médio */}
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  <h4 className="font-medium">Ticket Médio</h4>
                  <TooltipHelper content={tooltipTexts.grupo.ticketMedio} />
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(resultado.ticket_medio)}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Por oportunidade
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
