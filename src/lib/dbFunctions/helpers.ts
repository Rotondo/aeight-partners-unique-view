
import { format } from 'date-fns';

// Helper function to format date safely
export const formatDateOrNull = (date: Date | null): string | null => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};

// Helper function to create empresa map (placeholder implementation)
export const createEmpresaMap = (empresas: any[]): Record<string, any> => {
  return empresas.reduce((map, empresa) => {
    map[empresa.id] = empresa;
    return map;
  }, {});
};

// Helper function to filter by empresa (placeholder implementation)
export const filterByEmpresa = (data: any[], empresaId: string | null): any[] => {
  if (!empresaId) return data;
  return data.filter(item => 
    item.empresa_origem_id === empresaId || item.empresa_destino_id === empresaId
  );
};
