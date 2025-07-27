
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useOportunidades, OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";

const IndexContent = () => {
  console.log('Index: Renderizando página principal');
  
  const { oportunidades, isLoading } = useOportunidades();
  const stats = useDashboardStats(oportunidades);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DemoModeIndicator />
      <div className="space-y-6">
        <QuickAccess />
        <DashboardStats stats={stats} loading={isLoading} />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <OportunidadesProvider>
      <IndexContent />
    </OportunidadesProvider>
  );
};

export default Index;
