import React from "react";
import { DiarioProvider, useDiario, DiarioTab } from "@/contexts/DiarioContext";
import AgendaView from "@/components/diario/AgendaView";
import CrmView from "@/components/diario/CrmView";
import ResumoView from "@/components/diario/ResumoView";
import IaView from "@/components/diario/IaView";

const tabs: { label: string; value: DiarioTab }[] = [
  { label: "Agenda", value: "agenda" },
  { label: "CRM", value: "crm" },
  { label: "Resumo", value: "resumo" },
  { label: "IA", value: "ia" },
];

function DiarioTabs() {
  const { selectedTab, setSelectedTab } = useDiario();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Diário</h1>
      <nav className="mb-4 flex gap-4 border-b border-muted">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`pb-2 px-3 border-b-2 text-base font-medium transition-colors ${
              selectedTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setSelectedTab(tab.value)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section>
        {selectedTab === "agenda" && <AgendaView />}
        {selectedTab === "crm" && <CrmView />}
        {selectedTab === "resumo" && <ResumoView />}
        {selectedTab === "ia" && <IaView />}
      </section>
    </div>
  );
}

const DiarioPage: React.FC = () => (
  <DiarioProvider>
    <DiarioTabs />
  </DiarioProvider>
);

export default DiarioPage;