
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipHelperProps {
  content: string;
  className?: string;
}

export const TooltipHelper: React.FC<TooltipHelperProps> = ({ content, className = '' }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className={`h-4 w-4 text-muted-foreground hover:text-foreground cursor-help ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const tooltipTexts = {
  meta: {
    progresso: "Percentual calculado como: (Realizado ÷ Meta) × 100",
    status: "≥100% = acima da meta, ≥80% = dentro da meta, <80% = abaixo da meta",
    realizado: "Soma das oportunidades que atendem aos critérios da meta no período definido",
    segmentoIntragrupo: "Oportunidades entre empresas do mesmo grupo",
    segmentoExtragrupo: "Oportunidades de empresas externas para empresas do grupo",
    segmentoTudo: "Todas as oportunidades, independente do segmento",
    statusTodasOportunidades: "Considera todas as oportunidades criadas no período",
    statusApenasGanhas: "Considera apenas oportunidades fechadas com sucesso"
  },
  grupo: {
    taxaConversao: "Oportunidades ganhas ÷ Total de oportunidades × 100",
    ticketMedio: "Valor total ÷ Quantidade total de oportunidades",
    valorTotal: "Soma de todos os valores das oportunidades no período",
    quantidadeTotal: "Número total de oportunidades no segmento"
  },
  empresa: {
    quantidadeTotal: "Número de oportunidades onde a empresa aparece como origem ou destino",
    taxaConversao: "Percentual de oportunidades fechadas com sucesso para esta empresa",
    ticketMedio: "Valor médio por oportunidade para esta empresa",
    tipoIntragrupo: "Empresa pertencente ao grupo",
    tipoParceiro: "Empresa parceira externa",
    tipoCliente: "Empresa cliente"
  }
};
