import { useMemo } from 'react';
import { Oportunidade } from '@/types';
import { useCalculationMemory } from '@/modules/calculation-debug/hooks/useCalculationMemory';

export interface CycleTimeMetrics {
  empresa: string;
  tempoMedio: number; // em dias, só de fechadas
  tempoMinimo: number;
  tempoMaximo: number;
  oportunidadesFechadas: number;
  emAndamento: number;
  ticketMedio: number;
  totalValor: number;
  oportunidadesSemValor: number;
  totalOportunidades: number;
}

const diffInDays = (a: Date, b: Date) =>
  Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export const useCycleTimeAnalysis = (oportunidades: Oportunidade[]) => {
  const { startCalculation, addStep, finishCalculation } = useCalculationMemory();

  return useMemo(() => {
    const calculationId = 'cycle-time-analysis';
    const today = new Date();
    const memory = startCalculation(calculationId, 'Análise de Tempo de Ciclo', oportunidades);

    // Considera oportunidades direcionadas ao grupo (empresa_destino.tipo === 'intragrupo')
    const oportunidadesGrupo = oportunidades.filter(
      op => op.empresa_destino?.tipo === 'intragrupo'
    );

    // Oportunidades fechadas (ganho ou perdido com data_fechamento)
    const oportunidadesFechadas = oportunidadesGrupo.filter(
      op => (op.status === 'ganho' || op.status === 'perdido')
        && op.data_fechamento
        && op.data_indicacao
    );

    // Oportunidades em andamento (em_contato ou negociando)
    const emAndamento = oportunidadesGrupo.filter(
      op => (op.status === 'em_contato' || op.status === 'negociando')
    );

    // Para cálculo do tempo médio de ciclo filtrado: só oportunidades fechadas, data abertura no filtro
    // Como não há filtro de data explícito, considerar todas do conjunto filtrado
    const tempoMedioCicloFiltrado = (() => {
      if (oportunidadesFechadas.length === 0) return 0;
      const somaTempos = oportunidadesFechadas.reduce((sum, op) => {
        const inicio = new Date(op.data_indicacao!);
        const fim = new Date(op.data_fechamento!);
        return sum + diffInDays(fim, inicio);
      }, 0);
      return Math.round(somaTempos / oportunidadesFechadas.length);
    })();

    // Tempo médio de ciclo geral: TODAS as oportunidades (fechadas e em aberto)
    // Data final é data_fechamento se existe, senão hoje
    const oportunidadesParaCicloGeral = oportunidadesGrupo.filter(
      op => op.data_indicacao
    );
    const tempoMedioCicloGeral = (() => {
      if (oportunidadesParaCicloGeral.length === 0) return 0;
      const somaTempos = oportunidadesParaCicloGeral.reduce((sum, op) => {
        const inicio = new Date(op.data_indicacao!);
        const fim = op.data_fechamento ? new Date(op.data_fechamento) : today;
        return sum + diffInDays(fim, inicio);
      }, 0);
      return Math.round(somaTempos / oportunidadesParaCicloGeral.length);
    })();

    // Agrupamento por empresa destino
    const empresaMap = new Map<string, {
      tempos: number[];
      tempoMin: number | null;
      tempoMax: number | null;
      oportunidadesFechadas: number;
      emAndamento: number;
      valores: number[];
      oportunidadesSemValor: number;
      totalOportunidades: number;
    }>();

    // Processa todas as oportunidades do grupo para cada empresa
    oportunidadesGrupo.forEach(op => {
      const empresaDestino = op.empresa_destino?.nome || 'Desconhecida';
      const hasValor = op.valor && op.valor > 0;
      const isFechada = (op.status === 'ganho' || op.status === 'perdido') && op.data_fechamento && op.data_indicacao;
      const isEmAberto = op.status === 'em_contato' || op.status === 'negociando';

      let data = empresaMap.get(empresaDestino);
      if (!data) {
        data = {
          tempos: [],
          tempoMin: null,
          tempoMax: null,
          oportunidadesFechadas: 0,
          emAndamento: 0,
          valores: [],
          oportunidadesSemValor: 0,
          totalOportunidades: 0,
        };
        empresaMap.set(empresaDestino, data);
      }

      data.totalOportunidades += 1;

      if (isFechada) {
        const inicio = new Date(op.data_indicacao!);
        const fim = new Date(op.data_fechamento!);
        const tempo = diffInDays(fim, inicio);
        data.tempos.push(tempo);
        data.oportunidadesFechadas += 1;
        data.tempoMin = data.tempoMin === null ? tempo : Math.min(data.tempoMin, tempo);
        data.tempoMax = data.tempoMax === null ? tempo : Math.max(data.tempoMax, tempo);
      }
      if (isEmAberto) {
        data.emAndamento += 1;
      }
      if (hasValor) {
        data.valores.push(op.valor!);
      } else {
        data.oportunidadesSemValor += 1;
      }
    });

    // Monta métricas por empresa
    const metrics = Array.from(empresaMap.entries())
      .map(([empresa, data]) => {
        const ticketMedio =
          data.valores.length > 0
            ? data.valores.reduce((sum, v) => sum + v, 0) / data.valores.length
            : 0;
        const totalValor = data.valores.reduce((sum, v) => sum + v, 0);

        return {
          empresa,
          tempoMedio:
            data.tempos.length > 0
              ? Math.round(data.tempos.reduce((sum, t) => sum + t, 0) / data.tempos.length)
              : 0,
          tempoMinimo: data.tempoMin ?? 0,
          tempoMaximo: data.tempoMax ?? 0,
          oportunidadesFechadas: data.oportunidadesFechadas,
          emAndamento: data.emAndamento,
          ticketMedio,
          totalValor,
          oportunidadesSemValor: data.oportunidadesSemValor,
          totalOportunidades: data.totalOportunidades,
        };
      })
      .filter(
        metric =>
          metric.oportunidadesFechadas > 0 ||
          metric.emAndamento > 0 ||
          metric.totalOportunidades > 0
      )
      .sort((a, b) => b.tempoMedio - a.tempoMedio);

    addStep(
      calculationId,
      'calculate-metrics',
      'Calcular métricas de tempo por empresa',
      Array.from(empresaMap.entries()).map(([empresa, data]) => ({
        empresa,
        tempos: data.tempos,
        valores: data.valores,
      })),
      metrics.map(m => ({
        empresa: m.empresa,
        tempoMedio: m.tempoMedio,
        ticketMedio: m.ticketMedio,
        totalValor: m.totalValor,
        oportunidadesSemValor: m.oportunidadesSemValor,
        totalOportunidades: m.totalOportunidades,
      })),
      'Métricas completas por empresa, ticket médio e valor total considerando todas com valor (>0), independente do status',
      `${metrics.length} empresas com métricas calculadas`
    );

    finishCalculation(calculationId, {
      metrics,
      totalEmAndamento: emAndamento.length,
      tempoMedioCicloFiltrado,
      tempoMedioCicloGeral,
    });

    return {
      metrics,
      totalEmAndamento: emAndamento.length,
      tempoMedioCicloFiltrado,
      tempoMedioCicloGeral,
    };
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
