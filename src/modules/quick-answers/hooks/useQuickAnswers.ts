
import { useMemo } from 'react';
import { Oportunidade } from '@/types';
import { useCalculationMemory } from '@/modules/calculation-debug/hooks/useCalculationMemory';

export const useQuickAnswers = (oportunidades: Oportunidade[]) => {
  const { startCalculation, addStep, finishCalculation } = useCalculationMemory();

  return useMemo(() => {
    const calculationId = 'quick-answers';
    const memory = startCalculation(calculationId, 'Respostas Rápidas', oportunidades);

    // Filtrar apenas empresas do grupo como destino
    const oportunidadesGrupo = oportunidades.filter(op => 
      op.empresa_destino?.tipo === 'intragrupo'
    );
    
    addStep(
      calculationId,
      'filter-grupo',
      'Filtrar oportunidades destinadas ao grupo',
      { total: oportunidades.length },
      { filtradas: oportunidadesGrupo.length },
      'op.empresa_destino?.tipo === "intragrupo"',
      `${oportunidadesGrupo.length} de ${oportunidades.length} oportunidades são destinadas ao grupo`
    );

    // Total de oportunidades no período
    const totalOportunidades = oportunidadesGrupo.length;
    
    addStep(
      calculationId,
      'total-count',
      'Contar total de oportunidades do grupo',
      oportunidadesGrupo,
      totalOportunidades,
      'oportunidadesGrupo.length',
      `Total confirmado: ${totalOportunidades} oportunidades`
    );

    // Oportunidades por empresa de destino
    const porEmpresaDestino = oportunidadesGrupo.reduce((acc, op) => {
      const empresa = op.empresa_destino?.nome || 'Desconhecida';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    addStep(
      calculationId,
      'group-by-destination',
      'Agrupar por empresa de destino',
      oportunidadesGrupo,
      porEmpresaDestino,
      'reduce((acc, op) => acc[empresa] = (acc[empresa] || 0) + 1)',
      `${Object.keys(porEmpresaDestino).length} empresas de destino identificadas`
    );

    // Ranking de empresas que mais enviam (origem)
    const porEmpresaOrigem = oportunidadesGrupo.reduce((acc, op) => {
      const empresa = op.empresa_origem?.nome || 'Desconhecida';
      const tipo = op.empresa_origem?.tipo || 'desconhecido';
      
      if (!acc[empresa]) {
        acc[empresa] = { total: 0, ganhas: 0, valores: [], tipo };
      }
      
      acc[empresa].total += 1;
      if (op.status === 'ganho') {
        acc[empresa].ganhas += 1;
      }
      if (op.valor && op.valor > 0) {
        acc[empresa].valores.push(op.valor);
      }
      
      return acc;
    }, {} as Record<string, { total: number; ganhas: number; valores: number[]; tipo: string }>);

    addStep(
      calculationId,
      'group-by-origin',
      'Agrupar por empresa de origem com métricas',
      oportunidadesGrupo,
      Object.keys(porEmpresaOrigem).length,
      'reduce com contadores de total, ganhas e valores',
      `${Object.keys(porEmpresaOrigem).length} empresas de origem processadas`
    );

    // Calcular qualidade das empresas origem
    const rankingOrigem = Object.entries(porEmpresaOrigem)
      .map(([empresa, data]) => {
        const taxaConversao = data.total > 0 ? (data.ganhas / data.total) * 100 : 0;
        const ticketMedio = data.valores.length > 0 ? 
          data.valores.reduce((sum, v) => sum + v, 0) / data.valores.length : 0;
        const valorTotal = data.valores.reduce((sum, v) => sum + v, 0);
        
        // Score melhorado: considera volume (30%), conversão (40%), valor médio (30%)
        const volumeScore = Math.min(data.total / 10, 1) * 30; // Máximo 30 pontos para volume
        const conversaoScore = taxaConversao * 0.4; // Máximo 40 pontos para conversão
        const valorScore = Math.min(ticketMedio / 100000, 1) * 30; // Máximo 30 pontos para valor
        const score = volumeScore + conversaoScore + valorScore;

        return {
          empresa,
          tipo: data.tipo,
          totalOportunidades: data.total,
          oportunidadesGanhas: data.ganhas,
          taxaConversao,
          ticketMedio,
          valorTotal,
          score
        };
      })
      .sort((a, b) => b.score - a.score);

    addStep(
      calculationId,
      'calculate-ranking',
      'Calcular ranking com score ponderado',
      Object.keys(porEmpresaOrigem).length,
      rankingOrigem.slice(0, 3),
      'score = volume(30%) + conversão(40%) + valor(30%)',
      `Top 3: ${rankingOrigem.slice(0, 3).map(r => `${r.empresa}(${r.score.toFixed(1)})`).join(', ')}`
    );

    // Ticket médio por empresa de destino (apenas com valores > 0)
    const ticketMedioPorEmpresa = oportunidadesGrupo
      .filter(op => op.valor && op.valor > 0)
      .reduce((acc, op) => {
        const empresa = op.empresa_destino?.nome || 'Desconhecida';
        if (!acc[empresa]) {
          acc[empresa] = { valores: [], total: 0 };
        }
        acc[empresa].valores.push(op.valor!);
        acc[empresa].total += 1;
        return acc;
      }, {} as Record<string, { valores: number[]; total: number }>);

    const ticketMedioRanking = Object.entries(ticketMedioPorEmpresa)
      .map(([empresa, data]) => ({
        empresa,
        ticketMedio: data.valores.reduce((sum, v) => sum + v, 0) / data.valores.length,
        totalComValor: data.total,
        valorTotal: data.valores.reduce((sum, v) => sum + v, 0)
      }))
      .sort((a, b) => b.ticketMedio - a.ticketMedio);

    addStep(
      calculationId,
      'ticket-medio-calculation',
      'Calcular ticket médio (apenas valores > 0)',
      { totalComValor: oportunidadesGrupo.filter(op => op.valor && op.valor > 0).length },
      ticketMedioRanking.slice(0, 3),
      'sum(valores) / count(valores > 0)',
      `Top 3 ticket médio: ${ticketMedioRanking.slice(0, 3).map(r => `${r.empresa}: R$ ${r.ticketMedio.toLocaleString()}`).join(', ')}`
    );

    // Oportunidades em aberto
    const emAberto = oportunidadesGrupo.filter(op => 
      op.status === 'em_contato' || op.status === 'negociando'
    ).length;

    addStep(
      calculationId,
      'open-opportunities',
      'Contar oportunidades em aberto',
      oportunidadesGrupo,
      emAberto,
      'status === "em_contato" || status === "negociando"',
      `${emAberto} oportunidades em aberto identificadas`
    );

    const result = {
      totalOportunidades,
      porEmpresaDestino,
      rankingOrigem,
      ticketMedioRanking,
      emAberto,
      melhorEmpresaOrigem: rankingOrigem[0] || null,
      empresaComMaiorTicket: ticketMedioRanking[0] || null
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
