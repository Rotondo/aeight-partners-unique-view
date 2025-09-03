import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { EtapaJornada } from "@/types/mapa-parceiros";
import { 
  FishboneZoomLevel, 
  ZOOM_CONFIGS, 
  validateZoomLevel 
} from '@/types/cliente-fishbone-filters';

// Tipos robustos
type ParceirosVsFornecedores = {
  parceiros: number;
  fornecedores: number;
};

type FishboneStats = {
  clientes?: number;
  totalParceiros?: number;
  totalFornecedores?: number;
  totalGaps?: number;
  totalEtapas?: number;
  coberturaPorcentual?: number;
  parceirosVsFornecedores?: ParceirosVsFornecedores;
  gapsPorEtapa?: Record<string, number>;
};

interface FishboneControlsProps {
  zoomLevel: FishboneZoomLevel;
  onZoomChange: (level: FishboneZoomLevel) => void;
  stats?: FishboneStats;
  etapas?: EtapaJornada[]; // Novo prop!
  showOnlyParceiros: boolean;
  onToggleParceiros: (show: boolean) => void;
  showOnlyGaps: boolean;
  onToggleGaps: (show: boolean) => void;
}

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

const zoomConfig = ZOOM_CONFIGS;

const FishboneControls: React.FC<FishboneControlsProps> = ({
  zoomLevel,
  onZoomChange,
  stats,
  etapas = [],
  showOnlyParceiros,
  onToggleParceiros,
  showOnlyGaps,
  onToggleGaps
}) => {
  // Validate input parameters
  if (!validateZoomLevel(zoomLevel)) {
    console.warn('[FishboneControls] Invalid zoom level provided:', zoomLevel);
    return null;
  }

  if (typeof showOnlyParceiros !== 'boolean') {
    console.warn('[FishboneControls] showOnlyParceiros must be boolean:', showOnlyParceiros);
  }

  if (typeof showOnlyGaps !== 'boolean') {
    console.warn('[FishboneControls] showOnlyGaps must be boolean:', showOnlyGaps);
  }

  const handleZoomChange = (newLevel: FishboneZoomLevel['level']) => {
    if (!['overview', 'medium', 'detailed'].includes(newLevel)) {
      console.warn('[FishboneControls] Invalid zoom level:', newLevel);
      return;
    }
    onZoomChange(zoomConfig[newLevel]);
  };

  // Função para pegar o nome da etapa pelo id com validação
  const getEtapaNome = (etapaId: string) => {
    if (!etapaId || typeof etapaId !== 'string') {
      return 'Etapa inválida';
    }
    const etapa = etapas.find(e => e.id === etapaId);
    return etapa?.nome ?? `Etapa ${etapaId.slice(0, 8)}...`;
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
              disabled={typeof onToggleParceiros !== 'function'}
            >
              <Users className="h-4 w-4 mr-2" />
              {showOnlyParceiros ? 'Mostrando' : 'Mostrar'} apenas Parceiros
            </Button>
            <Button
              variant={showOnlyGaps ? "default" : "outline"}
              onClick={() => onToggleGaps(!showOnlyGaps)}
              className="justify-start"
              disabled={typeof onToggleGaps !== 'function'}
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
                {stats?.clientes ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Clientes
              </div>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <div className="text-lg font-bold text-primary">
                {stats?.totalEtapas ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Etapas
              </div>
            </div>
          </div>

          <div className="text-center p-2 bg-muted rounded">
            <div className="text-lg font-bold text-primary">
              {stats?.coberturaPorcentual ?? 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              Cobertura Geral
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Parceiros</span>
              <Badge variant="default">
                {stats?.parceirosVsFornecedores?.parceiros ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Fornecedores</span>
              <Badge variant="destructive">
                {stats?.parceirosVsFornecedores?.fornecedores ?? 0}
              </Badge>
            </div>
          </div>
          {stats?.gapsPorEtapa && Object.keys(stats.gapsPorEtapa).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">
                Gaps por Etapa
              </div>
              {Object.entries(stats.gapsPorEtapa)
                .filter(([etapaId, gaps]) => gaps > 0 && Number.isFinite(gaps))
                .map(([etapaId, gaps]) => (
                  <div key={etapaId} className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground truncate">
                      {getEtapaNome(etapaId)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {gaps}
                    </Badge>
                  </div>
                ))}
              {Object.entries(stats.gapsPorEtapa).filter(([, gaps]) => gaps > 0).length === 0 && (
                <div className="text-xs text-muted-foreground italic">
                  Nenhum gap encontrado
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FishboneControls;