import React, { useState } from "react";
import { AgendaEvent, AgendaEventType, DiarioStatus, Partner } from "@/types/diario";
import { AgendaEventPartnerSelect } from "./AgendaEventPartnerSelect";

/**
 * Formulário para criar/editar eventos de agenda.
 * 
 * @param initialEvent Evento para edição (opcional)
 * @param partners Lista de parceiros
 * @param onSubmit Função chamada ao salvar
 * @param onCancel Função chamada ao cancelar
 * @param loading Estado de carregamento
 * @param disabled Desabilita o formulário
 */
interface AgendaEventFormProps {
  initialEvent?: Partial<AgendaEvent>;
  partners: Partner[];
  onSubmit: (ev: Partial<AgendaEvent>) => void;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const AgendaEventForm: React.FC<AgendaEventFormProps> = ({
  initialEvent,
  partners,
  onSubmit,
  onCancel,
  loading = false,
  disabled = false,
}) => {
  const [form, setForm] = useState<Partial<AgendaEvent>>(initialEvent ?? {});

  function handleChange<K extends keyof AgendaEvent>(k: K, v: any) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" data-testid="agenda-event-form">
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
          onChange={e => handleChange("type", e.target.value as AgendaEventType)}
          disabled={disabled || loading}
        >
          <option value="" disabled>Selecione</option>
          {Object.values(AgendaEventType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Início</label>
        <input
          type="datetime-local"
          value={form.dataInicio ? form.dataInicio.substring(0, 16) : ""}
          onChange={e => handleChange("dataInicio", e.target.value)}
          disabled={disabled || loading}
          required
        />
      </div>
      <div>
        <label>Fim</label>
        <input
          type="datetime-local"
          value={form.dataFim ? form.dataFim.substring(0, 16) : ""}
          onChange={e => handleChange("dataFim", e.target.value)}
          disabled={disabled || loading}
        />
      </div>
      <div>
        <label>Status</label>
        <select
          value={form.status || DiarioStatus.SCHEDULED}
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
          {initialEvent ? "Salvar" : "Criar"}
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

AgendaEventForm.displayName = "AgendaEventForm";