import React, { useState } from "react";
import { useDiario } from "@/contexts/DiarioContext";
import { AgendaEventForm } from "@/components/diario/AgendaEventForm";
import { AgendaEventList } from "@/components/diario/AgendaEventList";
import { CrmActionForm } from "@/components/diario/CrmActionForm";
import { CrmActionList } from "@/components/diario/CrmActionList";
import { DiarioResumoCard } from "@/components/diario/DiarioResumoCard";
import { IaSuggestionList } from "@/components/diario/IaSuggestionList";

/**
 * Página SPA do Diário, com tabs para Agenda, CRM, Resumo e IA.
 * Inclui guards/wrappers para permissão de admin e acesso seguro.
 */
type DiarioTab = "agenda" | "crm" | "resumo" | "ia";

// Simulação de checagem de permissão admin (substitua por lógica real)
function useIsAdmin() {
  // Exemplo: poderia usar contexto de auth para checar roles/scopes
  return true;
}

export default function DiarioPage() {
  const [tab, setTab] = useState<DiarioTab>("agenda");
  const [editingEvent, setEditingEvent] = useState<string | null>(null);
  const [editingCrm, setEditingCrm] = useState<string | null>(null);
  const isAdmin = useIsAdmin();

  const {
    eventos,
    crmAcoes,
    resumos,
    sugestoesIa,
    partners,
    loading,
    error,
    criarEvento,
    atualizarEvento,
    removerEvento,
    criarAcaoCrm,
    atualizarAcaoCrm,
    removerAcaoCrm,
    gerarResumo,
    gerarSugestaoIa,
  } = useDiario();

  // Find item for edit by id
  const editingEventObj = editingEvent ? eventos.find(e => e.id === editingEvent) : undefined;
  const editingCrmObj = editingCrm ? crmAcoes.find(c => c.id === editingCrm) : undefined;

  // Guards: apenas admins podem acessar algumas tabs
  function renderTab() {
    switch (tab) {
      case "agenda":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Agenda</h2>
            {editingEventObj ? (
              <AgendaEventForm
                initialEvent={editingEventObj}
                partners={partners}
                onSubmit={async ev => {
                  await atualizarEvento(editingEventObj.id, ev);
                  setEditingEvent(null);
                }}
                onCancel={() => setEditingEvent(null)}
                loading={loading}
              />
            ) : (
              <AgendaEventForm
                partners={partners}
                onSubmit={criarEvento}
                loading={loading}
              />
            )}
            <AgendaEventList
              eventos={eventos}
              partners={partners}
              onEdit={ev => setEditingEvent(ev.id)}
              onRemove={removerEvento}
              loading={loading}
            />
          </>
        );
      case "crm":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">CRM</h2>
            {editingCrmObj ? (
              <CrmActionForm
                initialAction={editingCrmObj}
                partners={partners}
                onSubmit={async acao => {
                  await atualizarAcaoCrm(editingCrmObj.id, acao);
                  setEditingCrm(null);
                }}
                onCancel={() => setEditingCrm(null)}
                loading={loading}
              />
            ) : (
              <CrmActionForm
                partners={partners}
                onSubmit={criarAcaoCrm}
                loading={loading}
              />
            )}
            <CrmActionList
              crmAcoes={crmAcoes}
              partners={partners}
              onEdit={ev => setEditingCrm(ev.id)}
              onRemove={removerAcaoCrm}
              loading={loading}
            />
          </>
        );
      case "resumo":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Resumos (IA)</h2>
            <button
              className="btn btn-primary mb-4"
              onClick={() => {
                if (partners[0]) gerarResumo(partners[0].id);
              }}
              disabled={loading || !isAdmin}
            >
              Gerar Resumo IA (primeiro parceiro)
            </button>
            <div>
              {resumos.map(resumo => (
                <DiarioResumoCard
                  key={resumo.id}
                  resumo={resumo}
                  partner={partners.find(p => p.id === resumo.partnerId)}
                />
              ))}
            </div>
          </>
        );
      case "ia":
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Sugestões de IA</h2>
            <button
              className="btn btn-primary mb-4"
              onClick={() => {
                if (partners[0]) gerarSugestaoIa(partners[0].id);
              }}
              disabled={loading || !isAdmin}
            >
              Gerar Sugestão IA (primeiro parceiro)
            </button>
            <IaSuggestionList
              sugestoes={sugestoesIa}
              partners={partners}
              loading={loading}
            />
          </>
        );
      default:
        return null;
    }
  }

  if (!isAdmin && (tab === "resumo" || tab === "ia")) {
    return <div>Acesso restrito a administradores.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Diário</h1>
      <div className="mb-4 flex gap-2">
        <button className={`btn${tab === "agenda" ? " btn-primary" : ""}`} onClick={() => setTab("agenda")}>Agenda</button>
        <button className={`btn${tab === "crm" ? " btn-primary" : ""}`} onClick={() => setTab("crm")}>CRM</button>
        <button className={`btn${tab === "resumo" ? " btn-primary" : ""}`} onClick={() => setTab("resumo")}>Resumo</button>
        <button className={`btn${tab === "ia" ? " btn-primary" : ""}`} onClick={() => setTab("ia")}>IA</button>
      </div>
      {error && (
        <div className="alert alert-error mb-2">{error}</div>
      )}
      {renderTab()}
    </div>
  );
}