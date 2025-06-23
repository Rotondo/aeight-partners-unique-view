
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
  quantidadeComValorIntra: number;
  quantidadeComValorExtra: number;
}

export const useGrupoPerformance = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    // Filtrar apenas oportunidades destinadas ao grupo
    const oportunidadesGrupo = oportunidades.filter(op => 
      op.empresa_destino?.tipo === 'in tragrupo'
    );

    const empresaMap = new Map<string, {
      total: number;
      ganhas: number;
      valorIntra: number;
      valorExtra: number;
      quantidadeIntra: number;
      quantidadeExtra: number;
      quantidadeComValorIntra: number;
      quantidadeComValorExtra: number;
    }>();

    oportunidadesGrupo.forEach(op => {
      const empresaDestino = op.empresa_destino?.nome || 'Desconhecida';
      const isIntra = op.empresa_origem?.tipo === 'intragrupo';
      const valor = (op.valor && op.valor > 0) ? op.valor : 0;
      const isGanha = op.status === 'ganho';
      const temValor = valor > 0;

      const existing = empresaMap.get(empresaDestino) || {
        total: 0,
        ganhas: 0,
        valorIntra: 0,
        valorExtra: 0,
        quantidadeIntra: 0,
        quantidadeExtra: 0,
        quantidadeComValorIntra: 0,
        quantidadeComValorExtra: 0
      };

      existing.total += 1;
      if (isGanha) existing.ganhas += 1;

      if (isIntra) {
        existing.valorIntra += valor;
        existing.quantidadeIntra += 1;
        if (temValor) existing.quantidadeComValorIntra += 1;
      } else {
        existing.valorExtra += valor;
        existing.quantidadeExtra += 1;
        if (temValor) existing.quantidadeComValorExtra += 1;
      }

      empresaMap.set(empresaDestino, existing);
    });

    const empresasPerformance: EmpresaPerformance[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => ({
        empresa,
        totalOportunidades: data.total,
        oportunidadesGanhas: data.ganhas,
        taxaConversao: data.total > 0 ? (data.ganhas / data.total) * 100 : 0,
        // CORRIGIDO: Ticket médio apenas para oportunidades COM VALOR
        ticketMedioIntra: data.quantidadeComValorIntra > 0 ? data.valorIntra / data.quantidadeComValorIntra : 0,
        ticketMedioExtra: data.quantidadeComValorExtra > 0 ? data.valorExtra / data.quantidadeComValorExtra : 0,
        ticketMedioGeral: (data.quantidadeComValorIntra + data.quantidadeComValorExtra) > 0 ? 
          (data.valorIntra + data.valorExtra) / (data.quantidadeComValorIntra + data.quantidadeComValorExtra) : 0,
        valorTotalIntra: data.valorIntra,
        valorTotalExtra: data.valorExtra,
        quantidadeIntra: data.quantidadeIntra,
        quantidadeExtra: data.quantidadeExtra,
        quantidadeComValorIntra: data.quantidadeComValorIntra,
        quantidadeComValorExtra: data.quantidadeComValorExtra
      }));

    const rankingTicketMedio = [...empresasPerformance]
      .filter(emp => emp.ticketMedioGeral > 0) // Apenas empresas com valores
      .sort((a, b) => b.ticketMedioGeral - a.ticketMedioGeral);

    const rankingConversao = [...empresasPerformance]
      .filter(emp => emp.totalOportunidades > 0)
      .sort((a, b) => b.taxaConversao - a.taxaConversao);

    return {
      empresasPerformance,
      rankingTicketMedio,
      rankingConversao
    };
  }, [oportunidades]);
};
