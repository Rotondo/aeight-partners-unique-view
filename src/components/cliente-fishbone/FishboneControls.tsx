import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  EyeOff, 
  Users, 
  Building2, 
  Target,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
// Remove the incorrect imports and define the types locally

type FishboneZoomLevel = {
  level: 'overview' | 'medium' | 'detailed';
  showSubniveis: boolean;
  showAllFornecedores: boolean;
};

type FishboneStats = {
  totalParceiros: number;
  totalFornecedores: number;
  totalGaps: number;
  totalEtapas: number;
};

interface FishboneControlsProps {
  zoomLevel: FishboneZoomLevel;
  onZoomChange: (level: FishboneZoomLevel) => void;
  stats: FishboneStats;
  showOnlyParceiros: boolean;
  onToggleParceiros: (show: boolean) => void;
  showOnlyGaps: boolean;
  onToggleGaps: (show: boolean) => void;
}

const FishboneControls: React.FC<FishboneControlsProps> = ({
  zoomLevel,
  onZoomChange,
  stats,
  showOnlyParceiros,
  onToggleParceiros,
  showOnlyGaps,
  onToggleGaps
}) => {
  const zoomLevels = [
    {
      level: 'overview' as const,
      label: 'Visão Geral',
      description: 'Cliente + Etapas principais',
      icon: <ZoomOut className="h-4 w-4" />
    },
    {
      level: 'medium' as const,
      label: 'Médio',
      description: 'Cliente + Etapas + Subníveis',
      icon: <Eye className="h-4 w-4" />
    },
    {
      level: 'detailed' as const,
      label: 'Detalhado',
      description: 'Visão completa com fornecedores',
      icon: <ZoomIn className="h-4 w-4" />
    }
  ];

  const handleZoomChange = (newLevel: FishboneZoomLevel['level']) => {
    const config = {
      overview: { level: 'overview' as const, showSubniveis: false, showAllFornecedores: false },
      medium: { level: 'medium' as const, showSubniveis: true, showAllFornecedores: false },
      detailed: { level: 'detailed' as const, showSubniveis: true, showAllFornecedores: true }
    };

    onZoomChange(config[newLevel]);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Controles & Estatísticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zoom Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ZoomIn className="h-4 w-4" />
            Nível de Zoom
          </h4>
          <div className="flex flex-col gap-2">
            {zoomLevels.map((zoom) => (
              <Button
                key={zoom.level}
                variant={zoomLevel.level === zoom.level ? "default" : "outline"}
                onClick={() => handleZoomChange(zoom.level)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2 w-full">
                  {zoom.icon}
                  <div className="text-left">
                    <div className="font-medium">{zoom.label}</div>
                    <div className="text-xs opacity-70">{zoom.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Filtros */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Filtros de Visualização
          </h4>
          <div className="flex flex-col gap-2">
            <Button
              variant={showOnlyParceiros ? "default" : "outline"}
              onClick={() => onToggleParceiros(!showOnlyParceiros)}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              {showOnlyParceiros ? 'Mostrando' : 'Mostrar'} apenas Parceiros
            </Button>
            <Button
              variant={showOnlyGaps ? "default" : "outline"}
              onClick={() => onToggleGaps(!showOnlyGaps)}
              className="justify-start"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {showOnlyGaps ? 'Mostrando' : 'Mostrar'} apenas Gaps
            </Button>
          </div>
        </div>

        <Separator />

        {/* Estatísticas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Estatísticas
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-bold text-primary">
                {stats.clientes}
              </div>
              <div className="text-xs text-muted-foreground">
                Clientes
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-bold text-primary">
                {stats.totalEtapas}
              </div>
              <div className="text-xs text-muted-foreground">
                Etapas
              </div>
            </div>
          </div>

          <div className="text-center p-2 bg-muted rounded">
            <div className="text-lg font-bold text-primary">
              {stats.coberturaPorcentual}%
            </div>
            <div className="text-xs text-muted-foreground">
              Cobertura Geral
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Parceiros</span>
              <Badge variant="default">
                {stats.parceirosVsFornecedores.parceiros}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Fornecedores</span>
              <Badge variant="destructive">
                {stats.parceirosVsFornecedores.fornecedores}
              </Badge>
            </div>
          </div>

          {Object.keys(stats.gapsPorEtapa).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                Gaps por Etapa
              </div>
              {Object.entries(stats.gapsPorEtapa).map(([etapaId, gaps]) => (
                gaps > 0 && (
                  <div key={etapaId} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground truncate">
                      {etapaId.slice(0, 8)}...
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {gaps}
                    </Badge>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FishboneControls;