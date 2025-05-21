import React from "react";
import { IndicadoresList } from "@/components/admin/IndicadoresList";

const IndicadoresPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Indicadores de Parceiros</h1>
      <IndicadoresList />
    </div>
  );
};

export default IndicadoresPage;
