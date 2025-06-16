import React from "react";
import { useResumo } from "./useResumo";

export const ResumoView: React.FC = () => {
  const { resumos, gerarResumo } = useResumo();

  return (
    <div>
      <button className="px-4 py-2 bg-primary text-white rounded mb-4" onClick={gerarResumo}>
        Gerar Resumo
      </button>
      <ul className="divide-y">
        {resumos.map((resumo) => (
          <li key={resumo.id} className="py-2">
            <span className="font-semibold capitalize">{resumo.period}</span> — Gerado em {resumo.generatedAt}
            <div className="text-sm text-gray-600">{resumo.content}</div>
            {resumo.exportUrl && (
              <a href={resumo.exportUrl} className="underline text-primary text-xs" target="_blank" rel="noreferrer">
                Baixar resumo
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};