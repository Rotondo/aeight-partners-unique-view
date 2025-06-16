import React, { createContext, useContext, useState, ReactNode } from "react";

// Tipos poderão ser expandidos conforme integração com Supabase.
type DiarioContextType = {
  // Exemplo de estados globais do Diário, podem ser expandidos
  selectedTab: DiarioTab;
  setSelectedTab: (tab: DiarioTab) => void;
};

export type DiarioTab = "agenda" | "crm" | "resumo" | "ia";

const DiarioContext = createContext<DiarioContextType | undefined>(undefined);

export const DiarioProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTab, setSelectedTab] = useState<DiarioTab>("agenda");

  return (
    <DiarioContext.Provider value={{ selectedTab, setSelectedTab }}>
      {children}
    </DiarioContext.Provider>
  );
};

export const useDiario = () => {
  const context = useContext(DiarioContext);
  if (!context) {
    throw new Error("useDiario must be used within DiarioProvider");
  }
  return context;
};