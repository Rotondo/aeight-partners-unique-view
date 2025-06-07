
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: oportunidades, error } = await supabase
          .from("oportunidades")
          .select("id, status, data_indicacao");

        if (error) throw error;

        const totalOportunidades = oportunidades ? oportunidades.length : 0;
        const oportunidadesGanhas = oportunidades
          ? oportunidades.filter((op: any) => op.status === "ganho").length
          : 0;
        const oportunidadesPerdidas = oportunidades
          ? oportunidades.filter((op: any) => op.status === "perdido").length
          : 0;
        const oportunidadesEmAndamento =
          totalOportunidades - oportunidadesGanhas - oportunidadesPerdidas;

        setStats({
          totalOportunidades,
          oportunidadesGanhas,
          oportunidadesPerdidas,
          oportunidadesEmAndamento,
          oportunidadesPorMes: []
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
