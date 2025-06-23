
import { useMemo } from 'react';
import { Oportunidade } from '@/types';
import { useCalculationMemory } from '@/modules/calculation-debug/hooks/useCalculationMemory';

export interface CycleTimeMetrics {
  empresa: string;
  tempoMedio: number; // em dias
  tempoMinimo: number;
  tempoMaximo: number;
  tempoMediana: number;
  oportunidadesFechadas: number;
  emAndamento: number;
  ticketMedio: number;
  totalValor: number;
}

// Função para calcular mediana corretamente
const calcularMediana = (valores: number[]): number => {
  if (valores.length === 0) return 0;
  
  const sorted = [...valores].sort((a, b) => a - b);
  const meio = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    // Par: média dos dois valores centrais
    return (sorted[meio - 1] + sorted[meio]) / 2;
  } else {
    // Ímpar: valor central
    return sorted[meio];
  }
};

export const useCycleTimeAnalysis = (oportunidades: Oportunidade[]) => {
  const { startCalculation, addStep, finishCalculation } = useCalculationMemory();

  return useMemo(() => {
    const calculationId = 'cycle-time-analysis';
    const memory = startCalculation(calculationId, 'Análise de Tempo de Ciclo', oportunidades);

    // Filtrar apenas oportunidades fechadas (ganho ou perdido) para análise de tempo
    const oportunidadesFechadas = oportunidades.filter(op => 
      (op.status === 'ganho' || op.status === 'perdido') && 
      op.data_fechamento && 
      op.empresa_destino?.tipo === 'intragrupo'
    );

    addStep(
      calculationId,
      'filter-closed',
      'Filtrar oportunidades fechadas do grupo',
      { total: oportunidades.length },
      { fechadas: oportunidadesFechadas.length },
      '(status === "ganho" || status === "perdido") && data_fechamento && empresa_destino.tipo === "intragrupo"',
      `${oportunidadesFechadas.length} oportunidades fechadas encontradas`
    );

    // Oportunidades em andamento por empresa
    const emAndamento = oportunidades.filter(op => 
      (op.status === 'em_contato' || op.status === 'negociando') &&
      op.empresa_destino?.tipo === 'intragrupo'
    );

    addStep(
      calculationId,
      'filter-ongoing',
      'Filtrar oportunidades em andamento do grupo',
      { total: oportunidades.length },
      { emAndamento: emAndamento.length },
      '(status === "em_contato" || status === "negociando") && empresa_destino.tipo === "intragrupo"',
      `${emAndamento.length} oportunidades em andamento encontradas`
    );

    const empresaMap = new Map<string, {
      tempos: number[];
      oportunidadesFechadas: number;
      emAndamento: number;
      valores: number[];
    }>();

    // Processar oportunidades fechadas
    oportunidadesFechadas.forEach(op => {
      const empresaDestino = op.empresa_destino?.nome || 'Desconhecida';
      const dataIndicacao = new Date(op.data_indicacao);
      const dataFechamento = new Date(op.data_fechamento!);
      const tempoEmDias = Math.ceil((dataFechamento.getTime() - dataIndicacao.getTime()) / (1000 * 60 * 60 * 24));

      const existing = empresaMap.get(empresaDestino) || {
        tempos: [],
        oportunidadesFechadas: 0,
        emAndamento: 0,
        valores: []
      };

      existing.tempos.push(tempoEmDias);
      existing.oportunidadesFechadas += 1;
      if (op.valor && op.valor > 0) {
        existing.valores.push(op.valor);
      }

      empresaMap.set(empresaDestino, existing);
    });

    addStep(
      calculationId,
      'process-closed',
      'Processar tempos de fechamento por empresa',
      oportunidadesFechadas.length,
      Array.from(empresaMap.entries()).map(([empresa, data]) => ({ empresa, tempos: data.tempos.length })),
      'Math.ceil((dataFechamento - dataIndicacao) / (1000 * 60 * 60 * 24))',
      `${empresaMap.size} empresas processadas`
    );

    // Processar oportunidades em andamento
    emAndamento.forEach(op => {
      const empresaDestino = op.empresa_destino?.nome || 'Desconhecida';
      const existing = empresaMap.get(empresaDestino) || {
        tempos: [],
        oportunidadesFechadas: 0,
        emAndamento: 0,
        valores: []
      };

      existing.emAndamento += 1;
      empresaMap.set(empresaDestino, existing);
    });

    // Calcular métricas por empresa
    const metrics: CycleTimeMetrics[] = Array.from(empresaMap.entries())
      .map(([empresa, data]) => {
        const tempoMedio = data.tempos.length > 0 ? 
          data.tempos.reduce((sum, tempo) => sum + tempo, 0) / data.tempos.length : 0;
        
        // CORREÇÃO: Cálculo correto da mediana
        const tempoMediana = calcularMediana(data.tempos);

        const ticketMedio = data.valores.length > 0 ?
          data.valores.reduce((sum, valor) => sum + valor, 0) / data.valores.length : 0;
        
        const totalValor = data.valores.reduce((sum, valor) => sum + valor, 0);

        return {
          empresa,
          tempoMedio: Math.round(tempoMedio),
          tempoMinimo: data.tempos.length > 0 ? Math.min(...data.tempos) : 0,
          tempoMaximo: data.tempos.length > 0 ? Math.max(...data.tempos) : 0,
          tempoMediana: Math.round(tempoMediana),
          oportunidadesFechadas: data.oportunidadesFechadas,
          emAndamento: data.emAndamento,
          ticketMedio,
          totalValor
        };
      })
      .filter(metric => metric.oportunidadesFechadas > 0 || metric.emAndamento > 0)
      .sort((a, b) => b.tempoMedio - a.tempoMedio);

    addStep(
      calculationId,
      'calculate-metrics',
      'Calcular métricas de tempo por empresa',
      Array.from(empresaMap.entries()).map(([empresa, data]) => ({ empresa, tempos: data.tempos })),
      metrics.map(m => ({ 
        empresa: m.empresa, 
        medio: m.tempoMedio, 
        mediana: m.tempoMediana,
        validacao: m.tempoMedio === m.tempoMediana ? 'Apenas 1 registro' : 'Média ≠ Mediana (correto)'
      })),
      'média = sum(tempos)/count(tempos); mediana = valor central ordenado',
      `${metrics.length} empresas com métricas calculadas`
    );

    // Métricas gerais
    const totalEmAndamento = emAndamento.length;
    const tempoMedioGeral = metrics.length > 0 ?
      metrics.reduce((sum, m) => sum + (m.tempoMedio * m.oportunidadesFechadas), 0) / 
      metrics.reduce((sum, m) => sum + m.oportunidadesFechadas, 0) : 0;

    const result = {
      metrics,
      totalEmAndamento,
      tempoMedioGeral: Math.round(tempoMedioGeral),
      totalEmpresasAnalisadas: metrics.length
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
