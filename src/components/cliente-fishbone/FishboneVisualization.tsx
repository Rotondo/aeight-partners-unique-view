import React, { useState } from 'react';
import ClienteHead from './ClienteHead';
import FishboneSpine from './FishboneSpine';
import FornecedorDot from './FornecedorDot';
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';
import { ClienteFishboneFilters, shouldShowFornecedor, shouldShowEtapa } from '@/types/cliente-fishbone-filters';
import { validateFishboneView, logValidationResults } from '@/types/cliente-fishbone-validation';

interface FishboneVisualizationProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  filters?: Pick<ClienteFishboneFilters, 'showOnlyParceiros' | 'showOnlyGaps'>;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

const FishboneVisualization: React.FC<FishboneVisualizationProps> = ({
  fishboneData,
  zoomLevel,
  filters = { showOnlyParceiros: false, showOnlyGaps: false },
  onNodeClick
}) => {
  const [expandedEtapas, setExpandedEtapas] = useState<Set<string>>(new Set());
  const [expandedSubniveis, setExpandedSubniveis] = useState<Set<string>>(new Set());

  // Validate input data
  React.useEffect(() => {
    if (Array.isArray(fishboneData)) {
      fishboneData.forEach((view, index) => {
        const validation = validateFishboneView(view);
        logValidationResults(`FishboneVisualization[${index}]`, validation);
      });
    }
  }, [fishboneData]);

  // Input validation
  if (!Array.isArray(fishboneData)) {
    console.error('[FishboneVisualization] fishboneData must be an array');
    return (
      <div className="h-[600px] w-full border rounded-lg bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Erro: Dados do fishbone inválidos</p>
        </div>
      </div>
    );
  }

  if (!zoomLevel || typeof zoomLevel !== 'object') {
    console.error('[FishboneVisualization] zoomLevel is required and must be an object');
    return (
      <div className="h-[600px] w-full border rounded-lg bg-background flex items-center justify-center">
        <div className="text-center text-destructive">
          <p>Erro: Configuração de zoom inválida</p>
        </div>
      </div>
    );
  }

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

  // Calcular estatísticas do cliente com filtros aplicados
  const stats = {
    totalEtapas: clienteView.etapas.filter(etapa => shouldShowEtapa(etapa, filters)).length,
    totalFornecedores: clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.filter(f => shouldShowFornecedor(f, filters)).length + 
      etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.filter(f => shouldShowFornecedor(f, filters)).length, 0), 0),
    totalParceiros: clienteView.etapas.reduce((acc, etapa) => 
      acc + etapa.fornecedores.filter(f => f.is_parceiro && shouldShowFornecedor(f, filters)).length + 
      etapa.subniveis.reduce((subAcc, sub) => 
        subAcc + sub.fornecedores.filter(f => f.is_parceiro && shouldShowFornecedor(f, filters)).length, 0), 0),
    coberturaPorcentual: Math.round(
      (clienteView.etapas.filter(etapa => 
        shouldShowEtapa(etapa, filters) && 
        (etapa.fornecedores.some(f => shouldShowFornecedor(f, filters)) || 
         etapa.subniveis.some(sub => sub.fornecedores.some(f => shouldShowFornecedor(f, filters))))
      ).length / Math.max(1, clienteView.etapas.filter(etapa => shouldShowEtapa(etapa, filters)).length)) * 100
    )
  };

  const handleToggleEtapa = (etapaId: string) => {
    if (!etapaId || typeof etapaId !== 'string') {
      console.warn('[FishboneVisualization] Invalid etapaId for toggle:', etapaId);
      return;
    }
    
    const newExpanded = new Set(expandedEtapas);
    if (newExpanded.has(etapaId)) {
      newExpanded.delete(etapaId);
    } else {
      newExpanded.add(etapaId);
    }
    setExpandedEtapas(newExpanded);
  };

  const renderFornecedores = (
    fornecedores: any[], 
    basePosition: { x: number; y: number },
    angle: number,
    distance: number = 80
  ) => {
    // Apply filters to fornecedores
    const filteredFornecedores = fornecedores.filter(fornecedor => {
      if (!fornecedor || typeof fornecedor !== 'object') {
        return false;
      }
      return shouldShowFornecedor(fornecedor, filters);
    });

    return filteredFornecedores.map((fornecedor, index) => {
      const fornecedorAngle = angle + (index - filteredFornecedores.length / 2 + 0.5) * 0.3;
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
    <div className="h-[600px] w-full border rounded-lg bg-background relative overflow-hidden">
      <svg width="100%" height="100%" className="absolute inset-0">
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
        {clienteView.etapas
          .filter(etapa => shouldShowEtapa(etapa, filters))
          .map((etapa, index) => {
            const isEven = index % 2 === 0;
            const baseAngle = isEven ? -Math.PI / 6 : Math.PI / 6; // 30 graus para cima ou para baixo
            const spineStartX = centerX + (index * 120);
            const spineStartY = centerY;
            
            const isExpanded = expandedEtapas.has(etapa.id);

            return (
              <g key={etapa.id}>
                <FishboneSpine
                  etapa={etapa}
                  isExpanded={isExpanded}
                  onToggleExpanded={() => handleToggleEtapa(etapa.id)}
                  position={{ x: spineStartX, y: spineStartY }}
                  angle={baseAngle}
                />

                {/* Renderizar fornecedores se expandido e zoom permite */}
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
                    {zoomLevel.showSubniveis && etapa.subniveis
                      .filter(subnivel => !filters.showOnlyGaps || subnivel.fornecedores.length === 0)
                      .map((subnivel, subIndex) => {
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
      </svg>
    </div>
  );
};

export default FishboneVisualization;