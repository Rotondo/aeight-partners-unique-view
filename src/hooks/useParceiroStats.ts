
import { useMemo } from 'react';
import { usePartners } from '@/hooks/usePartners';
import { useOportunidades } from '@/components/oportunidades/OportunidadesContext';
import { ParceiroStats } from '@/types/parceiro-stats';
import { differenceInDays, parseISO } from 'date-fns';

interface UseParceiroStatsFilters {
  dataInicio?: string;
  dataFim?: string;
  quarter?: string;
  quarterYear?: number;
}

export const useParceiroStats = (filters: UseParceiroStatsFilters = {}) => {
  const { partners, loading: partnersLoading } = usePartners();
  const { oportunidades, isLoading: oportunidadesLoading } = useOportunidades();

  const stats = useMemo(() => {
    if (partnersLoading || oportunidadesLoading) return [];

    // Filter partners to only include 'parceiro' type
    const parceiros = partners.filter(p => p.tipo === 'parceiro');

    // Filter opportunities based on filters
    let filteredOportunidades = oportunidades;

    if (filters.dataInicio || filters.dataFim) {
      filteredOportunidades = oportunidades.filter(op => {
        const opDate = parseISO(op.data_indicacao);
        
        if (filters.dataInicio) {
          const dataInicio = parseISO(filters.dataInicio);
          if (opDate < dataInicio) return false;
        }
        
        if (filters.dataFim) {
          const dataFim = parseISO(filters.dataFim);
          if (opDate > dataFim) return false;
        }
        
        return true;
      });
    }

    if (filters.quarter && filters.quarterYear) {
      filteredOportunidades = filteredOportunidades.filter(op => {
        const opDate = parseISO(op.data_indicacao);
        const year = opDate.getFullYear();
        const month = opDate.getMonth();
        
        if (year !== filters.quarterYear) return false;
        
        const quarter = Math.floor(month / 3) + 1;
        const quarterMap = { 'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4 };
        
        return quarter === quarterMap[filters.quarter as keyof typeof quarterMap];
      });
    }

    return parceiros.map(parceiro => {
      // Opportunities where partner is origin (received)
      const oportunidadesRecebidas = filteredOportunidades.filter(
        op => op.empresa_origem_id === parceiro.id
      );

      // Opportunities where partner is destination (sent)
      const oportunidadesEnviadas = filteredOportunidades.filter(
        op => op.empresa_destino_id === parceiro.id
      );

      const recebidas = oportunidadesRecebidas.length;
      const enviadas = oportunidadesEnviadas.length;
      const diferenca = recebidas - enviadas;

      // Days since last opportunity as origin
      let diasUltimaOportunidade: number | null = null;
      if (oportunidadesRecebidas.length > 0) {
        const ultimaOportunidade = oportunidadesRecebidas
          .sort((a, b) => new Date(b.data_indicacao).getTime() - new Date(a.data_indicacao).getTime())[0];
        diasUltimaOportunidade = differenceInDays(new Date(), parseISO(ultimaOportunidade.data_indicacao));
      }

      // Average opportunities per day since registration
      let mediaOportunidadesPorDia: number | null = null;
      if (oportunidadesRecebidas.length > 0) {
        const dataCadastro = parseISO(parceiro.created_at);
        const diasDesdecadastro = differenceInDays(new Date(), dataCadastro);
        if (diasDesdecadastro > 0) {
          mediaOportunidadesPorDia = recebidas / diasDesdecadastro;
        }
      }

      // Average and sum of values for opportunities where partner is origin
      let mediaValor: number | null = null;
      let somaValor: number | null = null;
      
      const oportunidadesComValor = oportunidadesRecebidas.filter(op => op.valor && op.valor > 0);
      if (oportunidadesComValor.length > 0) {
        const valores = oportunidadesComValor.map(op => op.valor!);
        somaValor = valores.reduce((sum, val) => sum + val, 0);
        mediaValor = somaValor / valores.length;
      }

      return {
        id: parceiro.id,
        nome: parceiro.nome,
        oportunidadesRecebidas: recebidas,
        oportunidadesEnviadas: enviadas,
        diferenca,
        diasUltimaOportunidade,
        mediaOportunidadesPorDia,
        mediaValor,
        somaValor,
        dataCadastro: parseISO(parceiro.created_at)
      } as ParceiroStats;
    });
  }, [partners, oportunidades, filters, partnersLoading, oportunidadesLoading]);

  return {
    stats,
    loading: partnersLoading || oportunidadesLoading
  };
};
