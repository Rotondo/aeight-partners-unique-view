import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fish, Target } from "lucide-react";
import ClienteSelector from '@/components/cliente-fishbone/ClienteSelector';
import FishboneVisualization from '@/components/cliente-fishbone/FishboneVisualization';
import FishboneControls from '@/components/cliente-fishbone/FishboneControls';
import { useClienteFishbone } from '@/hooks/useClienteFishbone';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { 
  ClienteFishboneFilters, 
  DEFAULT_FILTERS, 
  ZOOM_CONFIGS,
  validateFilters,
  FishboneZoomLevel
} from '@/types/cliente-fishbone-filters';

const ClienteFishbonePage: React.FC = () => {
  const [filtros, setFiltros] = useState<ClienteFishboneFilters>(DEFAULT_FILTERS);

  // Hook: retorna dados do fishbone incluindo lista de clientes para seleção
  const {
    fishboneData,
    loading,
    error,
    cliente,
    etapas,
    stats,
    clientes
  } = useClienteFishbone({ clienteIds: filtros.clienteIds });

  const handleClienteSelectionChange = (ids: string[]) => {
    if (!Array.isArray(ids) || !ids.every(id => typeof id === 'string')) {
      console.warn('[ClienteFishbonePage] Invalid cliente IDs provided:', ids);
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      clienteIds: ids
    }));
  };

  const handleZoomChange = (zoomLevel: FishboneZoomLevel) => {
    if (!zoomLevel || typeof zoomLevel.level !== 'string') {
      console.warn('[ClienteFishbonePage] Invalid zoom level provided:', zoomLevel);
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      zoomLevel
    }));
  };

  const handleToggleParceiros = (showOnlyParceiros: boolean) => {
    if (typeof showOnlyParceiros !== 'boolean') {
      console.warn('[ClienteFishbonePage] Invalid showOnlyParceiros value:', showOnlyParceiros);
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      showOnlyParceiros
    }));
  };

  const handleToggleGaps = (showOnlyGaps: boolean) => {
    if (typeof showOnlyGaps !== 'boolean') {
      console.warn('[ClienteFishbonePage] Invalid showOnlyGaps value:', showOnlyGaps);
      return;
    }
    
    setFiltros(prev => ({
      ...prev,
      showOnlyGaps
    }));
  };

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    if (!nodeId || !nodeType) {
      console.warn('[ClienteFishbonePage] Invalid node click data:', { nodeId, nodeType });
      return;
    }
    console.log('Node clicked:', nodeId, nodeType);
    // Ação customizada
  };

  // Validate filters
  if (!validateFilters(filtros)) {
    console.error('[ClienteFishbonePage] Invalid filters detected, resetting to defaults');
    setFiltros(DEFAULT_FILTERS);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-destructive">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usa a lista completa de clientes do hook ao invés de apenas o cliente selecionado
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fish className="h-6 w-6 text-primary" />
            Mapa Cliente - Visão Espinha de Peixe
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualize a cobertura de fornecedores e parceiros por cliente e etapa da jornada
          </p>
        </CardHeader>
      </Card>

      {/* Layout Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Seletor e Controles */}
        <div className="lg:col-span-1 space-y-4">
          <ClienteSelector
            clientes={clientes || []}
            selectedClienteIds={filtros.clienteIds}
            onSelectionChange={handleClienteSelectionChange}
          />

          <FishboneControls
            zoomLevel={filtros.zoomLevel}
            onZoomChange={handleZoomChange}
            stats={stats}
            etapas={etapas}
            showOnlyParceiros={filtros.showOnlyParceiros}
            onToggleParceiros={handleToggleParceiros}
            showOnlyGaps={filtros.showOnlyGaps}
            onToggleGaps={handleToggleGaps}
          />
        </div>

        {/* Área Principal - Visualização */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Visualização Espinha de Peixe
                {filtros.clienteIds.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filtros.clienteIds.length} cliente{filtros.clienteIds.length > 1 ? 's' : ''} selecionado{filtros.clienteIds.length > 1 ? 's' : ''})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {filtros.clienteIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                  <Fish className="h-16 w-16 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Selecione um cliente
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha o cliente no painel lateral para visualizar sua jornada
                    </p>
                  </div>
                </div>
              ) : (
                <FishboneVisualization
                  fishboneData={fishboneData}
                  zoomLevel={filtros.zoomLevel}
                  filters={{
                    showOnlyParceiros: filtros.showOnlyParceiros,
                    showOnlyGaps: filtros.showOnlyGaps
                  }}
                  onNodeClick={handleNodeClick}
                />
              )}
            </CardContent>
          </Card>

          {/* Card de Legenda */}
          {filtros.clienteIds.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span>Cliente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-secondary"></div>
                    <span>Etapa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary"></div>
                    <span>Parceiro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-destructive"></div>
                    <span>Fornecedor</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteFishbonePage;