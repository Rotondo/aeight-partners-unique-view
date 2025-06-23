
import { useMemo } from 'react';
import { Oportunidade } from '@/types';

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

export const useCycleTimeAnalysis = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    // Filtrar apenas oportunidades fechadas (ganho ou perdido) para análise de tempo
    const oportunidadesFechadas = oportunidades.filter(op => 
      (op.status === 'ganho' || op.status === 'perdido') && 
      op.data_fechamento && 
      op.empresa_destino?.tipo === 'intragrupo'
    );

    // Oportunidades em andamento por empresa
    const emAndamento = oportunidades.filter(op => 
      (op.status === 'em_contato' || op.status === 'negociando') &&
      op.empresa_destino?.tipo === 'intragrupo'
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
        const temposOrdenados = [...data.tempos].sort((a, b) => a - b);
        const tempoMedio = data.tempos.length > 0 ? 
          data.tempos.reduce((sum, tempo) => sum + tempo, 0) / data.tempos.length : 0;
        
        const tempoMediana = temposOrdenados.length > 0 ? 
          temposOrdenados.length % 2 === 0 ?
            (temposOrdenados[temposOrdenados.length / 2 - 1] + temposOrdenados[temposOrdenados.length / 2]) / 2 :
            temposOrdenados[Math.floor(temposOrdenados.length / 2)] : 0;

        const ticketMedio = data.valores.length > 0 ?
          data.valores.reduce((sum, valor) => sum + valor, 0) / data.valores.length : 0;
        
        const totalValor = data.valores.reduce((sum, valor) => sum + valor, 0);

        return {
          empresa,
          tempoMedio: Math.round(tempoMedio),
          tempoMinimo: temposOrdenados.length > 0 ? temposOrdenados[0] : 0,
          tempoMaximo: temposOrdenados.length > 0 ? temposOrdenados[temposOrdenados.length - 1] : 0,
          tempoMediana: Math.round(tempoMediana),
          oportunidadesFechadas: data.oportunidadesFechadas,
          emAndamento: data.emAndamento,
          ticketMedio,
          totalValor
        };
      })
      .filter(metric => metric.oportunidadesFechadas > 0 || metric.emAndamento > 0)
      .sort((a, b) => b.tempoMedio - a.tempoMedio);

    // Métricas gerais
    const totalEmAndamento = emAndamento.length;
    const tempoMedioGeral = metrics.length > 0 ?
      metrics.reduce((sum, m) => sum + (m.tempoMedio * m.oportunidadesFechadas), 0) / 
      metrics.reduce((sum, m) => sum + m.oportunidadesFechadas, 0) : 0;

    return {
      metrics,
      totalEmAndamento,
      tempoMedioGeral: Math.round(tempoMedioGeral),
      totalEmpresasAnalisadas: metrics.length
    };
  }, [oportunidades]);
};
