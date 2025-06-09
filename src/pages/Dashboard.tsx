
import React from "react";
import { OportunidadesDashboards } from "@/components/dashboard/OportunidadesDashboards";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";

const Dashboard: React.FC = () => {
  return (
    <OportunidadesProvider>
      <div className="space-y-4 md:space-y-6">
        <div className="px-2 md:px-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Dashboard Principal</h1>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <OportunidadesDashboards />
        </div>
        <QuickAccess />
        <AboutPlatform />
      </div>
    </OportunidadesProvider>
  );
};

export default Dashboard;
