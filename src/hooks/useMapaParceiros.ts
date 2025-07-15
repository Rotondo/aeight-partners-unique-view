
import { useMapaParceirosData } from './useMapaParceiros/useMapaParceirosData';
import { useMapaParceirosActions } from './useMapaParceiros/useMapaParceirosActions';
import { useMapaParceirosFilters } from './useMapaParceiros/useMapaParceirosFilters';

export const useMapaParceiros = () => {
  const dataHooks = useMapaParceirosData();
  const actionsHooks = useMapaParceirosActions();
  const filtersHooks = useMapaParceirosFilters();

  return {
    ...dataHooks,
    ...actionsHooks,
    ...filtersHooks
  };
};
