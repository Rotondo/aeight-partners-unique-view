import React from 'react';
import { Circle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FornecedorDotProps {
  fornecedor: {
    id: string;
    nome: string;
    is_parceiro: boolean;
    performance_score?: number;
  };
  position: { x: number; y: number };
  onDoubleClick?: () => void;
}

const FornecedorDot: React.FC<FornecedorDotProps> = ({
  fornecedor,
  position,
  onDoubleClick
}) => {
  const getColor = () => {
    if (fornecedor.is_parceiro) {
      return 'hsl(var(--primary))';
    }
    return 'hsl(var(--destructive))';
  };

  const getSize = () => {
    if (fornecedor.performance_score && fornecedor.performance_score > 70) {
      return 8;
    }
    return 6;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle
            cx={position.x}
            cy={position.y}
            r={getSize()}
            fill={getColor()}
            stroke="white"
            strokeWidth="2"
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onDoubleClick={onDoubleClick}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <div className="font-medium">{fornecedor.nome}</div>
            <div className="text-muted-foreground">
              {fornecedor.is_parceiro ? 'Parceiro' : 'Fornecedor'}
            </div>
            {fornecedor.performance_score && (
              <div className="text-muted-foreground">
                Score: {fornecedor.performance_score}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FornecedorDot;