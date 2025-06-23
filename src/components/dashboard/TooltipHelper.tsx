
import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipHelperProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const TooltipHelper: React.FC<TooltipHelperProps> = ({ 
  content, 
  side = 'top',
  className = "h-3 w-3 text-gray-400 hover:text-gray-600" 
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={className} />
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Exportar tooltipTexts que outros componentes estão importando
export const tooltipTexts = {
  ticketMedio: "Valor médio das oportunidades com valor informado",
  taxaConversao: "Percentual de oportunidades ganhas sobre o total",
  valorTotal: "Soma de todos os valores das oportunidades",
  tempoMedio: "Tempo médio entre indicação e fechamento"
};
