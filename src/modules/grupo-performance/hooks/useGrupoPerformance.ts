
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
  // Dados de qualidade
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

    const empresasPerformance: EmpresaPerformance[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => {
        const taxaConversao = data.total > 0 ? (data.ganhas / data.total) * 100 : 0;
        
        // CORREÇÃO: Ticket médio APENAS para oportunidades ganhas COM VALOR
        const ticketMedioIntra = data.ganhasComValor > 0 && data.valorIntra > 0 ? 
          data.valorIntra / data.quantidadeComValorIntra : 0;
        const ticketMedioExtra = data.ganhasComValor > 0 && data.valorExtra > 0 ? 
          data.valorExtra / data.quantidadeComValorExtra : 0;
        const totalComValor = data.quantidadeComValorIntra + data.quantidadeComValorExtra;
        const ticketMedioGeral = totalComValor > 0 ? 
          (data.valorIntra + data.valorExtra) / totalComValor : 0;

        // Dados de qualidade
        const qualidadeDados = {
          ganhasComValor: data.ganhasComValor,
          totalComValor: totalComValor,
          amostraMinima: data.ganhasComValor >= 2 && totalComValor >= 3
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
      'Calcular métricas de performance com validação de qualidade',
      empresaMap.size,
      empresasPerformance.map(emp => ({
        empresa: emp.empresa,
        ticketMedioGeral: emp.ticketMedioGeral,
        baseCalculo: `${emp.qualidadeDados.totalComValor} ops com valor`,
        ganhasComValor: emp.qualidadeDados.ganhasComValor,
        amostraMinima: emp.qualidadeDados.amostraMinima
      })),
      'ticketMedio baseado APENAS em oportunidades com valor, validação de amostra mínima',
      `${empresasPerformance.length} empresas processadas, ${empresasPerformance.filter(e => e.qualidadeDados.amostraMinima).length} com amostra mínima`
    );

    // Rankings com filtro de qualidade
    const rankingTicketMedio = [...empresasPerformance]
      .filter(emp => emp.ticketMedioGeral > 0 && emp.qualidadeDados.amostraMinima) // Apenas com amostra mínima
      .sort((a, b) => b.ticketMedioGeral - a.ticketMedioGeral);

    const rankingConversao = [...empresasPerformance]
      .filter(emp => emp.totalOportunidades >= 5) // Mínimo 5 oportunidades para conversão
      .sort((a, b) => b.taxaConversao - a.taxaConversao);

    addStep(
      calculationId,
      'create-rankings-with-quality',
      'Criar rankings com critérios de qualidade',
      empresasPerformance.length,
      {
        ticketMedioComQualidade: rankingTicketMedio.length,
        conversaoComQualidade: rankingConversao.length,
        topTicketMedio: rankingTicketMedio.slice(0, 3).map(emp => `${emp.empresa}: R$ ${emp.ticketMedioGeral.toLocaleString()}`),
        topConversao: rankingConversao.slice(0, 3).map(emp => `${emp.empresa}: ${emp.taxaConversao.toFixed(1)}%`)
      },
      'Ticket médio: amostra mínima. Conversão: min 5 oportunidades',
      `Rankings com qualidade: ${rankingTicketMedio.length} para ticket, ${rankingConversao.length} para conversão`
    );

    const result = {
      empresasPerformance,
      rankingTicketMedio,
      rankingConversao,
      // Indicadores de qualidade geral
      qualidadeGeral: {
        totalEmpresas: empresasPerformance.length,
        empresasComAmostraMinima: empresasPerformance.filter(e => e.qualidadeDados.amostraMinima).length,
        totalOportunidadesComValor: empresasPerformance.reduce((sum, e) => sum + e.qualidadeDados.totalComValor, 0),
        totalGanhasComValor: empresasPerformance.reduce((sum, e) => sum + e.qualidadeDados.ganhasComValor, 0)
      }
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
