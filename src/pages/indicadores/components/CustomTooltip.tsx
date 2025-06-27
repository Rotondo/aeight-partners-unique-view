
import React from "react";
import { usePrivacy } from "@/contexts/PrivacyContext";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const { isDemoMode } = usePrivacy();
  
  if (!active || !payload || !payload.length) return null;
  
  const name = payload[0].payload.nome;
  return (
    <div className="p-2 bg-white border rounded shadow text-xs">
      {isDemoMode ? "" : name}
      {Object.entries(payload[0].payload)
        .filter(([k]) => k !== "nome")
        .map(([k, v]) => (
          <div key={k}>
            <b>{k}:</b> {String(v || "")}
          </div>
        ))}
    </div>
  );
};
