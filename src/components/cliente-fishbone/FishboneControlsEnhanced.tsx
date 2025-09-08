import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Filter, 
  TrendingUp, Users, Building2, AlertTriangle, 
  Layers, Settings, Download, Share2, Maximize2,
  Activity, Clock, Target, BarChart3
} from "lucide-react";
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';

interface FishboneControlsEnhancedProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  onZoomChange: (level: FishboneZoomLevel) => void;
  onFilterChange: (filters: FishboneFilters) => void;
  onExport?: (format: 'png' | 'svg' | 'pdf') => void;
  onShare?: () => void;
  onFullscreen?: () => void;
  performanceStats?: {
    totalEtapas: number;
    totalMapeamentos: number;
    cacheHitRate: number;
    lastUpdate: number;
  };
}

interface FishboneFilters {
  showOnlyPartners: boolean;
  showOnlyGaps: boolean;
  minimumSuppliers: number;
  performanceThreshold: number;
  etapaIds: string[];
  supplierTypes: string[];
}

const FishboneControlsEnhanced: React.FC<FishboneControlsEnhancedProps> = ({
  fishboneData,
  zoomLevel,
  onZoomChange,
  onFilterChange,
  onExport,
  onShare,
  onFullscreen,
  performanceStats
}) => {
  const [filters, setFilters] = useState<FishboneFilters>({
    showOnlyPartners: false,
    showOnlyGaps: false,
    minimumSuppliers: 0,
    performanceThreshold: 0,
    etapaIds: [],
    supplierTypes: []
  });
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'heatmap' | 'network'>('standard');

  // Memoized statistics
  const stats = useMemo(() => {
    if (!fishboneData || fishboneData.length === 0) {
      return {
        totalClientes: 0,
        totalEtapas: 0,
        totalFornecedores: 0,
        totalParceiros: 0,
        coberturaPorcentual: 0,
        gapsCount: 0,
        avgPerformance: 0,
        criticalGaps: 0
      };
    }

    const cliente = fishboneData[0];
    const totalFornecedores = cliente.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.length + etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.length, 0), 0);
    
    const totalParceiros = cliente.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.filter(f => f.is_parceiro).length + 
      etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.filter(f => f.is_parceiro).length, 0), 0);

    const etapasComFornecedores = cliente.etapas.filter(etapa => 
      etapa.fornecedores.length > 0 || etapa.subniveis.some(sub => sub.fornecedores.length > 0));

    const gapsCount = cliente.etapas.length - etapasComFornecedores.length;
    
    const criticalGaps = cliente.etapas.filter(etapa => 
      etapa.fornecedores.length === 0 && etapa.subniveis.every(sub => sub.fornecedores.length === 0)
    ).length;

    const allFornecedores = cliente.etapas.flatMap(etapa => 
      [...etapa.fornecedores, ...etapa.subniveis.flatMap(sub => sub.fornecedores)]
    );
    
    const avgPerformance = allFornecedores.length > 0 
      ? allFornecedores.reduce((acc, f) => acc + (f.performance_score || 0), 0) / allFornecedores.length
      : 0;

    return {
      totalClientes: 1,
      totalEtapas: cliente.etapas.length,
      totalFornecedores,
      totalParceiros,
      coberturaPorcentual: Math.round((etapasComFornecedores.length / cliente.etapas.length) * 100),
      gapsCount,
      avgPerformance: Math.round(avgPerformance),
      criticalGaps
    };
  }, [fishboneData]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FishboneFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  }, [filters, onFilterChange]);

  // Zoom level handlers
  const handleZoomIn = useCallback(() => {
    const levels: FishboneZoomLevel['level'][] = ['overview', 'medium', 'detailed'];
    const currentIndex = levels.indexOf(zoomLevel.level);
    if (currentIndex < levels.length - 1) {
      onZoomChange({
        ...zoomLevel,
        level: levels[currentIndex + 1],
        showSubniveis: true,
        showAllFornecedores: levels[currentIndex + 1] === 'detailed'
      });
    }
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const levels: FishboneZoomLevel['level'][] = ['overview', 'medium', 'detailed'];
    const currentIndex = levels.indexOf(zoomLevel.level);
    if (currentIndex > 0) {
      onZoomChange({
        ...zoomLevel,
        level: levels[currentIndex - 1],
        showSubniveis: levels[currentIndex - 1] !== 'overview',
        showAllFornecedores: false
      });
    }
  }, [zoomLevel, onZoomChange]);

  const handleReset = useCallback(() => {
    onZoomChange({
      level: 'overview',
      showSubniveis: false,
      showAllFornecedores: false
    });
    handleFilterChange({
      showOnlyPartners: false,
      showOnlyGaps: false,
      minimumSuppliers: 0,
      performanceThreshold: 0,
      etapaIds: [],
      supplierTypes: []
    });
  }, [onZoomChange, handleFilterChange]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Quick Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Visão Geral</CardTitle>
              <div className="flex items-center space-x-2">
                {performanceStats && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs">
                        <Activity className="h-3 w-3 mr-1" />
                        {Math.round(performanceStats.cacheHitRate * 100)}%
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Cache Hit Rate: {Math.round(performanceStats.cacheHitRate * 100)}%
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Main metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalEtapas}</div>
                <div className="text-xs text-muted-foreground">Etapas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalFornecedores}</div>
                <div className="text-xs text-muted-foreground">Fornecedores</div>
              </div>
            </div>

            {/* Coverage progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Cobertura</span>
                <span className="font-medium">{stats.coberturaPorcentual}%</span>
              </div>
              <Progress value={stats.coberturaPorcentual} className="h-2" />
            </div>

            {/* Partner vs Supplier breakdown */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1 text-green-600" />
                <span>{stats.totalParceiros} Parceiros</span>
              </div>
              <div className="flex items-center">
                <Building2 className="h-3 w-3 mr-1 text-blue-600" />
                <span>{stats.totalFornecedores - stats.totalParceiros} Fornecedores</span>
              </div>
            </div>

            {/* Critical alerts */}
            {stats.criticalGaps > 0 && (
              <div className="flex items-center text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>{stats.criticalGaps} Gap(s) Crítico(s)</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zoom and View Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Visualização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Zoom controls */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Nível de Zoom</label>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleZoomOut}>
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Select 
                  value={zoomLevel.level} 
                  onValueChange={(value: FishboneZoomLevel['level']) => 
                    onZoomChange({ ...zoomLevel, level: value })
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleZoomIn}>
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* View mode */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Modo de Visualização</label>
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Padrão</SelectItem>
                  <SelectItem value="heatmap">Mapa de Calor</SelectItem>
                  <SelectItem value="network">Rede</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Display options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Mostrar Subníveis</label>
                <Switch 
                  checked={zoomLevel.showSubniveis}
                  onCheckedChange={(checked) => 
                    onZoomChange({ ...zoomLevel, showSubniveis: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Mostrar Todos Fornecedores</label>
                <Switch 
                  checked={zoomLevel.showAllFornecedores}
                  onCheckedChange={(checked) => 
                    onZoomChange({ ...zoomLevel, showAllFornecedores: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Rápidos
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Apenas Parceiros</label>
              <Switch 
                checked={filters.showOnlyPartners}
                onCheckedChange={(checked) => 
                  handleFilterChange({ showOnlyPartners: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Apenas Gaps</label>
              <Switch 
                checked={filters.showOnlyGaps}
                onCheckedChange={(checked) => 
                  handleFilterChange({ showOnlyGaps: checked })
                }
              />
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-2 block">
                      Mínimo de Fornecedores: {filters.minimumSuppliers}
                    </label>
                    <Slider
                      value={[filters.minimumSuppliers]}
                      onValueChange={([value]) => 
                        handleFilterChange({ minimumSuppliers: value })
                      }
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-2 block">
                      Performance Mínima: {filters.performanceThreshold}%
                    </label>
                    <Slider
                      value={[filters.performanceThreshold]}
                      onValueChange={([value]) => 
                        handleFilterChange({ performanceThreshold: value })
                      }
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restaurar configurações padrão</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onFullscreen}>
                    <Maximize2 className="h-3 w-3 mr-1" />
                    Tela Cheia
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Visualizar em tela cheia</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={() => onExport?.('png')}>
                    <Download className="h-3 w-3 mr-1" />
                    Exportar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Baixar como imagem</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={onShare}>
                    <Share2 className="h-3 w-3 mr-1" />
                    Compartilhar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Compartilhar visualização</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Performance Monitor (debug mode) */}
        {performanceStats && process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                Performance Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <div>Etapas: {performanceStats.totalEtapas}</div>
              <div>Mapeamentos: {performanceStats.totalMapeamentos}</div>
              <div>Cache Hit: {Math.round(performanceStats.cacheHitRate * 100)}%</div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Atualizado: {new Date(performanceStats.lastUpdate).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
};

export default FishboneControlsEnhanced;