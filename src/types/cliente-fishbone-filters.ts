// Interfaces for standardized filters across the cliente-fishbone module

export interface FishboneZoomLevel {
  level: 'overview' | 'medium' | 'detailed';
  showSubniveis: boolean;
  showAllFornecedores: boolean;
}

export interface ClienteFishboneFilters {
  clienteIds: string[];
  zoomLevel: FishboneZoomLevel;
  showOnlyParceiros: boolean;
  showOnlyGaps: boolean;
}

// Default filter values
export const DEFAULT_ZOOM_LEVEL: FishboneZoomLevel = {
  level: 'overview',
  showSubniveis: false,
  showAllFornecedores: false
};

export const DEFAULT_FILTERS: ClienteFishboneFilters = {
  clienteIds: [],
  zoomLevel: DEFAULT_ZOOM_LEVEL,
  showOnlyParceiros: false,
  showOnlyGaps: false
};

// Zoom configuration presets
export const ZOOM_CONFIGS: Record<FishboneZoomLevel['level'], FishboneZoomLevel> = {
  overview: { level: 'overview', showSubniveis: false, showAllFornecedores: false },
  medium: { level: 'medium', showSubniveis: true, showAllFornecedores: false },
  detailed: { level: 'detailed', showSubniveis: true, showAllFornecedores: true }
};

// Validation functions
export const validateZoomLevel = (zoomLevel: any): zoomLevel is FishboneZoomLevel => {
  return (
    zoomLevel &&
    typeof zoomLevel === 'object' &&
    ['overview', 'medium', 'detailed'].includes(zoomLevel.level) &&
    typeof zoomLevel.showSubniveis === 'boolean' &&
    typeof zoomLevel.showAllFornecedores === 'boolean'
  );
};

export const validateFilters = (filters: any): filters is ClienteFishboneFilters => {
  return (
    filters &&
    typeof filters === 'object' &&
    Array.isArray(filters.clienteIds) &&
    filters.clienteIds.every((id: any) => typeof id === 'string') &&
    validateZoomLevel(filters.zoomLevel) &&
    typeof filters.showOnlyParceiros === 'boolean' &&
    typeof filters.showOnlyGaps === 'boolean'
  );
};

// Filter application functions
export const shouldShowFornecedor = (
  fornecedor: { is_parceiro: boolean },
  filters: Pick<ClienteFishboneFilters, 'showOnlyParceiros'>
): boolean => {
  if (filters.showOnlyParceiros) {
    return fornecedor.is_parceiro;
  }
  return true;
};

export const shouldShowEtapa = (
  etapa: { fornecedores: any[]; subniveis: any[] },
  filters: Pick<ClienteFishboneFilters, 'showOnlyGaps'>
): boolean => {
  if (filters.showOnlyGaps) {
    const hasNoFornecedores = etapa.fornecedores.length === 0;
    const hasNoSubnivelFornecedores = etapa.subniveis.every(sub => sub.fornecedores.length === 0);
    return hasNoFornecedores && hasNoSubnivelFornecedores;
  }
  return true;
};