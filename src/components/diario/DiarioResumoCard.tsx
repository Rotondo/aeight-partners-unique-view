import React from "react";
import { DiarioResumo, Partner } from "@/types/diario";

/**
 * Card para exibição de resumo gerado por IA.
 * @param resumo Resumo do Diário
 * @param partner Parceiro relacionado
 */
interface DiarioResumoCardProps {
  resumo: DiarioResumo;
  partner?: Partner;
}

export const DiarioResumoCard: React.FC<DiarioResumoCardProps> = ({
  resumo,
  partner
}) => (
  <div className="border rounded p-4 mb-2 bg-gray-50" data-testid="diario-resumo-card">
    <div className="font-bold text-lg mb-1">
      Resumo {partner ? `de ${partner.nome}` : ""}
    </div>
    <div>{resumo.texto}</div>
    {resumo.tags && resumo.tags.length > 0 && (
      <div className="mt-2">
        <span className="text-xs text-gray-500">Tags:</span>{" "}
        {resumo.tags.map(tag => (
          <span key={tag} className="badge badge-secondary mr-1">{tag}</span>
        ))}
      </div>
    )}
    {resumo.relevancia !== undefined && (
      <div className="text-xs text-gray-400 mt-1">Relevância: {(resumo.relevancia * 100).toFixed(0)}%</div>
    )}
    <div className="text-xs text-gray-400 mt-1">
      {new Date(resumo.createdAt).toLocaleString()}
    </div>
  </div>
);

DiarioResumoCard.displayName = "DiarioResumoCard";