
import React from "react";
import { OportunidadesProvider } from "@/components/oportunidades/OportunidadesContext";
import { OportunidadesPage } from "@/components/oportunidades/OportunidadesPage";
import { DemoModeIndicator } from "@/components/privacy/DemoModeIndicator";

const OportunidadesPageContainer = () => (
  <OportunidadesProvider>
    <div className="space-y-4">
      <DemoModeIndicator />
      <OportunidadesPage />
    </div>
  </OportunidadesProvider>
);

export default OportunidadesPageContainer;
