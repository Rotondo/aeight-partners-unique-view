
import { useState, useMemo } from 'react';
import { FilterState } from '@/modules/dashboard-core/types';
import { Oportunidade } from '@/types';

export const useAdvancedFilters = (oportunidades: Oportunidade[]) => {
  const [filters, setFilters] = useState<FilterState>({
    apenasEmpresasGrupo: false,
    tipoRelacao: 'todos'
  });

  const filteredOportunidades = useMemo(() => {
    let filtered = [...oportunidades];

    // Filtro: Apenas Empresas do Grupo
    if (filters.apenasEmpresasGrupo) {
      filtered = filtered.filter(op => 
        op.empresa_destino?.tipo === 'intragrupo'
      );
    }

    // Filtro: Tipo de Relação
    if (filters.tipoRelacao !== 'todos') {
      if (filters.tipoRelacao === 'intra') {
        // Intragrupo → Intragrupo
        filtered = filtered.filter(op => 
          op.empresa_origem?.tipo === 'intragrupo' && 
          op.empresa_destino?.tipo === 'intragrupo'
        );
      } else if (filters.tipoRelacao === 'extra') {
        // Parceiro → Intragrupo
        filtered = filtered.filter(op => 
          (op.empresa_origem?.tipo === 'parceiro' || op.empresa_origem?.tipo === 'cliente') &&
          op.empresa_destino?.tipo === 'intragrupo'
        );
      }
    }

    // Filtro: Status
    if (filters.status) {
      filtered = filtered.filter(op => op.status === filters.status);
    }

    // Filtro: Busca por texto
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(op => 
        op.nome_lead.toLowerCase().includes(searchLower) ||
        op.empresa_origem?.nome.toLowerCase().includes(searchLower) ||
        op.empresa_destino?.nome.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [oportunidades, filters]);

  return {
    filters,
    setFilters,
    filteredOportunidades
  };
};
