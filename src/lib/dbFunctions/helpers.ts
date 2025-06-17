
import { format } from 'date-fns';

// Helper function to format date safely
export const formatDateOrNull = (date: Date | null) => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};

// Helper to filter opportunities by empresa
export const filterByEmpresa = (oportunidades: any[], empresaId: string | null) => {
  if (!empresaId) return oportunidades;
  return oportunidades.filter(op => 
    op.empresa_origem_id === empresaId || op.empresa_destino_id === empresaId
  );
};

// Helper to create empresa map
export const createEmpresaMap = (empresas: any[]) => {
  const empresasMap = new Map();
  empresas?.forEach(empresa => {
    empresasMap.set(empresa.id, empresa);
  });
  return empresasMap;
};
