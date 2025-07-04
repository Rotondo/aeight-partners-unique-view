import React from "react";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { OportunidadesPage } from "@/components/oportunidades/OportunidadesPage";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";
import { DemoModeToggle } from "@/components/privacy/DemoModeToggle";

const OportunidadesPageContainer = () => (
  <OportunidadesProvider>
    <div className="space-y-4">
      {/* Área superior com indicador e botão de alternância do modo demo */}
      <div className="flex items-center justify-between">
        <DemoModeIndicator />
        <DemoModeToggle />
      </div>
      <OportunidadesPage />
    </div>
  </OportunidadesProvider>
);

export default OportunidadesPageContainer;
