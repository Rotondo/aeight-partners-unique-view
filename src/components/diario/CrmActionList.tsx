import React from "react";
import { CrmAction, Partner } from "@/types/diario";

/**
 * Lista de ações de CRM do Diário, agrupada por parceiro (opcional).
 * Permite edição e remoção.
 * 
 * @param crmAcoes Array de ações para exibir
 * @param partners Lista de parceiros para exibir nome
 * @param onEdit Função chamada ao editar (recebe ação)
 * @param onRemove Função chamada ao remover (recebe id)
 * @param loading Estado de carregamento
 */
interface CrmActionListProps {
  crmAcoes: CrmAction[];
  partners: Partner[];
  onEdit?: (ev: CrmAction) => void;
  onRemove?: (id: string) => void;
  loading?: boolean;
}

export const CrmActionList: React.FC<CrmActionListProps> = ({
  crmAcoes,
  partners,
  onEdit,
  onRemove,
  loading = false,
}) => {
  function partnerNome(id: string) {
    return partners.find(p => p.id === id)?.nome || "Parceiro desconhecido";
  }
  if (loading) return <div>Carregando ações...</div>;
  if (!crmAcoes.length) return <div>Nenhuma ação de CRM cadastrada.</div>;
  return (
    <ul className="divide-y" data-testid="crm-action-list">
      {crmAcoes.map(ev => (
        <li key={ev.id} className="py-2 flex justify-between items-center">
          <div>
            <div className="font-bold">{ev.titulo}</div>
            <div className="text-sm">
              {ev.type} | {partnerNome(ev.partnerId)} | {new Date(ev.data).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={() => onEdit(ev)} className="btn btn-secondary" data-testid="edit-crm">Editar</button>
            )}
            {onRemove && (
              <button onClick={() => onRemove(ev.id)} className="btn btn-danger" data-testid="remove-crm">Remover</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

CrmActionList.displayName = "CrmActionList";