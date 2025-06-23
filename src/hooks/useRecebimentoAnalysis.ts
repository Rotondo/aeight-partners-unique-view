
import { useMemo } from 'react';
import type { Oportunidade } from '@/types';

export interface RecebimentoAnalysisData {
  totalRecebidas: number;
  valorTotal: number;
  ticketMedio: number;
  porParceiro: {
    nome: string;
    quantidade: number;
    valor: number;
    ticketMedio: number;
  }[];
  porStatus: {
    status: string;
    quantidade: number;
    valor: number;
    percentual: number;
  }[];
  tendenciaMensal: {
    mes: string;
    quantidade: number;
    valor: number;
    ticketMedio: number;
  }[];
}

export const useRecebimentoAnalysis = (oportunidades: Oportunidade[]): RecebimentoAnalysisData => {
  return useMemo(() => {
    // Filtrar apenas oportunidades "de fora para dentro"
    const oportunidadesRecebidas = oportunidades.filter(op => 
      (op.empresa_origem?.tipo === 'parceiro' || op.empresa_origem?.tipo === 'cliente') &&
      op.empresa_destino?.tipo === 'intragrupo'
    );

    const totalRecebidas = oportunidadesRecebidas.length;
    const valorTotal = oportunidadesRecebidas.reduce((sum, op) => sum + (op.valor || 0), 0);
    const ticketMedio = totalRecebidas > 0 ? valorTotal / totalRecebidas : 0;

    // Análise por parceiro
    const parceiroMap = new Map<string, { quantidade: number; valor: number }>();
    oportunidadesRecebidas.forEach(op => {
      const parceiroNome = op.empresa_origem?.nome || 'Desconhecido';
      const existing = parceiroMap.get(parceiroNome) || { quantidade: 0, valor: 0 };
      existing.quantidade += 1;
      existing.valor += op.valor || 0;
      parceiroMap.set(parceiroNome, existing);
    });

    const porParceiro = Array.from(parceiroMap.entries())
      .map(([nome, data]) => ({
        nome,
        quantidade: data.quantidade,
        valor: data.valor,
        ticketMedio: data.quantidade > 0 ? data.valor / data.quantidade : 0
      }))
      .sort((a, b) => b.valor - a.valor);

    // Análise por status
    const statusMap = new Map<string, { quantidade: number; valor: number }>();
    oportunidadesRecebidas.forEach(op => {
      const status = op.status || 'indefinido';
      const existing = statusMap.get(status) || { quantidade: 0, valor: 0 };
      existing.quantidade += 1;
      existing.valor += op.valor || 0;
      statusMap.set(status, existing);
    });

    const porStatus = Array.from(statusMap.entries())
      .map(([status, data]) => ({
        status,
        quantidade: data.quantidade,
        valor: data.valor,
        percentual: totalRecebidas > 0 ? (data.quantidade / totalRecebidas) * 100 : 0
      }))
      .sort((a, b) => b.quantidade - a.quantidade);

    // Tendência mensal (últimos 12 meses)
    const agora = new Date();
    const tendenciaMensal = Array.from({ length: 12 }, (_, i) => {
      const mesData = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const mesProximo = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      
      const opsDoMes = oportunidadesRecebidas.filter(op => {
        const dataOp = new Date(op.data_indicacao);
        return dataOp >= mesData && dataOp < mesProximo;
      });

      const quantidade = opsDoMes.length;
      const valor = opsDoMes.reduce((sum, op) => sum + (op.valor || 0), 0);

      return {
        mes: mesData.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        quantidade,
        valor,
        ticketMedio: quantidade > 0 ? valor / quantidade : 0
      };
    }).reverse();

    return {
      totalRecebidas,
      valorTotal,
      ticketMedio,
      porParceiro,
      porStatus,
      tendenciaMensal
    };
  }, [oportunidades]);
};
