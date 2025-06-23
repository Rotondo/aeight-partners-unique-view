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
  qualidadeDados: {
    ganhasComValor: number;
    totalComValor: number;
    amostraMinima: boolean;
  };
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
      ganhasComValor: number;
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
        ganhasComValor: 0,
        valorIntra: 0,
        valorExtra: 0,
        quantidadeIntra: 0,
        quantidadeExtra: 0,
        quantidadeComValorIntra: 0,
        quantidadeComValorExtra: 0
      };

      existing.total += 1;
      if (isGanha) {
        existing.ganhas += 1;
        if (temValor) existing.ganhasComValor += 1;
      }

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
        ganhas: data.ganhas,
        ganhasComValor: data.ganhasComValor,
        valorTotal: data.valorIntra + data.valorExtra
      })),
      'Separação entre intra e extra + contagem de ganhas com valor',
      `${empresaMap.size} empresas processadas`
    );

    // Todas as empresas do grupo com pelo menos uma oportunidade com valor terão ticket médio calculado
    const empresasPerformance: EmpresaPerformance[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => {
        // Ticket médio: média das oportunidades com valor, independente de quantidade mínima
        const totalComValor = data.quantidadeComValorIntra + data.quantidadeComValorExtra;
        const ticketMedioIntra = data.quantidadeComValorIntra > 0 ? data.valorIntra / data.quantidadeComValorIntra : 0;
        const ticketMedioExtra = data.quantidadeComValorExtra > 0 ? data.valorExtra / data.quantidadeComValorExtra : 0;
        const ticketMedioGeral = totalComValor > 0 ? (data.valorIntra + data.valorExtra) / totalComValor : 0;

        // Conversão: oportunidades ganhas / oportunidades criadas (sempre exibe para todas as empresas)
        const taxaConversao = data.total > 0 ? (data.ganhas / data.total) * 100 : 0;

        // Dados de qualidade (mantém para info, mas rankings não usam mais mínimo)
        const qualidadeDados = {
          ganhasComValor: data.ganhasComValor,
          totalComValor: totalComValor,
          amostraMinima: true // forçamos true para todos, para ranking exibir todos
        };

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
          quantidadeComValorExtra: data.quantidadeComValorExtra,
          qualidadeDados
        };
      })
      .filter(emp => emp.totalOportunidades > 0); // Apenas empresas com dados

    addStep(
      calculationId,
      'calculate-performance',
      'Calcular métricas de performance sem restrição de amostra mínima',
      empresaMap.size,
      empresasPerformance.map(emp => ({
        empresa: emp.empresa,
        ticketMedioGeral: emp.ticketMedioGeral,
        baseCalculo: `${emp.qualidadeDados.totalComValor} ops com valor`,
        ganhasComValor: emp.qualidadeDados.ganhasComValor,
        amostraMinima: emp.qualidadeDados.amostraMinima
      })),
      'ticketMedio baseado em todas as oportunidades com valor, sem restrição de quantidade mínima',
      `${empresasPerformance.length} empresas processadas`
    );

    // Ranking por ticket médio: todas as empresas do grupo com pelo menos uma oportunidade com valor
    const rankingTicketMedio = [...empresasPerformance]
      .filter(emp => emp.ticketMedioGeral > 0)
      .sort((a, b) => b.ticketMedioGeral - a.ticketMedioGeral);

    // Ranking por conversão: todas as empresas, ordenadas por taxa de conversão
    const rankingConversao = [...empresasPerformance]
      .filter(emp => emp.totalOportunidades > 0)
      .sort((a, b) => b.taxaConversao - a.taxaConversao);

    addStep(
      calculationId,
      'create-rankings-no-quality-filter',
      'Criar rankings SEM restrição de amostra mínima',
      empresasPerformance.length,
      {
        ticketMedio: rankingTicketMedio.length,
        conversao: rankingConversao.length,
        topTicketMedio: rankingTicketMedio.slice(0, 3).map(emp => `${emp.empresa}: R$ ${emp.ticketMedioGeral.toLocaleString()}`),
        topConversao: rankingConversao.slice(0, 3).map(emp => `${emp.empresa}: ${emp.taxaConversao.toFixed(1)}%`)
      },
      'Ticket médio e conversão sem filtro de qualidade',
      `Rankings: ${rankingTicketMedio.length} para ticket, ${rankingConversao.length} para conversão`
    );

    const result = {
      empresasPerformance,
      rankingTicketMedio,
      rankingConversao,
      qualidadeGeral: {
        totalEmpresas: empresasPerformance.length,
        empresasComAmostraMinima: empresasPerformance.length, // todos contam agora
        totalOportunidadesComValor: empresasPerformance.reduce((sum, e) => sum + e.qualidadeDados.totalComValor, 0),
        totalGanhasComValor: empresasPerformance.reduce((sum, e) => sum + e.qualidadeDados.ganhasComValor, 0)
      }
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
