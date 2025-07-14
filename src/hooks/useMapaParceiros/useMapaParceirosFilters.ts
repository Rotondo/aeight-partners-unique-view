
import { useState } from 'react';
import { 
  EtapaJornada, 
  SubnivelEtapa, 
  ParceiroMapa, 
  AssociacaoParceiroEtapa,
  MapaParceirosFiltros,
  MapaParceirosStats
} from '@/types/mapa-parceiros';
import { calcularContadoresParceiros } from '@/lib/utils';

export const useMapaParceirosFilters = (
  etapas: EtapaJornada[],
  subniveis: SubnivelEtapa[],
  parceiros: ParceiroMapa[],
  associacoes: AssociacaoParceiroEtapa[]
) => {
  const [filtros, setFiltros] = useState<MapaParceirosFiltros>({});

  // Filtrar dados
  const dadosFiltrados = () => {
    let etapasFiltradas = etapas;
    let parceirosFiltrados = parceiros;
    let associacoesFiltradas = associacoes;

    if (filtros.etapaId) {
      associacoesFiltradas = associacoesFiltradas.filter(a => a.etapa_id === filtros.etapaId);
    }

    if (filtros.status) {
      parceirosFiltrados = parceirosFiltrados.filter(p => p.status === filtros.status);
    }

    if (filtros.busca) {
      const busca = filtros.busca.toLowerCase();
      parceirosFiltrados = parceirosFiltrados.filter(p => 
        p.empresa?.nome.toLowerCase().includes(busca) ||
        p.empresa?.descricao?.toLowerCase().includes(busca)
      );
    }

    return {
      etapas: etapasFiltradas,
      parceiros: parceirosFiltrados,
      associacoes: associacoesFiltradas,
      subniveis
    };
  };

  // Calcular estatísticas
  const calcularStats = (): MapaParceirosStats => {
    const totalParceiros = parceiros.length;
    const parceirosAtivos = parceiros.filter(p => p.status === 'ativo').length;
    const parceirosInativos = parceiros.filter(p => p.status === 'inativo').length;
    
    const { parceirosPorEtapa, parceirosPorSubnivel } = calcularContadoresParceiros(associacoes);

    const performanceMedia = parceiros.length > 0 
      ? parceiros.reduce((acc, p) => acc + p.performance_score, 0) / parceiros.length 
      : 0;

    return {
      totalParceiros,
      parceirosPorEtapa,
      parceirosPorSubnivel,
      parceirosAtivos,
      parceirosInativos,
      performanceMedia
    };
  };

  return {
    filtros,
    setFiltros,
    dadosFiltrados,
    stats: calcularStats()
  };
};
