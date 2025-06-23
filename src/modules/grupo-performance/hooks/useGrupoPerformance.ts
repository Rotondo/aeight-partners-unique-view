
import { useMemo } from 'react';
import { Oportunidade } from '@/types';

export interface EmpresaPerformance {
  empresa: string;
  totalOportunidades: number;
  oportunidadesGanhas: number;
  taxaConversao: number;
  ticketMedioIntra: number;
  ticketMedioExtra: number;
  ticketMedioGeral: number;
  valorTotalIntra: number;
  valorTotalExtra: number;
  quantidadeIntra: number;
  quantidadeExtra: number;
}

export const useGrupoPerformance = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    // Filtrar apenas oportunidades destinadas ao grupo
    const oportunidadesGrupo = oportunidades.filter(op => 
      op.empresa_destino?.tipo === 'intragrupo'
    );

    const empresaMap = new Map<string, {
      total: number;
      ganhas: number;
      valorIntra: number;
      valorExtra: number;
      quantidadeIntra: number;
      quantidadeExtra: number;
    }>();

    oportunidadesGrupo.forEach(op => {
      const empresaDestino = op.empresa_destino?.nome || 'Desconhecida';
      const isIntra = op.empresa_origem?.tipo === 'intragrupo';
      const valor = op.valor || 0;
      const isGanha = op.status === 'ganho';

      const existing = empresaMap.get(empresaDestino) || {
        total: 0,
        ganhas: 0,
        valorIntra: 0,
        valorExtra: 0,
        quantidadeIntra: 0,
        quantidadeExtra: 0
      };

      existing.total += 1;
      if (isGanha) existing.ganhas += 1;

      if (isIntra) {
        existing.valorIntra += valor;
        existing.quantidadeIntra += 1;
      } else {
        existing.valorExtra += valor;
        existing.quantidadeExtra += 1;
      }

      empresaMap.set(empresaDestino, existing);
    });

    const empresasPerformance: EmpresaPerformance[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => ({
        empresa,
        totalOportunidades: data.total,
        oportunidadesGanhas: data.ganhas,
        taxaConversao: data.total > 0 ? (data.ganhas / data.total) * 100 : 0,
        ticketMedioIntra: data.quantidadeIntra > 0 ? data.valorIntra / data.quantidadeIntra : 0,
        ticketMedioExtra: data.quantidadeExtra > 0 ? data.valorExtra / data.quantidadeExtra : 0,
        ticketMedioGeral: data.total > 0 ? (data.valorIntra + data.valorExtra) / data.total : 0,
        valorTotalIntra: data.valorIntra,
        valorTotalExtra: data.valorExtra,
        quantidadeIntra: data.quantidadeIntra,
        quantidadeExtra: data.quantidadeExtra
      }));

    const rankingTicketMedio = [...empresasPerformance]
      .sort((a, b) => b.ticketMedioGeral - a.ticketMedioGeral);

    const rankingConversao = [...empresasPerformance]
      .sort((a, b) => b.taxaConversao - a.taxaConversao);

    return {
      empresasPerformance,
      rankingTicketMedio,
      rankingConversao
    };
  }, [oportunidades]);
};
