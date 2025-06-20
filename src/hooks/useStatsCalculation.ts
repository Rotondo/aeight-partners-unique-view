
import { useState, useEffect } from "react";
import type { Oportunidade, DashboardStats, DashboardStatsByStatus } from "@/types";
import { supabase } from "@/lib/supabase"; // Ajuste o caminho conforme necessário

const initialStatsByStatus: DashboardStatsByStatus = {
  em_contato: 0,
  negociando: 0,
  proposta_enviada: 0,
  aguardando_aprovacao: 0,
  ganho: 0,
  perdido: 0,
  total: 0, // total aqui se refere ao total por categoria (total_geral, total_intra, total_extra)
};

const initialDashboardStats: DashboardStats = {
  total: { ...initialStatsByStatus },
  intra: { ...initialStatsByStatus },
  extra: { ...initialStatsByStatus },
  enviadas: 0,
  recebidas: 0,
  saldo: 0,
};

/**
 * Hook especializado para cálculos de estatísticas usando RPC
 */
export const useStatsCalculation = (oportunidades: Oportunidade[]): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>(initialDashboardStats);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!oportunidades || oportunidades.length === 0) {
      setStats(initialDashboardStats);
      setLoading(false);
      return;
    }

    const calculateStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const ids = oportunidades.map(op => op.id);
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_dashboard_aggregated_stats',
          { oportunidade_ids_param: ids }
        );

        if (rpcError) {
          throw rpcError;
        }

        if (rpcData) {
          // Mapear o resultado da RPC para a estrutura DashboardStats
          const newStats: DashboardStats = {
            total: {
              em_contato: rpcData.total_status_counts.em_contato || 0,
              negociando: rpcData.total_status_counts.negociando || 0,
              proposta_enviada: rpcData.total_status_counts.proposta_enviada || 0,
              aguardando_aprovacao: rpcData.total_status_counts.aguardando_aprovacao || 0,
              ganho: rpcData.total_status_counts.ganho || 0,
              perdido: rpcData.total_status_counts.perdido || 0,
              total: rpcData.total_status_counts.total_geral || 0,
            },
            intra: {
              em_contato: rpcData.intra_status_counts.em_contato || 0,
              negociando: rpcData.intra_status_counts.negociando || 0,
              proposta_enviada: rpcData.intra_status_counts.proposta_enviada || 0,
              aguardando_aprovacao: rpcData.intra_status_counts.aguardando_aprovacao || 0,
              ganho: rpcData.intra_status_counts.ganho || 0,
              perdido: rpcData.intra_status_counts.perdido || 0,
              total: rpcData.intra_status_counts.total_intra || 0,
            },
            extra: {
              em_contato: rpcData.extra_status_counts.em_contato || 0,
              negociando: rpcData.extra_status_counts.negociando || 0,
              proposta_enviada: rpcData.extra_status_counts.proposta_enviada || 0,
              aguardando_aprovacao: rpcData.extra_status_counts.aguardando_aprovacao || 0,
              ganho: rpcData.extra_status_counts.ganho || 0,
              perdido: rpcData.extra_status_counts.perdido || 0,
              total: rpcData.extra_status_counts.total_extra || 0,
            },
            enviadas: rpcData.enviadas || 0,
            recebidas: rpcData.recebidas || 0,
            saldo: rpcData.saldo || 0,
          };
          setStats(newStats);
        } else {
          setStats(initialDashboardStats); // Resetar se não houver dados
        }
      } catch (e) {
        console.error("Error calculating stats via RPC:", e);
        setError(e);
        setStats(initialDashboardStats); // Resetar em caso de erro
      } finally {
        setLoading(false);
      }
    };

    calculateStats();
  }, [oportunidades]);

  // O hook pode também retornar loading e error se o consumidor precisar deles.
  // Por enquanto, apenas retorna as estatísticas conforme o contrato original.
  return stats;
};
