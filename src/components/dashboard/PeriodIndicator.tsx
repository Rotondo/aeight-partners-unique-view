import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';

export const PeriodIndicator: React.FC = () => {
  const { filters } = useOportunidades();

  const getPeriodText = () => {
    if (!filters) {
      return 'Todos os períodos';
    }
    if (filters.dataInicio && filters.dataFim) {
      const inicio = new Date(filters.dataInicio).toLocaleDateString('pt-BR');
      const fim = new Date(filters.dataFim).toLocaleDateString('pt-BR');
      return `${inicio} - ${fim}`;
    }
    if (filters.dataInicio) {
      const inicio = new Date(filters.dataInicio).toLocaleDateString('pt-BR');
      return `A partir de ${inicio}`;
    }
    if (filters.dataFim) {
      const fim = new Date(filters.dataFim).toLocaleDateString('pt-BR');
      return `Até ${fim}`;
    }
    return 'Todos os períodos';
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Período ativo:</span>
      <Badge variant="outline" className="text-xs">
        {getPeriodText()}
      </Badge>
    </div>
  );
};
