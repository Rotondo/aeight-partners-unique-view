import React from "react";
import { AgendaEvent, Partner } from "@/types/diario";

/**
 * Lista de eventos da agenda do Diário, agrupada por parceiro (opcional).
 * Permite edição e remoção.
 * 
 * @param eventos Array de eventos para exibir
 * @param partners Lista de parceiros para exibir nome
 * @param onEdit Função chamada ao editar (recebe evento)
 * @param onRemove Função chamada ao remover (recebe id)
 * @param loading Estado de carregamento
 */
interface AgendaEventListProps {
  eventos: AgendaEvent[];
  partners: Partner[];
  onEdit?: (ev: AgendaEvent) => void;
  onRemove?: (id: string) => void;
  loading?: boolean;
}

export const AgendaEventList: React.FC<AgendaEventListProps> = ({
  eventos,
  partners,
  onEdit,
  onRemove,
  loading = false,
}) => {
  function partnerNome(id: string) {
    return partners.find(p => p.id === id)?.nome || "Parceiro desconhecido";
  }
  if (loading) return <div>Carregando eventos...</div>;
  if (!eventos.length) return <div>Nenhum evento cadastrado.</div>;
  return (
    <ul className="divide-y" data-testid="agenda-event-list">
      {eventos.map(ev => (
        <li key={ev.id} className="py-2 flex justify-between items-center">
          <div>
            <div className="font-bold">{ev.titulo}</div>
            <div className="text-sm">
              {ev.type} | {partnerNome(ev.partnerId)} | {new Date(ev.dataInicio).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={() => onEdit(ev)} className="btn btn-secondary" data-testid="edit-event">Editar</button>
            )}
            {onRemove && (
              <button onClick={() => onRemove(ev.id)} className="btn btn-danger" data-testid="remove-event">Remover</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

AgendaEventList.displayName = "AgendaEventList";