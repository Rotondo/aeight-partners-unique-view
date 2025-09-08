import React from 'react';
import { ClienteFishboneView } from '@/types/cliente-fishbone';
import { cn } from '@/lib/utils';

interface FishboneHeatMapProps {
  fishboneData: ClienteFishboneView[];
  className?: string;
}

const FishboneHeatMap: React.FC<FishboneHeatMapProps> = ({
  fishboneData,
  className
}) => {
  if (!fishboneData || fishboneData.length === 0) {
    return null;
  }

  const clienteView = fishboneData[0];

  // Calculate heat map data
  const heatMapData = clienteView.etapas.map(etapa => {
    const totalFornecedores = etapa.fornecedores.length + 
      etapa.subniveis.reduce((acc, sub) => acc + sub.fornecedores.length, 0);
    
    const totalParceiros = etapa.fornecedores.filter(f => f.is_parceiro).length +
      etapa.subniveis.reduce((acc, sub) => 
        acc + sub.fornecedores.filter(f => f.is_parceiro).length, 0);

    const parceiroRatio = totalFornecedores > 0 ? totalParceiros / totalFornecedores : 0;
    
    let status: 'critical' | 'warning' | 'good' | 'excellent';
    let color: string;
    
    if (totalFornecedores === 0) {
      status = 'critical';
      color = 'hsl(var(--fishbone-gap-critical))';
    } else if (totalFornecedores < 2) {
      status = 'warning';
      color = 'hsl(var(--fishbone-gap-warning))';
    } else if (parceiroRatio >= 0.5) {
      status = 'excellent';
      color = 'hsl(var(--fishbone-partner))';
    } else {
      status = 'good';
      color = 'hsl(var(--fishbone-supplier))';
    }

    return {
      etapa,
      totalFornecedores,
      totalParceiros,
      parceiroRatio,
      status,
      color,
      gaps: etapa.gaps || 0
    };
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'good':
        return '✅';
      case 'excellent':
        return '🚀';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Atenção';
      case 'good':
        return 'Bom';
      case 'excellent':
        return 'Excelente';
      default:
        return '';
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      {/* Overview */}
      <div className="text-xs text-muted-foreground font-medium mb-2">
        Mapa de Calor - Status por Etapa
      </div>
      
      {/* Heat map bars */}
      <div className="space-y-1">
        {heatMapData.map((item, index) => (
          <div key={item.etapa.id} className="flex items-center gap-2 text-xs">
            {/* Status bar */}
            <div className="flex-1 relative">
              <div 
                className="h-6 rounded flex items-center px-2 text-white font-medium"
                style={{ backgroundColor: item.color }}
              >
                <span className="truncate">
                  {item.etapa.nome}
                </span>
              </div>
              {/* Gradient overlay for visual appeal */}
              <div 
                className="absolute inset-0 rounded opacity-20"
                style={{
                  background: `linear-gradient(90deg, ${item.color} 0%, transparent 100%)`
                }}
              />
            </div>
            
            {/* Status info */}
            <div className="flex items-center gap-1 min-w-[80px]">
              <span>{getStatusIcon(item.status)}</span>
              <span className="text-muted-foreground">
                {item.totalParceiros}/{item.totalFornecedores}
              </span>
            </div>
            
            {/* Critical indicators */}
            {item.gaps > 0 && (
              <div className="text-destructive font-medium">
                {item.gaps} gaps
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-3 pt-2 border-t text-xs space-y-1">
        <div className="text-muted-foreground font-medium">Legenda:</div>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center gap-1">
            <span>🚀</span>
            <span>Excelente (≥50% parceiros)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>✅</span>
            <span>Bom (≥2 fornecedores)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Atenção (1 fornecedor)</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚠️</span>
            <span>Crítico (sem fornecedores)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishboneHeatMap;