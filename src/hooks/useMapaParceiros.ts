
import { useMapaParceirosData } from './useMapaParceiros/useMapaParceirosData';
import { useMapaParceirosActions } from './useMapaParceiros/useMapaParceirosActions';
import { useMapaParceirosFilters } from './useMapaParceiros/useMapaParceirosFilters';

export const useMapaParceiros = () => {
  const {
    etapas,
    subniveis,
    parceiros,
    associacoes,
    loading,
    carregarDados,
    setParceiros,
    setAssociacoes
  } = useMapaParceirosData();

  const { carregarAssociacoes } = useMapaParceirosData();

  const {
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao
  } = useMapaParceirosActions(setParceiros, carregarDados);

  const {
    filtros,
    setFiltros,
    dadosFiltrados,
    stats
  } = useMapaParceirosFilters(etapas, subniveis, parceiros, associacoes);

  return {
    // Dados
    ...dadosFiltrados(),
    loading,
    filtros,
    stats,
    
    // Funções
    setFiltros,
    carregarDados,
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao: (id: string) => removerAssociacao(id, setAssociacoes)
  };
};
