import React from "react";
import { DiarioProvider } from "@/contexts/DiarioContext";
import { DiarioTabs } from "@/components/diario/DiarioTabs";

const DiarioPage: React.FC = () => (
  <DiarioProvider>
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Diário</h1>
      <DiarioTabs />
    </main>
  </DiarioProvider>
);

export default DiarioPage;