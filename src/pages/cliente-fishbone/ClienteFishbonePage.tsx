import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Fish, Target } from "lucide-react";
import ClienteSelector from '@/components/cliente-fishbone/ClienteSelector';
import FishboneVisualization from '@/components/cliente-fishbone/FishboneVisualization';
import FishboneControls from '@/components/cliente-fishbone/FishboneControls';
import FishboneErrorBoundary from '@/components/cliente-fishbone/ErrorBoundary';
import { useClienteFishbone } from '@/hooks/useClienteFishbone';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Tipos locais para filtros
type ZoomLevel = {
  level: 'overview' | 'medium' | 'detailed';
  showSubniveis: boolean;
  showAllFornecedores: boolean;
};
type Filtros = {
  clienteId: string | null;
  zoomLevel: ZoomLevel;
  showOnlyParceiros: boolean;
  showOnlyGaps: boolean;
};

const ClienteFishbonePage: React.FC = () => {
  const [filtros, setFiltros] = useState<Filtros>({
    clienteId: null,
    zoomLevel: {
      level: 'overview',
      showSubniveis: false,
      showAllFornecedores: false
    },
    showOnlyParceiros: false,
    showOnlyGaps: false
  });

  // Hook: retorna dados do fishbone incluindo lista de clientes para seleção
  const {
    fishboneData,
    loading,
    error,
    cliente,
    etapas,
    stats,
    clientes
  } = useClienteFishbone({ clienteIds: filtros.clienteId ? [filtros.clienteId] : [] });

  const handleClienteSelectionChange = (ids: string[]) => {
    setFiltros(prev => ({
      ...prev,
      clienteId: ids.length > 0 ? ids[0] : null // Suporte a múltiplos se quiser
    }));
  };

  const handleZoomChange = (zoomLevel: ZoomLevel) => {
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
    // Ação customizada
  };

  if (loading) {
    return <LoadingScreen />;
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
            selectedClienteIds={filtros.clienteId ? [filtros.clienteId] : []}
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
                {filtros.clienteId && (
                  <span className="text-sm font-normal text-muted-foreground">
                    (1 cliente selecionado)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {!filtros.clienteId ? (
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
                <FishboneErrorBoundary>
                  <FishboneVisualization
                    fishboneData={fishboneData}
                    zoomLevel={filtros.zoomLevel}
                    onNodeClick={handleNodeClick}
                  />
                </FishboneErrorBoundary>
              )}
            </CardContent>
          </Card>

          {/* Card de Legenda */}
          {filtros.clienteId && (
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