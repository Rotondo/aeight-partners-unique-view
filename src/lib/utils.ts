
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Calcula contadores corretos de parceiros únicos por etapa e subnível
 * Evita duplicatas quando um parceiro tem múltiplas associações
 */
export function calcularContadoresParceiros(associacoes: any[]) {
  const parceirosUnicosPorEtapa: Record<string, Set<string>> = {};
  const parceirosUnicosPorSubnivel: Record<string, Set<string>> = {};
  
  associacoes.forEach(a => {
    // Contar por etapa (parceiro único por etapa)
    if (a.etapa_id) {
      if (!parceirosUnicosPorEtapa[a.etapa_id]) {
        parceirosUnicosPorEtapa[a.etapa_id] = new Set();
      }
      parceirosUnicosPorEtapa[a.etapa_id].add(a.parceiro_id);
    }
    
    // Contar por subnível (parceiro único por subnível)
    if (a.subnivel_id) {
      if (!parceirosUnicosPorSubnivel[a.subnivel_id]) {
        parceirosUnicosPorSubnivel[a.subnivel_id] = new Set();
      }
      parceirosUnicosPorSubnivel[a.subnivel_id].add(a.parceiro_id);
    }
  });
  
  // Converter Sets para contadores
  const parceirosPorEtapa: Record<string, number> = {};
  Object.keys(parceirosUnicosPorEtapa).forEach(etapaId => {
    parceirosPorEtapa[etapaId] = parceirosUnicosPorEtapa[etapaId].size;
  });
  
  const parceirosPorSubnivel: Record<string, number> = {};
  Object.keys(parceirosUnicosPorSubnivel).forEach(subnivelId => {
    parceirosPorSubnivel[subnivelId] = parceirosUnicosPorSubnivel[subnivelId].size;
  });
  
  return { parceirosPorEtapa, parceirosPorSubnivel };
}
