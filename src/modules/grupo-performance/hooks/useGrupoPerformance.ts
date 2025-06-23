
import { useMemo } from 'react';
import { Oportunidade } from '@/types';
import { useCalculationMemory } from '@/modules/calculation-debug/hooks/useCalculationMemory';

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
  const { startCalculation, addStep, finishCalculation } = useCalculationMemory();

  return useMemo(() => {
    const calculationId = 'grupo-performance';
    const memory = startCalculation(calculationId, 'Performance do Grupo', oportunidades);

    // Filtrar apenas oportunidades destinadas ao grupo
    const oportunidadesGrupo = oportunidades.filter(op => 
      op.empresa_destino?.tipo === 'intragrupo'
    );

    addStep(
      calculationId,
      'filter-grupo-destino',
      'Filtrar oportunidades destinadas ao grupo',
      { total: oportunidades.length },
      { grupoDestino: oportunidadesGrupo.length },
      'op.empresa_destino?.tipo === "intragrupo"',
      `${oportunidadesGrupo.length} de ${oportunidades.length} são destinadas ao grupo`
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

    addStep(
      calculationId,
      'process-by-company',
      'Agrupar e processar por empresa de destino',
      oportunidadesGrupo.length,
      Array.from(empresaMap.entries()).map(([empresa, data]) => ({
        empresa,
        total: data.total,
        intra: data.quantidadeIntra,
        extra: data.quantidadeExtra,
        valorIntra: data.valorIntra,
        valorExtra: data.valorExtra
      })),
      'Separação entre intra (origem=intragrupo) e extra (origem≠intragrupo)',
      `${empresaMap.size} empresas processadas`
    );

    const empresasPerformance: EmpresaPerformance[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => {
        const taxaConversao = data.total > 0 ? (data.ganhas / data.total) * 100 : 0;
        
        // CORREÇÃO: Ticket médio apenas para oportunidades COM VALOR
        const ticketMedioIntra = data.quantidadeComValorIntra > 0 ? data.valorIntra / data.quantidadeComValorIntra : 0;
        const ticketMedioExtra = data.quantidadeComValorExtra > 0 ? data.valorExtra / data.quantidadeComValorExtra : 0;
        const ticketMedioGeral = (data.quantidadeComValorIntra + data.quantidadeComValorExtra) > 0 ? 
          (data.valorIntra + data.valorExtra) / (data.quantidadeComValorIntra + data.quantidadeComValorExtra) : 0;

        return {
          empresa,
          totalOportunidades: data.total,
          oportunidadesGanhas: data.ganhas,
          taxaConversao,
          ticketMedioIntra,
          ticketMedioExtra,
          ticketMedioGeral,
          valorTotalIntra: data.valorIntra,
          valorTotalExtra: data.valorExtra,
          quantidadeIntra: data.quantidadeIntra,
          quantidadeExtra: data.quantidadeExtra,
          quantidadeComValorIntra: data.quantidadeComValorIntra,
          quantidadeComValorExtra: data.quantidadeComValorExtra
        };
      });

    addStep(
      calculationId,
      'calculate-performance',
      'Calcular métricas de performance',
      empresaMap.size,
      empresasPerformance.map(emp => ({
        empresa: emp.empresa,
        ticketMedioGeral: emp.ticketMedioGeral,
        baseCalculo: `${emp.quantidadeComValorIntra + emp.quantidadeComValorExtra} ops com valor`,
        taxaConversao: emp.taxaConversao
      })),
      'ticketMedio = valorTotal / quantidadeComValor (apenas ops com valor > 0)',
      `Ticket médio calculado para ${empresasPerformance.length} empresas`
    );

    const rankingTicketMedio = [...empresasPerformance]
      .filter(emp => emp.ticketMedioGeral > 0) // Apenas empresas com valores
      .sort((a, b) => b.ticketMedioGeral - a.ticketMedioGeral);

    const rankingConversao = [...empresasPerformance]
      .filter(emp => emp.totalOportunidades > 0)
      .sort((a, b) => b.taxaConversao - a.taxaConversao);

    addStep(
      calculationId,
      'create-rankings',
      'Criar rankings por ticket médio e conversão',
      empresasPerformance.length,
      {
        topTicketMedio: rankingTicketMedio.slice(0, 3).map(emp => `${emp.empresa}: R$ ${emp.ticketMedioGeral.toLocaleString()}`),
        topConversao: rankingConversao.slice(0, 3).map(emp => `${emp.empresa}: ${emp.taxaConversao.toFixed(1)}%`)
      },
      'Ordenação decrescente por valor',
      `Rankings criados com ${rankingTicketMedio.length} e ${rankingConversao.length} empresas`
    );

    const result = {
      empresasPerformance,
      rankingTicketMedio,
      rankingConversao
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
