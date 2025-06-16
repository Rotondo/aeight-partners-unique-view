import React from "react";
import { IaApproveField } from "./IaApproveField";
import { useIaInbox } from "./useIaInbox";

export const IaAgentInbox: React.FC = () => {
  const { suggestions } = useIaInbox();

  if (!suggestions.length)
    return <div className="text-gray-500">Nenhuma sugestão IA no momento.</div>;

  return (
    <ul className="divide-y">
      {suggestions.map((sug) => (
        <li key={sug.id} className="py-2 flex flex-col gap-1">
          <span className="text-sm text-gray-500">Campo: {sug.field}</span>
          <span className="font-semibold">{sug.suggestion}</span>
          <IaApproveField suggestion={sug} />
        </li>
      ))}
    </ul>
  );
};