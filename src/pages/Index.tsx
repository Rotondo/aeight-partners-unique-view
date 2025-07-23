
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";

const Index = () => {
  console.log('Index: Renderizando página principal');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <DemoModeIndicator />
      <div className="space-y-6">
        <QuickAccess />
        <DashboardStats />
      </div>
    </div>
  );
};

export default Index;
