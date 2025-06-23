
import { useMemo } from 'react';
import type { Meta, MetaProgress } from '@/types/metas';
import { differenceInDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';

export interface MetaProbabilidadeData {
  meta: Meta;
  realizado: number;
  diasPassados: number;
  diasRestantes: number;
  mediaDiariaAtual: number;
  mediaDiariaNecessaria: number;
  probabilidadeAtingimento: number;
  tendencia: 'acima' | 'dentro' | 'abaixo';
  projecaoFinal: number;
  faltaParaMeta: number;
}

export const useMetaProbabilidade = (metasProgress: MetaProgress[]): MetaProbabilidadeData[] => {
  return useMemo(() => {
    const hoje = new Date();

    return metasProgress.map(metaProgress => {
      const { meta, realizado } = metaProgress;
      
      // Calcular período da meta
      let inicioMeta: Date;
      let fimMeta: Date;

      if (meta.periodo === 'mensal') {
        inicioMeta = startOfMonth(new Date(meta.ano, (meta.mes || 1) - 1));
        fimMeta = endOfMonth(new Date(meta.ano, (meta.mes || 1) - 1));
      } else {
        // trimestral
        const quarterStart = ((meta.trimestre || 1) - 1) * 3;
        inicioMeta = startOfQuarter(new Date(meta.ano, quarterStart));
        fimMeta = endOfQuarter(new Date(meta.ano, quarterStart));
      }

      // Calcular dias
      const diasTotais = differenceInDays(fimMeta, inicioMeta) + 1;
      const diasPassados = Math.max(1, differenceInDays(hoje, inicioMeta) + 1);
      const diasRestantes = Math.max(0, differenceInDays(fimMeta, hoje));

      // Calcular médias
      const mediaDiariaAtual = diasPassados > 0 ? realizado / diasPassados : 0;
      const mediaDiariaNecessaria = diasTotais > 0 ? meta.valor_meta / diasTotais : 0;

      // Projeção final baseada na média atual
      const projecaoFinal = mediaDiariaAtual * diasTotais;

      // Probabilidade de atingimento (0-100%)
      const probabilidadeAtingimento = meta.valor_meta > 0 ? 
        Math.min(100, (projecaoFinal / meta.valor_meta) * 100) : 0;

      // Determinar tendência
      let tendencia: 'acima' | 'dentro' | 'abaixo';
      if (probabilidadeAtingimento >= 100) {
        tendencia = 'acima';
      } else if (probabilidadeAtingimento >= 80) {
        tendencia = 'dentro';
      } else {
        tendencia = 'abaixo';
      }

      const faltaParaMeta = Math.max(0, meta.valor_meta - realizado);

      return {
        meta,
        realizado,
        diasPassados,
        diasRestantes,
        mediaDiariaAtual,
        mediaDiariaNecessaria,
        probabilidadeAtingimento,
        tendencia,
        projecaoFinal,
        faltaParaMeta
      };
    });
  }, [metasProgress]);
};
