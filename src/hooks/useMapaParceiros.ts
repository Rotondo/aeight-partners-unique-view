
import { useMapaParceirosData } from './useMapaParceiros/useMapaParceirosData';
import { useMapaParceirosActions } from './useMapaParceiros/useMapaParceirosActions';
import { useMapaParceirosFilters } from './useMapaParceiros/useMapaParceirosFilters';

export const useMapaParceiros = () => {
  const dataHooks = useMapaParceirosData();
  const actionsHooks = useMapaParceirosActions(dataHooks.setParceiros, dataHooks.carregarDados);
  const filtersHooks = useMapaParceirosFilters(dataHooks.etapas, dataHooks.subniveis, dataHooks.parceiros, dataHooks.associacoes);

  return {
    ...dataHooks,
    ...actionsHooks,
    ...filtersHooks
  };
};
