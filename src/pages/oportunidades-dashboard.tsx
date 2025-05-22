
import React from "react";
import { OportunidadesDashboards } from "@/components/dashboard/OportunidadesDashboards";

const OportunidadesDashboardPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Dashboards de Oportunidades</h1>
    </div>
    <OportunidadesDashboards />
  </div>
);

export default OportunidadesDashboardPage;
