
import React from "react";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { ReformulatedDashboard } from "@/components/dashboard/ReformulatedDashboard";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { AboutPlatform } from "@/components/dashboard/AboutPlatform";

const Index = () => {
  return (
    <OportunidadesProvider>
      <div className="space-y-6">
        <DemoModeIndicator />
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral das oportunidades e performance do grupo
            </p>
          </div>
        </div>

        <ReformulatedDashboard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <QuickAccess />
          <AboutPlatform />
        </div>
      </div>
    </OportunidadesProvider>
  );
};

export default Index;
