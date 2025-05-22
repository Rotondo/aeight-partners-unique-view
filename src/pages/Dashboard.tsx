
import React, { useEffect, useState } from "react";
import { OpportunitiesChart } from "@/components/dashboard/OpportunitiesChart";
import { DashboardStatsSection } from "@/components/dashboard/DashboardStats";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Oportunidade } from "@/types";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Simplify the query to avoid stack depth issues
        const { data: oportunidades, error } = await supabase
          .from("oportunidades")
          .select("id, status, data_indicacao");

        if (error) throw error;

        // Calcula estatísticas
        const totalOportunidades = oportunidades ? oportunidades.length : 0;
        const oportunidadesGanhas = oportunidades
          ? oportunidades.filter((op: Oportunidade) => op.status === "ganho").length
          : 0;
        const oportunidadesPerdidas = oportunidades
          ? oportunidades.filter((op: Oportunidade) => op.status === "perdido").length
          : 0;
        const oportunidadesEmAndamento =
          totalOportunidades - oportunidadesGanhas - oportunidadesPerdidas;

        // Create simplified data for chart to prevent stack issues
        const oportunidadesPorMesArray = processOportunidadesPorMes(oportunidades);

        setStats({
          totalOportunidades,
          oportunidadesGanhas,
          oportunidadesPerdidas,
          oportunidadesEmAndamento,
          oportunidadesPorMes: oportunidadesPorMesArray,
        });
      } catch (error: any) {
        console.error("Erro ao carregar dados do dashboard:", error);
        toast({
          title: "Erro ao carregar dashboard",
          description: error.message || "Não foi possível buscar os dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const processOportunidadesPorMes = (oportunidades: any[]) => {
    const now = new Date();
    const oportunidadesPorMes: Record<string, number> = {};

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
      oportunidadesPorMes[monthKey] = 0;
    }

    // Count opportunities by month
    if (oportunidades && oportunidades.length > 0) {
      oportunidades.forEach((op: Oportunidade) => {
        if (op.data_indicacao) {
          const date = new Date(op.data_indicacao);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          // Only count if it's in the last 6 months
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          if (date >= sixMonthsAgo && monthKey in oportunidadesPorMes) {
            oportunidadesPorMes[monthKey] += 1;
          }
        }
      });
    }

    // Format for the chart
    return Object.entries(oportunidadesPorMes)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthName = date.toLocaleString("pt-BR", { month: "short" });
        return {
          mes: `${monthName}/${year.slice(2)}`,
          quantidade: value,
        };
      });
  };

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <DashboardStatsSection stats={stats} loading={loading} />
      <OpportunitiesChart stats={stats} loading={loading} />
      <QuickAccess />
      <AboutPlatform />
    </div>
  );
};

export default Dashboard;
