import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FishboneNode from './FishboneNode';
import { ClienteFishboneView, FishboneZoomLevel } from '@/types/cliente-fishbone';

interface FishboneVisualizationProps {
  fishboneData: ClienteFishboneView[];
  zoomLevel: FishboneZoomLevel;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

const nodeTypes = {
  fishboneNode: FishboneNode,
};

const FishboneVisualization: React.FC<FishboneVisualizationProps> = ({
  fishboneData,
  zoomLevel,
  onNodeClick
}) => {
  const { nodes, edges } = useMemo(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    fishboneData.forEach((clienteView, clienteIndex) => {
      const clienteY = clienteIndex * 400;
      
      // Node do cliente (cabeça do peixe)
      const clienteNodeId = `cliente-${clienteView.cliente.id}`;
      newNodes.push({
        id: clienteNodeId,
        type: 'fishboneNode',
        position: { x: 50, y: clienteY + 150 },
        data: {
          type: 'cliente',
          label: clienteView.cliente.nome,
          subtitle: clienteView.cliente.descricao || '',
          logoUrl: clienteView.cliente.logo_url
        }
      });

      // Nodes das etapas (espinhas)
      clienteView.etapas.forEach((etapa, etapaIndex) => {
        const etapaNodeId = `etapa-${etapa.id}-${clienteView.cliente.id}`;
        const etapaX = 300 + (etapaIndex * 200);
        const etapaY = clienteY + 150;

        newNodes.push({
          id: etapaNodeId,
          type: 'fishboneNode',
          position: { x: etapaX, y: etapaY },
          data: {
            type: 'etapa',
            label: etapa.nome,
            subtitle: etapa.descricao || '',
            gaps: etapa.gaps,
            color: etapa.cor
          }
        });

        // Edge do cliente para etapa
        newEdges.push({
          id: `${clienteNodeId}-${etapaNodeId}`,
          source: etapaIndex === 0 ? clienteNodeId : `etapa-${clienteView.etapas[etapaIndex - 1]?.id}-${clienteView.cliente.id}`,
          target: etapaNodeId,
          type: 'smoothstep',
          style: { stroke: etapa.cor || 'hsl(var(--primary))' }
        });

        // Nodes dos fornecedores por etapa (se zoom permite)
        if (zoomLevel.showAllFornecedores) {
          etapa.fornecedores.forEach((fornecedor, fornecedorIndex) => {
            const fornecedorNodeId = `fornecedor-${fornecedor.id}-${etapa.id}-${clienteView.cliente.id}`;
            const fornecedorY = etapaY + (fornecedorIndex - etapa.fornecedores.length / 2 + 0.5) * 80;

            newNodes.push({
              id: fornecedorNodeId,
              type: 'fishboneNode',
              position: { x: etapaX + 250, y: fornecedorY },
              data: {
                type: 'fornecedor',
                label: fornecedor.nome,
                subtitle: fornecedor.descricao || '',
                isParceiro: fornecedor.is_parceiro,
                score: fornecedor.performance_score,
                logoUrl: fornecedor.logo_url
              }
            });

            // Edge da etapa para fornecedor
            newEdges.push({
              id: `${etapaNodeId}-${fornecedorNodeId}`,
              source: etapaNodeId,
              target: fornecedorNodeId,
              type: 'smoothstep',
              style: { 
                stroke: fornecedor.is_parceiro 
                  ? 'hsl(var(--primary))' 
                  : 'hsl(var(--destructive))'
              }
            });
          });
        }

        // Nodes dos subníveis (se zoom permite)
        if (zoomLevel.showSubniveis) {
          etapa.subniveis.forEach((subnivel, subnivelIndex) => {
            const subnivelNodeId = `subnivel-${subnivel.id}-${clienteView.cliente.id}`;
            const subnivelY = etapaY + (subnivelIndex - etapa.subniveis.length / 2 + 0.5) * 60;

            newNodes.push({
              id: subnivelNodeId,
              type: 'fishboneNode',
              position: { x: etapaX + 150, y: subnivelY },
              data: {
                type: 'etapa',
                label: subnivel.nome,
                subtitle: subnivel.descricao || '',
                color: etapa.cor
              }
            });

            // Edge da etapa para subnível
            newEdges.push({
              id: `${etapaNodeId}-${subnivelNodeId}`,
              source: etapaNodeId,
              target: subnivelNodeId,
              type: 'smoothstep',
              style: { stroke: etapa.cor || 'hsl(var(--secondary))' }
            });

            // Fornecedores do subnível
            if (zoomLevel.showAllFornecedores) {
              subnivel.fornecedores.forEach((fornecedor, fornecedorIndex) => {
                const fornecedorNodeId = `fornecedor-sub-${fornecedor.id}-${subnivel.id}-${clienteView.cliente.id}`;
                const fornecedorY = subnivelY + (fornecedorIndex * 40);

                newNodes.push({
                  id: fornecedorNodeId,
                  type: 'fishboneNode',
                  position: { x: etapaX + 350, y: fornecedorY },
                  data: {
                    type: 'fornecedor',
                    label: fornecedor.nome,
                    isParceiro: fornecedor.is_parceiro,
                    score: fornecedor.performance_score,
                    logoUrl: fornecedor.logo_url
                  }
                });

                // Edge do subnível para fornecedor
                newEdges.push({
                  id: `${subnivelNodeId}-${fornecedorNodeId}`,
                  source: subnivelNodeId,
                  target: fornecedorNodeId,
                  type: 'smoothstep',
                  style: { 
                    stroke: fornecedor.is_parceiro 
                      ? 'hsl(var(--primary))' 
                      : 'hsl(var(--destructive))'
                  }
                });
              });
            }
          });
        }
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [fishboneData, zoomLevel]);

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  // Atualizar nodes quando dados mudarem
  React.useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (onNodeClick) {
      const nodeData = node.data as { type?: string };
      onNodeClick(node.id, nodeData.type || '');
    }
  };

  return (
    <div className="h-[600px] w-full border rounded-lg bg-background">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        className="bg-background"
      >
        <Background color="hsl(var(--muted))" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FishboneVisualization;