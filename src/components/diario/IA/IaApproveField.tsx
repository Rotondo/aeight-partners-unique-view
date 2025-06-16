import React from "react";
import { IaSuggestion } from "@/types/diario";

interface Props {
  suggestion: IaSuggestion;
}

export const IaApproveField: React.FC<Props> = ({ suggestion }) => {
  // TODO: Aprovar, editar ou descartar sugestão via contexto/API
  return (
    <div className="flex gap-2 mt-1">
      <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">Aprovar</button>
      <button className="bg-red-500 text-white px-2 py-1 rounded text-xs">Rejeitar</button>
      <button className="bg-gray-400 text-white px-2 py-1 rounded text-xs">Editar</button>
    </div>
  );
};