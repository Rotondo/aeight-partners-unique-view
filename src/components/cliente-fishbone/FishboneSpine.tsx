import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Building2 } from "lucide-react";

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
  position: { x: number; y: number };
  angle: number;
}

const FishboneSpine: React.FC<FishboneSpineProps> = ({
  etapa,
  isExpanded,
  onToggleExpanded,
  position,
  angle
}) => {
  const spineLength = 120;
  const endX = position.x + Math.cos(angle) * spineLength;
  const endY = position.y + Math.sin(angle) * spineLength;

  return (
    <g>
      {/* Linha da espinha */}
      <line
        x1={position.x}
        y1={position.y}
        x2={endX}
        y2={endY}
        stroke={etapa.cor || 'hsl(var(--primary))'}
        strokeWidth="3"
        className="transition-all duration-200"
      />
      
      {/* Card da etapa */}
      <foreignObject
        x={endX - 60}
        y={endY - 25}
        width="120"
        height="50"
      >
        <Card className="h-full w-full p-2 bg-background border shadow-sm">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {etapa.nome}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Badge 
                  variant={etapa.gaps > 0 ? "destructive" : "secondary"}
                  className="text-xs px-1"
                >
                  {etapa.fornecedores.length}
                </Badge>
                {etapa.subniveis.length > 0 && (
                  <Building2 className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
            {(etapa.subniveis.length > 0 || etapa.fornecedores.length > 0) && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={onToggleExpanded}
              >
                {isExpanded ? (
                  <Minus className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        </Card>
      </foreignObject>
    </g>
  );
};

export default FishboneSpine;