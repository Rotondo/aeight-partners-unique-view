
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AssociacaoParceiroEtapa } from "@/types/mapa-parceiros"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para calcular contadores de parceiros por etapa/subnível
export function calcularContadoresParceiros(associacoes: AssociacaoParceiroEtapa[]) {
  const parceirosPorEtapa: Record<string, number> = {};
  const parceirosPorSubnivel: Record<string, number> = {};

  // Usar Sets para garantir contagem única de parceiros
  const parceirosUnicosPorEtapa: Record<string, Set<string>> = {};
  const parceirosUnicosPorSubnivel: Record<string, Set<string>> = {};

  associacoes.forEach(associacao => {
    const { parceiro_id, etapa_id, subnivel_id } = associacao;
    
    // Contar parceiros únicos por etapa
    if (etapa_id) {
      if (!parceirosUnicosPorEtapa[etapa_id]) {
        parceirosUnicosPorEtapa[etapa_id] = new Set();
      }
      parceirosUnicosPorEtapa[etapa_id].add(parceiro_id);
    }
    
    // Contar parceiros únicos por subnível
    if (subnivel_id) {
      if (!parceirosUnicosPorSubnivel[subnivel_id]) {
        parceirosUnicosPorSubnivel[subnivel_id] = new Set();
      }
      parceirosUnicosPorSubnivel[subnivel_id].add(parceiro_id);
    }
  });

  // Converter Sets para contadores
  Object.entries(parceirosUnicosPorEtapa).forEach(([etapaId, parceirosSet]) => {
    parceirosPorEtapa[etapaId] = parceirosSet.size;
  });

  Object.entries(parceirosUnicosPorSubnivel).forEach(([subnivelId, parceirosSet]) => {
    parceirosPorSubnivel[subnivelId] = parceirosSet.size;
  });

  return {
    parceirosPorEtapa,
    parceirosPorSubnivel
  };
}
