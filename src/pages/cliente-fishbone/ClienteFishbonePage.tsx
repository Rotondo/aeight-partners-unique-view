import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fish, Target } from "lucide-react";
import ClienteSelector from '@/components/cliente-fishbone/ClienteSelector';
import FishboneVisualization from '@/components/cliente-fishbone/FishboneVisualization';
import FishboneControls from '@/components/cliente-fishbone/FishboneControls';
import { useClienteFishbone } from '@/hooks/useClienteFishbone';
import { useClienteFishboneActions } from '@/hooks/useClienteFishboneActions';
import { 
  ClienteFishboneFilters, 
  FishboneZoomLevel 
} from '@/types/cliente-fishbone';
import LoadingScreen from '@/components/ui/LoadingScreen';

const ClienteFishbonePage: React.FC = () => {
  const [filtros, setFiltros] = useState<ClienteFishboneFilters>({
    clienteIds: [],
    zoomLevel: {
      level: 'overview',
      showSubniveis: false,
      showAllFornecedores: false
    },
    showOnlyParceiros: false,
    showOnlyGaps: false
  });

  const {
    loading,
    clientes,
    fishboneData,
    stats,
    refetch
  } = useClienteFishbone(filtros);

  const fishboneActions = useClienteFishboneActions(refetch);

  const handleClienteSelectionChange = (clienteIds: string[]) => {
    setFiltros(prev => ({
      ...prev,
      clienteIds
    }));
  };

  const handleZoomChange = (zoomLevel: FishboneZoomLevel) => {
    setFiltros(prev => ({
      ...prev,
      zoomLevel
    }));
  };

  const handleToggleParceiros = (showOnlyParceiros: boolean) => {
    setFiltros(prev => ({
      ...prev,
      showOnlyParceiros
    }));
  };

  const handleToggleGaps = (showOnlyGaps: boolean) => {
    setFiltros(prev => ({
      ...prev,
      showOnlyGaps
    }));
  };

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    console.log('Node clicked:', nodeId, nodeType);
    // Implementar ações específicas para diferentes tipos de nós
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
            clientes={clientes}
            selectedClienteIds={filtros.clienteIds}
            onSelectionChange={handleClienteSelectionChange}
          />

          <FishboneControls
            zoomLevel={filtros.zoomLevel}
            onZoomChange={handleZoomChange}
            stats={stats}
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
                    ({filtros.clienteIds.length} cliente{filtros.clienteIds.length !== 1 ? 's' : ''} selecionado{filtros.clienteIds.length !== 1 ? 's' : ''})
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
                      Selecione um ou mais clientes
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha os clientes no painel lateral para visualizar suas jornadas
                    </p>
                  </div>
                </div>
              ) : (
                <FishboneVisualization
                  fishboneData={fishboneData}
                  zoomLevel={filtros.zoomLevel}
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