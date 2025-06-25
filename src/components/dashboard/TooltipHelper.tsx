
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipHelperProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  trigger?: 'hover' | 'click';
}

export const TooltipHelper: React.FC<TooltipHelperProps> = ({ 
  content, 
  side = 'top',
  className = "h-3 w-3 text-gray-400 hover:text-gray-600",
  trigger = 'hover'
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={className} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {typeof content === 'string' ? (
            <p className="text-xs">{content}</p>
          ) : (
            <div className="text-xs">{content}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Exportar tooltipTexts completo que outros componentes estão importando
export const tooltipTexts = {
  ticketMedio: "Valor médio das oportunidades com valor informado",
  taxaConversao: "Percentual de oportunidades ganhas sobre o total",
  valorTotal: "Soma de todos os valores das oportunidades",
  tempoMedio: "Tempo médio entre indicação e fechamento",
  // Tooltips para metas
  meta: {
    segmentoIntragrupo: "Oportunidades entre empresas do mesmo grupo",
    segmentoExtragrupo: "Oportunidades vindas de parceiros externos",
    segmentoTudo: "Todas as oportunidades independente da origem",
    statusTodasOportunidades: "Considera todas as oportunidades independente do status",
    statusApenasGanhas: "Considera apenas oportunidades com status 'ganho'",
    progresso: "Percentual de conclusão da meta baseado no valor/quantidade realizada",
    realizado: "Valor ou quantidade efetivamente alcançada no período da meta"
  },
  // Tooltips para empresas
  empresa: {
    tipoIntragrupo: "Empresa pertencente ao grupo interno",
    tipoParceiro: "Empresa parceira externa que indica negócios",
    tipoCliente: "Empresa cliente que pode gerar indicações",
    quantidadeTotal: "Total de oportunidades registradas para esta empresa",
    taxaConversao: "Percentual de oportunidades ganhas sobre o total desta empresa",
    ticketMedio: "Valor médio das oportunidades com valor informado desta empresa"
  },
  // Tooltips para grupos
  grupo: {
    quantidadeTotal: "Total de oportunidades registradas neste segmento",
    valorTotal: "Soma de todos os valores das oportunidades deste segmento",
    taxaConversao: "Percentual de oportunidades ganhas sobre o total deste segmento",
    ticketMedio: "Valor médio das oportunidades com valor informado deste segmento"
  }
};
