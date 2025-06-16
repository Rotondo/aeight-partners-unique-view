import React from "react";
import { Partner } from "@/types/diario";

/**
 * Select de parceiros para uso nos formulários de eventos/ações do Diário.
 * Recebe a lista de parceiros e o id selecionado.
 * 
 * @param partners Lista de parceiros para exibir no select
 * @param value Id do parceiro selecionado
 * @param onChange Função chamada ao mudar seleção
 * @param disabled Desabilita o select
 */
interface AgendaEventPartnerSelectProps {
  partners: Partner[];
  value?: string;
  onChange: (partnerId: string) => void;
  disabled?: boolean;
}

export const AgendaEventPartnerSelect: React.FC<AgendaEventPartnerSelectProps> = ({
  partners,
  value,
  onChange,
  disabled = false,
}) => (
  <select
    className="border rounded px-2 py-1"
    value={value ?? ""}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    data-testid="agenda-partner-select"
  >
    <option value="" disabled>
      Selecione um parceiro
    </option>
    {partners.map(p => (
      <option key={p.id} value={p.id}>
        {p.nome}
      </option>
    ))}
  </select>
);

AgendaEventPartnerSelect.displayName = "AgendaEventPartnerSelect";