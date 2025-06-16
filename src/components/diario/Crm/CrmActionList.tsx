import React from "react";
import { useDiario } from "@/contexts/DiarioContext";

export const CrmActionList: React.FC = () => {
  const { crmActions } = useDiario();

  if (!crmActions.length)
    return <div className="text-gray-500">Nenhuma ação CRM registrada.</div>;

  return (
    <ul className="divide-y">
      {crmActions.map((action) => (
        <li key={action.id} className="py-2">
          <span className="font-semibold">{action.type}</span>: {action.content}
        </li>
      ))}
    </ul>
  );
};