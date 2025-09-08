import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Minus, Building2, Users, AlertTriangle, Eye } from "lucide-react";

interface FishboneSpineProps {
  etapa: {
    id: string;
    nome: string;
    cor?: string;
    gaps: number;
    fornecedores: any[];
    subniveis: any[];
  };
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onShowDetails: () => void;
  position: { x: number; y: number };
  angle: number;
}

const FishboneSpine: React.FC<FishboneSpineProps> = ({
  etapa,
  isExpanded,
  onToggleExpanded,
  onShowDetails,
  position,
  angle
}) => {
  const spineLength = 120;
  const endX = position.x + Math.cos(angle) * spineLength;
  const endY = position.y + Math.sin(angle) * spineLength;

  // Calcular estatísticas
  const totalFornecedores = etapa.fornecedores.length + 
    etapa.subniveis.reduce((acc, sub) => acc + sub.fornecedores.length, 0);
  
  const totalParceiros = etapa.fornecedores.filter(f => f.is_parceiro).length +
    etapa.subniveis.reduce((acc, sub) => acc + sub.fornecedores.filter(f => f.is_parceiro).length, 0);

  // Determinar cor e status da espinha
  const getSpineColor = () => {
    if (totalParceiros > 0) return 'hsl(var(--fishbone-partner))';
    if (totalFornecedores > 0) return 'hsl(var(--fishbone-supplier))';
    return 'hsl(var(--fishbone-gap-critical))';
  };

  const getStatusIcon = () => {
    if (totalParceiros > 0) return <Users className="h-3 w-3" />;
    if (totalFornecedores > 0) return <Building2 className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  const getBadgeVariant = () => {
    if (totalParceiros > 0) return "default";
    if (totalFornecedores > 0) return "secondary";
    return "destructive";
  };

  const getTooltipContent = () => {
    if (totalParceiros > 0) {
      return `${totalParceiros} Parceiro(s) ativo(s) • ${totalFornecedores} Total`;
    }
    if (totalFornecedores > 0) {
      return `${totalFornecedores} Fornecedor(es) sem parceria`;
    }
    return 'Gap crítico - Sem fornecedores';
  };

  return (
    <TooltipProvider>
      <g>
        {/* Linha da espinha com cor semântica */}
        <line
          x1={position.x}
          y1={position.y}
          x2={endX}
          y2={endY}
          stroke={getSpineColor()}
          strokeWidth="4"
          className="transition-all duration-300 cursor-pointer hover:stroke-width-5"
          onClick={onShowDetails}
        />
        
        {/* Card da etapa melhorado */}
        <foreignObject
          x={endX - 70}
          y={endY - 30}
          width="140"
          height="60"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="h-full w-full p-2 bg-background border shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                    onClick={onShowDetails}>
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate mb-1">
                      {etapa.nome}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={getBadgeVariant()}
                        className="text-xs px-1 flex items-center gap-1"
                      >
                        {getStatusIcon()}
                        {totalFornecedores}
                      </Badge>
                      {etapa.subniveis.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +{etapa.subniveis.length}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {(etapa.subniveis.length > 0 || etapa.fornecedores.length > 0) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpanded();
                        }}
                      >
                        {isExpanded ? (
                          <Minus className="h-3 w-3" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowDetails();
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                <div className="font-medium">{etapa.nome}</div>
                <div className="text-muted-foreground">{getTooltipContent()}</div>
                {etapa.subniveis.length > 0 && (
                  <div className="text-muted-foreground">{etapa.subniveis.length} subnível(is)</div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </foreignObject>
      </g>
    </TooltipProvider>
  );
};

export default FishboneSpine;