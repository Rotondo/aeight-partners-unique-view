import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Stats mínimas para o dashboard sem carregar todas as oportunidades
interface LightDashboardStats {
  totalOportunidades: number;
  totalGanhos: number;
  totalPerdas: number;
  totalEmAndamento: number;
  valorTotalGanho: number;
  loading: boolean;
}

export function useLazyDashboardStats() {
  const [stats, setStats] = useState<LightDashboardStats>({
    totalOportunidades: 0,
    totalGanhos: 0,
    totalPerdas: 0,
    totalEmAndamento: 0,
    valorTotalGanho: 0,
    loading: false,
  });

  const loadStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true }));
    
    try {
      // Query otimizada - apenas contagens e somas, sem dados completos
      const { data, error } = await supabase
        .from('oportunidades')
        .select(`
          status,
          valor
        `);

      if (error) throw error;

      if (data) {
        const totalOportunidades = data.length;
        const ganhos = data.filter(op => op.status === 'ganho');
        const perdas = data.filter(op => op.status === 'perdido');
        const emAndamento = data.filter(op => 
          !['ganho', 'perdido'].includes(op.status)
        );
        
        const valorTotalGanho = ganhos.reduce((acc, op) => 
          acc + (op.valor || 0), 0
        );

        setStats({
          totalOportunidades,
          totalGanhos: ganhos.length,
          totalPerdas: perdas.length,
          totalEmAndamento: emAndamento.length,
          valorTotalGanho,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return { stats, loadStats };
}