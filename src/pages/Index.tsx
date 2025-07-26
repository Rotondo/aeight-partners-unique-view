
import React from "react";
import { OportunidadesDashboards } from "@/components/dashboard/OportunidadesDashboards";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";

const Index = () => {
  console.log('[Index] Renderizando página inicial');
  
  return (
    <OportunidadesProvider>
      <div className="space-y-4 md:space-y-6">
        <DemoModeIndicator />
        
        <div className="px-2 md:px-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Dashboard de Oportunidades</h1>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <OportunidadesDashboards />
        </div>
      </div>
    </OportunidadesProvider>
  );
};

export default Index;
