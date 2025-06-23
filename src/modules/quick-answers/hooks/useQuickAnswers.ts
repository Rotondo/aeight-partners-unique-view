
import { useMemo } from 'react';
import { Oportunidade } from '@/types';

export const useQuickAnswers = (oportunidades: Oportunidade[]) => {
  return useMemo(() => {
    // Filtrar apenas empresas do grupo como destino
    const oportunidadesGrupo = oportunidades.filter(op => 
      op.empresa_destino?.tipo === 'intragrupo'
    );

    // Total de oportunidades no período
    const totalOportunidades = oportunidadesGrupo.length;

    // Oportunidades por empresa de destino
    const porEmpresaDestino = oportunidadesGrupo.reduce((acc, op) => {
      const empresa = op.empresa_destino?.nome || 'Desconhecida';
      acc[empresa] = (acc[empresa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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

    // Calcular qualidade das empresas origem
    const rankingOrigem = Object.entries(porEmpresaOrigem)
      .map(([empresa, data]) => ({
        empresa,
        tipo: data.tipo,
        totalOportunidades: data.total,
        oportunidadesGanhas: data.ganhas,
        taxaConversao: data.total > 0 ? (data.ganhas / data.total) * 100 : 0,
        ticketMedio: data.valores.length > 0 ? 
          data.valores.reduce((sum, v) => sum + v, 0) / data.valores.length : 0,
        valorTotal: data.valores.reduce((sum, v) => sum + v, 0),
        score: (data.total * 0.3) + ((data.ganhas / Math.max(1, data.total)) * 100 * 0.7) // Score baseado em volume e conversão
      }))
      .sort((a, b) => b.score - a.score);

    // Ticket médio por empresa de destino (apenas com valores)
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

    // Oportunidades em aberto
    const emAberto = oportunidadesGrupo.filter(op => 
      op.status === 'em_contato' || op.status === 'negociando'
    ).length;

    return {
      totalOportunidades,
      porEmpresaDestino,
      rankingOrigem,
      ticketMedioRanking,
      emAberto,
      melhorEmpresaOrigem: rankingOrigem[0] || null,
      empresaComMaiorTicket: ticketMedioRanking[0] || null
    };
  }, [oportunidades]);
};
