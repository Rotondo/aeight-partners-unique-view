
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { DashboardStats } from '@/types';
import { DashboardStatsSection } from '@/components/dashboard/DashboardStats';
import { OpportunitiesChart } from '@/components/dashboard/OpportunitiesChart';
import { QuickAccess } from '@/components/dashboard/QuickAccess';
import { AboutPlatform } from '@/components/dashboard/AboutPlatform';

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch total opportunities
        const { data: oportunidades, error: opError } = await (supabase as any)
          .from('oportunidades')
          .select('id, status, data_indicacao');

        if (opError) throw opError;

        // Calculate stats
        const totalOportunidades = oportunidades ? oportunidades.length : 0;
        const oportunidadesGanhas = oportunidades ? oportunidades.filter(op => op.status === 'ganho').length : 0;
        const oportunidadesPerdidas = oportunidades ? oportunidades.filter(op => op.status === 'perdido').length : 0;
        const oportunidadesEmAndamento = totalOportunidades - oportunidadesGanhas - oportunidadesPerdidas;
        
        // Calculate opportunities per month
        const oportunidadesPorMes: Record<string, number> = {};
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        // Initialize with last 6 months
        for (let i = 0; i < 6; i++) {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
          const monthName = month.toLocaleString('pt-BR', { month: 'short' });
          oportunidadesPorMes[monthKey] = 0;
        }
        
        // Count opportunities per month
        if (oportunidades) {
          oportunidades.forEach(op => {
            if (op.data_indicacao) {
              const date = new Date(op.data_indicacao);
              if (date >= sixMonthsAgo) {
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                oportunidadesPorMes[monthKey] = (oportunidadesPorMes[monthKey] || 0) + 1;
              }
            }
          });
        }
        
        // Format for chart
        const oportunidadesPorMesArray = Object.entries(oportunidadesPorMes)
          .map(([key, value]) => {
            const [year, month] = key.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthName = date.toLocaleString('pt-BR', { month: 'short' });
            return {
              mes: `${monthName}/${year.substring(2)}`,
              quantidade: value
            };
          })
          .sort((a, b) => {
            // Extract year and month for proper sorting
            const [aMonth, aYear] = a.mes.split('/');
            const [bMonth, bYear] = b.mes.split('/');
            
            // Compare years first
            if (aYear !== bYear) return aYear.localeCompare(bYear);
            
            // If years are the same, compare months
            // Convert month names to numbers for comparison
            const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            return months.indexOf(aMonth) - months.indexOf(bMonth);
          });
        
        setStats({
          totalOportunidades,
          oportunidadesGanhas,
          oportunidadesPerdidas,
          oportunidadesEmAndamento,
          oportunidadesPorMes: oportunidadesPorMesArray
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do dashboard.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      
      <DashboardStatsSection stats={stats} loading={loading} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <OpportunitiesChart stats={stats} loading={loading} />
        <QuickAccess />
      </div>
      
      <AboutPlatform />
    </div>
  );
};

export default Dashboard;
