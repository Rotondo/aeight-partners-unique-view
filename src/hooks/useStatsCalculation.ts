
import { useState, useEffect } from "react";
import type { Oportunidade } from "@/types";
import { supabase } from "@/lib/supabase";

export interface DashboardStatsByStatus {
  em_contato: number;
  negociando: number;
  proposta_enviada: number;
  aguardando_aprovacao: number;
  ganho: number;
  perdido: number;
  total: number;
}

export interface DashboardStats {
  total: DashboardStatsByStatus;
  intra: DashboardStatsByStatus;
  extra: DashboardStatsByStatus;
  enviadas: number;
  recebidas: number;
  saldo: number;
}

const initialStatsByStatus: DashboardStatsByStatus = {
  em_contato: 0,
  negociando: 0,
  proposta_enviada: 0,
  aguardando_aprovacao: 0,
  ganho: 0,
  perdido: 0,
  total: 0,
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
 * Hook para cálculos de estatísticas usando processamento local
 */
export const useStatsCalculation = (oportunidades: Oportunidade[]): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>(initialDashboardStats);

  useEffect(() => {
    if (!oportunidades || oportunidades.length === 0) {
      setStats(initialDashboardStats);
      return;
    }

    const calculateStats = () => {
      try {
        // Separar oportunidades por tipo
        const intraOportunidades = oportunidades.filter(op => 
          op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo'
        );
        
        const extraOportunidades = oportunidades.filter(op => 
          !(op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'intragrupo')
        );

        // Função para calcular estatísticas por status
        const calculateStatusStats = (ops: Oportunidade[]): DashboardStatsByStatus => {
          const stats = {
            em_contato: ops.filter(op => op.status === 'em_contato').length,
            negociando: ops.filter(op => op.status === 'negociando').length,
            proposta_enviada: ops.filter(op => op.status === 'proposta_enviada').length,
            aguardando_aprovacao: ops.filter(op => op.status === 'aguardando_aprovacao').length,
            ganho: ops.filter(op => op.status === 'ganho').length,
            perdido: ops.filter(op => op.status === 'perdido').length,
            total: ops.length,
          };
          return stats;
        };

        // Calcular enviadas/recebidas
        const enviadas = oportunidades.filter(op => 
          op.empresa_origem?.tipo === 'intragrupo' && op.empresa_destino?.tipo === 'parceiro'
        ).length;
        
        const recebidas = oportunidades.filter(op => 
          op.empresa_origem?.tipo === 'parceiro' && op.empresa_destino?.tipo === 'intragrupo'
        ).length;

        const newStats: DashboardStats = {
          total: calculateStatusStats(oportunidades),
          intra: calculateStatusStats(intraOportunidades),
          extra: calculateStatusStats(extraOportunidades),
          enviadas,
          recebidas,
          saldo: enviadas - recebidas,
        };

        setStats(newStats);
      } catch (e) {
        console.error("Error calculating stats:", e);
        setStats(initialDashboardStats);
      }
    };

    calculateStats();
  }, [oportunidades]);

  return stats;
};
