import React from "react";
import { IaSuggestion, Partner } from "@/types/diario";

/**
 * Lista de sugestões de IA.
 * 
 * @param sugestoes Array de sugestões
 * @param partners Lista de parceiros (para exibir nome)
 * @param onAccept Função chamada ao aceitar sugestão (opcional)
 * @param onReject Função chamada ao rejeitar sugestão (opcional)
 * @param loading Estado de carregamento
 */
interface IaSuggestionListProps {
  sugestoes: IaSuggestion[];
  partners: Partner[];
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
}

export const IaSuggestionList: React.FC<IaSuggestionListProps> = ({
  sugestoes,
  partners,
  onAccept,
  onReject,
  loading = false,
}) => {
  function partnerNome(id: string) {
    return partners.find(p => p.id === id)?.nome || "Parceiro desconhecido";
  }
  if (loading) return <div>Carregando sugestões de IA...</div>;
  if (!sugestoes.length) return <div>Nenhuma sugestão de IA disponível.</div>;
  return (
    <ul className="divide-y" data-testid="ia-suggestion-list">
      {sugestoes.map(s => (
        <li key={s.id} className="py-2 flex flex-col md:flex-row md:justify-between items-start md:items-center">
          <div>
            <div className="font-bold">{s.tipo}</div>
            <div>{s.texto}</div>
            <div className="text-xs text-gray-400">
              {partnerNome(s.partnerId)} | Score: {(s.score ?? 0).toFixed(2)} | {new Date(s.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            {onAccept && (
              <button onClick={() => onAccept(s.id)} className="btn btn-success" data-testid="accept-ia">Aceitar</button>
            )}
            {onReject && (
              <button onClick={() => onReject(s.id)} className="btn btn-danger" data-testid="reject-ia">Rejeitar</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

IaSuggestionList.displayName = "IaSuggestionList";