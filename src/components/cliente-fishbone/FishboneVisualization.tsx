import React, { useState } from 'react';
import ClienteHead from './ClienteHead';
import FishboneSpine from './FishboneSpine';
import FornecedorDot from './FornecedorDot';
import EtapaDetailsModal from './EtapaDetailsModal';
import FornecedorSelectionModal from './FornecedorSelectionModal';
import FishboneCanvas from './FishboneCanvas';
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';
import { useToast } from "@/hooks/use-toast";

interface FishboneVisualizationProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  onDataRefresh?: () => void;
}

const FishboneVisualization: React.FC<FishboneVisualizationProps> = ({
  fishboneData,
  zoomLevel,
  onNodeClick,
  onDataRefresh
}) => {
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [expandedSubniveis, setExpandedSubniveis] = useState<Set<string>>(new Set());
  const [selectedEtapa, setSelectedEtapa] = useState<any>(null);
  const [showEtapaDetails, setShowEtapaDetails] = useState(false);
  const [showFornecedorSelection, setShowFornecedorSelection] = useState(false);
  const [selectionContext, setSelectionContext] = useState<{
    clienteId: string;
    etapaId: string;
    subnivelId?: string;
  } | null>(null);
  const { toast } = useToast();

  if (!fishboneData || fishboneData.length === 0) {
    return (
      <div className="h-[600px] w-full border rounded-lg bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Selecione um cliente para visualizar a espinha de peixe</p>
        </div>
      </div>
    );
  }

  const clienteView = fishboneData[0]; // Assumindo um cliente por vez
  const centerX = 400;
  const centerY = 300;

  // Calcular estatísticas do cliente
  const stats = {
    totalEtapas: clienteView.etapas.length,
    totalFornecedores: clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.length + etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.length, 0), 0),
    totalParceiros: clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.filter(f => f.is_parceiro).length + 
      etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.filter(f => f.is_parceiro).length, 0), 0),
    coberturaPorcentual: Math.round(
      (clienteView.etapas.filter(etapa => etapa.fornecedores.length > 0 || 
        etapa.subniveis.some(sub => sub.fornecedores.length > 0)).length / 
        clienteView.etapas.length) * 100
    )
  };

  const handleToggleEtapa = (etapaId: string) => {
    const newExpanded = new Set(expandedEtapas);
    if (newExpanded.has(etapaId)) {
      newExpanded.delete(etapaId);
    } else {
      newExpanded.add(etapaId);
    }
    setExpandedEtapas(newExpanded);
  };

  const handleShowEtapaDetails = (etapa: any) => {
    setSelectedEtapa(etapa);
    setShowEtapaDetails(true);
  };

  const handleAddFornecedor = (etapaId: string, subnivelId?: string) => {
    if (!fishboneData[0]?.cliente?.id) {
      toast({
        title: "Erro",
        description: "Cliente não identificado",
        variant: "destructive"
      });
      return;
    }

    setSelectionContext({
      clienteId: fishboneData[0].cliente.id,
      etapaId,
      subnivelId
    });
    setShowFornecedorSelection(true);
    setShowEtapaDetails(false);
  };

  const handleFornecedorAdded = () => {
    onDataRefresh?.();
    toast({
      title: "Sucesso",
      description: "Fornecedor adicionado com sucesso"
    });
  };

  const renderFornecedores = (
    fornecedores: any[], 
    basePosition: { x: number; y: number },
    angle: number,
    distance: number = 80
  ) => {
    return fornecedores.map((fornecedor, index) => {
      const fornecedorAngle = angle + (index - fornecedores.length / 2 + 0.5) * 0.3;
      const fornecedorX = basePosition.x + Math.cos(fornecedorAngle) * distance;
      const fornecedorY = basePosition.y + Math.sin(fornecedorAngle) * distance;

      return (
        <FornecedorDot
          key={fornecedor.id}
          fornecedor={fornecedor}
          position={{ x: fornecedorX, y: fornecedorY }}
          onDoubleClick={() => onNodeClick?.(fornecedor.id, 'fornecedor')}
        />
      );
    });
  };

  return (
    <>
    <FishboneCanvas
      fishboneData={fishboneData}
      zoomLevel={zoomLevel}
      onNodeClick={onNodeClick}
    >
      {/* Linha principal (espinha dorsal) */}
      <line
        x1={centerX - 150}
        y1={centerY}
        x2={centerX + 400}
        y2={centerY}
        stroke="hsl(var(--primary))"
        strokeWidth="4"
        strokeDasharray="5,5"
        className="opacity-60"
      />

      {/* Cabeça do cliente */}
      <ClienteHead
        cliente={clienteView.cliente}
        stats={stats}
        position={{ x: centerX - 150, y: centerY }}
      />

      {/* Etapas como espinhas */}
      {clienteView.etapas.map((etapa, index) => {
        const isEven = index % 2 === 0;
        const baseAngle = isEven ? -Math.PI / 6 : Math.PI / 6;
        const spineStartX = centerX + (index * 120);
        const spineStartY = centerY;
        
        const isExpanded = expandedEtapas.has(etapa.id);

        return (
          <g key={etapa.id}>
            <FishboneSpine
              etapa={etapa}
              isExpanded={isExpanded}
              onToggleExpanded={() => handleToggleEtapa(etapa.id)}
              onShowDetails={() => handleShowEtapaDetails(etapa)}
              position={{ x: spineStartX, y: spineStartY }}
              angle={baseAngle}
            />

            {/* Renderizar fornecedores se expandido */}
            {isExpanded && (zoomLevel.showAllFornecedores || zoomLevel.level === 'detailed') && (
              <>
                {/* Fornecedores diretos da etapa */}
                {renderFornecedores(
                  etapa.fornecedores,
                  {
                    x: spineStartX + Math.cos(baseAngle) * 120,
                    y: spineStartY + Math.sin(baseAngle) * 120
                  },
                  baseAngle
                )}

                {/* Subníveis e seus fornecedores */}
                {zoomLevel.showSubniveis && etapa.subniveis.map((subnivel, subIndex) => {
                  const subAngle = baseAngle + (subIndex - etapa.subniveis.length / 2 + 0.5) * 0.4;
                  const subBaseX = spineStartX + Math.cos(baseAngle) * 80;
                  const subBaseY = spineStartY + Math.sin(baseAngle) * 80;
                  const subEndX = subBaseX + Math.cos(subAngle) * 60;
                  const subEndY = subBaseY + Math.sin(subAngle) * 60;

                  return (
                    <g key={subnivel.id}>
                      {/* Linha do subnível */}
                      <line
                        x1={subBaseX}
                        y1={subBaseY}
                        x2={subEndX}
                        y2={subEndY}
                        stroke={etapa.cor || 'hsl(var(--secondary))'}
                        strokeWidth="2"
                      />
                      
                      {/* Fornecedores do subnível */}
                      {renderFornecedores(
                        subnivel.fornecedores,
                        { x: subEndX, y: subEndY },
                        subAngle,
                        40
                      )}
                    </g>
                  );
                })}
              </>
            )}
          </g>
        );
      })}
    </FishboneCanvas>

    {/* Modals */}
    {selectedEtapa && (
      <EtapaDetailsModal
        isOpen={showEtapaDetails}
        onClose={() => setShowEtapaDetails(false)}
        etapa={selectedEtapa}
        onAddFornecedor={handleAddFornecedor}
        onEditFornecedor={(fornecedorId) => {
          toast({
            title: "Funcionalidade em desenvolvimento",
            description: "A edição de fornecedores será implementada em breve"
          });
        }}
      />
    )}

    {selectionContext && (
      <FornecedorSelectionModal
        isOpen={showFornecedorSelection}
        onClose={() => {
          setShowFornecedorSelection(false);
          setSelectionContext(null);
        }}
        clienteId={selectionContext.clienteId}
        etapaId={selectionContext.etapaId}
        subnivelId={selectionContext.subnivelId}
        onFornecedorAdded={handleFornecedorAdded}
      />
    )}
    </>
  );
};

export default FishboneVisualization;