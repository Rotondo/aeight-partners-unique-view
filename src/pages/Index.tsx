
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOportunidades } from "@/components/oportunidades/OportunidadesContext";

const Index = () => {
  console.log('Index: Renderizando página principal');
  
  const { oportunidades, loading } = useOportunidades();
  const stats = useDashboardStats(oportunidades);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DemoModeIndicator />
      <div className="space-y-6">
        <QuickAccess />
        <DashboardStats stats={stats} loading={loading} />
      </div>
    </div>
  );
};

export default Index;
