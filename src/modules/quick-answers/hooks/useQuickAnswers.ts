
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

    // CORREÇÃO CRÍTICA: Ranking de empresas que mais enviam (APENAS PARCEIROS)
    const porEmpresaOrigem = oportunidadesGrupo
      .filter(op => op.empresa_origem?.tipo === 'parceiro') // FILTRO CRÍTICO: apenas parceiros
      .reduce((acc, op) => {
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
      'group-by-origin-partners-only',
      'Agrupar por empresa PARCEIRA de origem (correção crítica)',
      { totalGrupo: oportunidadesGrupo.length, filtradoParceiros: oportunidadesGrupo.filter(op => op.empresa_origem?.tipo === 'parceiro').length },
      Object.keys(porEmpresaOrigem).length,
      'APENAS op.empresa_origem?.tipo === "parceiro"',
      `${Object.keys(porEmpresaOrigem).length} empresas PARCEIRAS processadas (excluídas empresas do grupo)`
    );

    // CORREÇÃO: Ranking baseado em VALOR TOTAL GERADO (não score híbrido)
    const rankingOrigem = Object.entries(porEmpresaOrigem)
      .map(([empresa, data]) => {
        const taxaConversao = data.total > 0 ? (data.ganhas / data.total) * 100 : 0;
        const ticketMedio = data.valores.length > 0 ? 
          data.valores.reduce((sum, v) => sum + v, 0) / data.valores.length : 0;
        const valorTotal = data.valores.reduce((sum, v) => sum + v, 0);
        
        return {
          empresa,
          tipo: data.tipo,
          totalOportunidades: data.total,
          oportunidadesGanhas: data.ganhas,
          taxaConversao,
          ticketMedio,
          valorTotal,
          score: valorTotal // CORREÇÃO: Score = Valor Total Gerado
        };
      })
      .filter(empresa => empresa.totalOportunidades >= 3) // Mínimo 3 oportunidades para ranking
      .sort((a, b) => b.valorTotal - a.valorTotal); // Ordenar por valor total gerado

    addStep(
      calculationId,
      'calculate-ranking-corrected',
      'Calcular ranking por VALOR TOTAL GERADO (apenas parceiros)',
      Object.keys(porEmpresaOrigem).length,
      rankingOrigem.slice(0, 3).map(r => ({ empresa: r.empresa, valorTotal: r.valorTotal, oportunidades: r.totalOportunidades })),
      'score = valorTotal (não mais score híbrido), min 3 oportunidades',
      `Top 3 por valor: ${rankingOrigem.slice(0, 3).map(r => `${r.empresa}(R$ ${r.valorTotal.toLocaleString()})`).join(', ')}`
    );

    // CORREÇÃO: Ticket médio por empresa de destino (apenas com valores > 0 e ganhas)
    const ticketMedioPorEmpresa = oportunidadesGrupo
      .filter(op => op.valor && op.valor > 0 && op.status === 'ganho') // APENAS oportunidades ganhas com valor
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
      .filter(emp => emp.totalComValor >= 2) // Mínimo 2 oportunidades ganhas
      .sort((a, b) => b.ticketMedio - a.ticketMedio);

    addStep(
      calculationId,
      'ticket-medio-calculation-corrected',
      'Calcular ticket médio (APENAS oportunidades GANHAS com valor)',
      { totalGanhasComValor: oportunidadesGrupo.filter(op => op.valor && op.valor > 0 && op.status === 'ganho').length },
      ticketMedioRanking.slice(0, 3),
      'APENAS status === "ganho" AND valor > 0, min 2 oportunidades',
      `Top 3 ticket médio: ${ticketMedioRanking.slice(0, 3).map(r => `${r.empresa}: R$ ${r.ticketMedio.toLocaleString()}`).join(', ')}`
    );

    // Oportunidades em aberto (padronizado)
    const emAberto = oportunidadesGrupo.filter(op => 
      op.status === 'em_contato' || op.status === 'negociando'
    ).length;

    addStep(
      calculationId,
      'open-opportunities-standardized',
      'Contar oportunidades em aberto (critério padronizado)',
      oportunidadesGrupo,
      emAberto,
      'status === "em_contato" || status === "negociando"',
      `${emAberto} oportunidades em aberto (critério consistente)`
    );

    const result = {
      totalOportunidades,
      porEmpresaDestino,
      rankingOrigem,
      ticketMedioRanking,
      emAberto,
      melhorEmpresaOrigem: rankingOrigem[0] || null,
      empresaComMaiorTicket: ticketMedioRanking[0] || null,
      // Dados de qualidade para validação
      qualidadeDados: {
        totalFiltradoParceiros: oportunidadesGrupo.filter(op => op.empresa_origem?.tipo === 'parceiro').length,
        totalGanhasComValor: oportunidadesGrupo.filter(op => op.valor && op.valor > 0 && op.status === 'ganho').length,
        empresasComRankingMinimo: rankingOrigem.length,
        empresasComTicketMinimo: ticketMedioRanking.length
      }
    };

    finishCalculation(calculationId, result);

    return result;
  }, [oportunidades, startCalculation, addStep, finishCalculation]);
};
