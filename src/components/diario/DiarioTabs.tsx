import React, { useState } from "react";
import { AgendaView } from "./Agenda/AgendaView";
import { CrmRegister } from "./Crm/CrmRegister";
import { ResumoView } from "./Resumo/ResumoView";
import { IaAgentInbox } from "./IA/IaAgentInbox";

const TABS = [
  { label: "Agenda", key: "agenda" },
  { label: "CRM", key: "crm" },
  { label: "Resumo", key: "resumo" },
  { label: "IA", key: "ia" },
];

export const DiarioTabs: React.FC = () => {
  const [tab, setTab] = useState("agenda");

  return (
    <div>
      <div className="flex border-b mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-primary"
            }`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "agenda" && <AgendaView />}
        {tab === "crm" && <CrmRegister />}
        {tab === "resumo" && <ResumoView />}
        {tab === "ia" && <IaAgentInbox />}
      </div>
    </div>
  );
};