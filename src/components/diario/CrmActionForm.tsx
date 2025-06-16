import React, { useState } from "react";
import { CrmAction, CrmActionType, DiarioStatus, Partner } from "@/types/diario";
import { AgendaEventPartnerSelect } from "./AgendaEventPartnerSelect";

/**
 * Formulário para criar/editar ações de CRM.
 * 
 * @param initialAction Ação para edição (opcional)
 * @param partners Lista de parceiros
 * @param onSubmit Função chamada ao salvar
 * @param onCancel Função chamada ao cancelar
 * @param loading Estado de carregamento
 * @param disabled Desabilita o formulário
 */
interface CrmActionFormProps {
  initialAction?: Partial<CrmAction>;
  partners: Partner[];
  onSubmit: (ev: Partial<CrmAction>) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const CrmActionForm: React.FC<CrmActionFormProps> = ({
  initialAction,
  partners,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
}) => {
  const [form, setForm] = useState<Partial<CrmAction>>(initialAction ?? {});

  function handleChange<K extends keyof CrmAction>(k: K, v: any) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" data-testid="crm-action-form">
      <div>
        <label>Parceiro</label>
        <AgendaEventPartnerSelect
          partners={partners}
          value={form.partnerId}
          onChange={v => handleChange("partnerId", v)}
          disabled={disabled || loading}
        />
      </div>
      <div>
        <label>Título</label>
        <input
          type="text"
          value={form.titulo || ""}
          onChange={e => handleChange("titulo", e.target.value)}
          disabled={disabled || loading}
          required
        />
      </div>
      <div>
        <label>Tipo</label>
        <select
          value={form.type || ""}
          onChange={e => handleChange("type", e.target.value as CrmActionType)}
          disabled={disabled || loading}
        >
          <option value="" disabled>Selecione</option>
          {Object.values(CrmActionType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Data</label>
        <input
          type="datetime-local"
          value={form.data ? form.data.substring(0, 16) : ""}
          onChange={e => handleChange("data", e.target.value)}
          disabled={disabled || loading}
          required
        />
      </div>
      <div>
        <label>Status</label>
        <select
          value={form.status || DiarioStatus.PENDING}
          onChange={e => handleChange("status", e.target.value as DiarioStatus)}
          disabled={disabled || loading}
        >
          {Object.values(DiarioStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Descrição</label>
        <textarea
          value={form.descricao || ""}
          onChange={e => handleChange("descricao", e.target.value)}
          disabled={disabled || loading}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading || disabled} className="btn btn-primary">
          {initialAction ? "Salvar" : "Criar"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading || disabled} className="btn">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

CrmActionForm.displayName = "CrmActionForm";