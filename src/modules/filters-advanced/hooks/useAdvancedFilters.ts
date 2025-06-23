
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

    console.log('Aplicando filtros:', filters);
    console.log('Total oportunidades inicial:', filtered.length);

    // Filtro: Apenas Empresas do Grupo (CORRIGIDO)
    if (filters.apenasEmpresasGrupo) {
      filtered = filtered.filter(op => {
        const isDestinoIntragrupo = op.empresa_destino?.tipo === 'intragrupo';
        console.log(`Oportunidade ${op.id}: destino=${op.empresa_destino?.tipo}, mantém=${isDestinoIntragrupo}`);
        return isDestinoIntragrupo;
      });
      console.log('Após filtro empresas do grupo:', filtered.length);
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
      console.log('Após filtro tipo relação:', filtered.length);
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

    console.log('Total oportunidades filtradas final:', filtered.length);
    return filtered;
  }, [oportunidades, filters]);

  return {
    filters,
    setFilters,
    filteredOportunidades
  };
};
