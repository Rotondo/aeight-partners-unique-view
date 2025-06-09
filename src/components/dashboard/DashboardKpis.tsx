import React from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { BarChart as ReBarChart } from "recharts";

interface DashboardKpisProps {
  stats: {
    total: number;
    ganhas: number;
    perdidas: number;
    andamento: number;
    intra: number;
    extra: number;
    enviadas: number;
    recebidas: number;
    saldo: number;
  };
  loading?: boolean;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ stats, loading }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <DashboardCard title="Total de Oportunidades" value={loading ? "..." : stats.total} icon={<ReBarChart className="h-4 w-4 text-primary" />} color="bg-primary/10" description="Todas as oportunidades" />
    <DashboardCard title="Ganhos" value={loading ? "..." : stats.ganhas} icon={<ReBarChart className="h-4 w-4 text-green-500" />} color="bg-green-500/10" description="Oportunidades ganhas" />
    <DashboardCard title="Perdidos" value={loading ? "..." : stats.perdidas} icon={<ReBarChart className="h-4 w-4 text-destructive" />} color="bg-destructive/10" description="Oportunidades perdidas" />
    <DashboardCard title="Em Andamento" value={loading ? "..." : stats.andamento} icon={<ReBarChart className="h-4 w-4 text-amber-500" />} color="bg-amber-500/10" description="Em negociação" />
    <DashboardCard title="Intra Grupo" value={loading ? "..." : stats.intra} icon={<ReBarChart className="h-4 w-4 text-blue-500" />} color="bg-blue-500/10" description="Trocas dentro do grupo" />
    <DashboardCard title="Extra Grupo" value={loading ? "..." : stats.extra} icon={<ReBarChart className="h-4 w-4 text-purple-600" />} color="bg-purple-600/10" description="Trocas com terceiros" />
    <DashboardCard title="Enviadas" value={loading ? "..." : stats.enviadas} icon={<ReBarChart className="h-4 w-4 text-cyan-500" />} color="bg-cyan-500/10" description="Oportunidades enviadas para parceiros" />
    <DashboardCard title="Recebidas" value={loading ? "..." : stats.recebidas} icon={<ReBarChart className="h-4 w-4 text-rose-500" />} color="bg-rose-500/10" description="Oportunidades recebidas de parceiros" />
    <DashboardCard title="Saldo Envio-Recebimento" value={loading ? "..." : stats.saldo} icon={<ReBarChart className="h-4 w-4 text-gray-600" />} color="bg-gray-600/10" description="Saldo entre envio e recebimento" />
  </div>
);
