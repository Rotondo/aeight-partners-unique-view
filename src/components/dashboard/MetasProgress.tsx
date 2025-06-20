
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Target, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { TooltipHelper, tooltipTexts } from './TooltipHelper';
import { MetaComprobatorios } from './MetaComprobatorios';
import type { MetaProgress } from '@/types/metas';

interface MetasProgressProps {
  metasProgress: MetaProgress[];
  onEditMeta: (meta: MetaProgress['meta']) => void;
  onDeleteMeta: (id: string) => void;
}

export const MetasProgress: React.FC<MetasProgressProps> = ({
  metasProgress,
  onEditMeta,
  onDeleteMeta
}) => {
  const [selectedMeta, setSelectedMeta] = useState<MetaProgress | null>(null);

  const getStatusColor = (status: MetaProgress['status']) => {
    switch (status) {
      case 'acima':
        return 'bg-green-500';
      case 'dentro':
        return 'bg-yellow-500';
      case 'abaixo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: MetaProgress['status']) => {
    switch (status) {
      case 'acima':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'dentro':
        return <Target className="h-4 w-4 text-yellow-600" />;
      case 'abaixo':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatValue = (value: number, tipo: 'quantidade' | 'valor') => {
    if (tipo === 'valor') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  };

  const getPeriodoText = (meta: MetaProgress['meta']) => {
    if (meta.periodo === 'mensal') {
      const monthName = new Date(meta.ano, (meta.mes || 1) - 1).toLocaleDateString('pt-BR', { month: 'long' });
      return `${monthName}/${meta.ano}`;
    } else {
      return `Q${meta.trimestre}/${meta.ano}`;
    }
  };

  const getSegmentoTooltip = (segmento: string) => {
    switch (segmento) {
      case 'intragrupo':
        return tooltipTexts.meta.segmentoIntragrupo;
      case 'de_fora_para_dentro':
        return tooltipTexts.meta.segmentoExtragrupo;
      case 'tudo':
        return tooltipTexts.meta.segmentoTudo;
      default:
        return '';
    }
  };

  const getStatusOportunidadeTooltip = (status: string) => {
    return status === 'todas' 
      ? tooltipTexts.meta.statusTodasOportunidades 
      : tooltipTexts.meta.statusApenasGanhas;
  };

  if (metasProgress.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma meta cadastrada</p>
            <p className="text-sm">Crie uma meta para acompanhar o progresso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {metasProgress.map((metaProgress) => (
          <Card key={metaProgress.meta.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(metaProgress.status)}
                    {metaProgress.meta.nome}
                  </CardTitle>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">
                        {metaProgress.meta.segmento_grupo.replace('_', ' ')}
                      </Badge>
                      <TooltipHelper content={getSegmentoTooltip(metaProgress.meta.segmento_grupo)} />
                    </div>
                    <Badge variant="outline">
                      {getPeriodoText(metaProgress.meta)}
                    </Badge>
                    <Badge variant="outline">
                      {metaProgress.meta.tipo_meta}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">
                        {metaProgress.meta.status_oportunidade === 'todas' ? 'Todas' : 'Apenas Ganhas'}
                      </Badge>
                      <TooltipHelper content={getStatusOportunidadeTooltip(metaProgress.meta.status_oportunidade)} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMeta(metaProgress)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Comprobatórios
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditMeta(metaProgress.meta)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteMeta(metaProgress.meta.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {metaProgress.meta.descricao && (
                <p className="text-sm text-gray-600 mb-4">
                  {metaProgress.meta.descricao}
                </p>
              )}
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span>Progresso</span>
                    <TooltipHelper content={tooltipTexts.meta.progresso} />
                  </div>
                  <span className="font-medium">
                    {metaProgress.percentual.toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(metaProgress.percentual, 100)} 
                  className="h-2"
                />
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span>Realizado</span>
                    <TooltipHelper content={tooltipTexts.meta.realizado} />
                  </div>
                  <span className="font-medium">
                    {formatValue(metaProgress.realizado, metaProgress.meta.tipo_meta)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Meta</span>
                  <span className="font-medium">
                    {formatValue(metaProgress.meta.valor_meta, metaProgress.meta.tipo_meta)}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Faltam</span>
                  <span className="font-medium">
                    {formatValue(
                      Math.max(0, metaProgress.meta.valor_meta - metaProgress.realizado),
                      metaProgress.meta.tipo_meta
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Oportunidades</span>
                  <span className="font-medium">
                    {metaProgress.oportunidades.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMeta && (
        <MetaComprobatorios
          open={!!selectedMeta}
          onClose={() => setSelectedMeta(null)}
          metaProgress={selectedMeta}
        />
      )}
    </>
  );
};
