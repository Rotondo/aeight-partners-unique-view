import React, { createContext, useContext, useState, ReactNode } from "react";
import { DiarioEvent, CrmAction, IaSuggestion, DiarioResumo } from "@/types/diario";

export interface DiarioContextValue {
  events: DiarioEvent[];
  setEvents: (events: DiarioEvent[]) => void;
  crmActions: CrmAction[];
  setCrmActions: (actions: CrmAction[]) => void;
  iaSuggestions: IaSuggestion[];
  setIaSuggestions: (sugs: IaSuggestion[]) => void;
  resumos: DiarioResumo[];
  setResumos: (resumos: DiarioResumo[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

const DiarioContext = createContext<DiarioContextValue | undefined>(undefined);

export const DiarioProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<DiarioEvent[]>([]);
  const [crmActions, setCrmActions] = useState<CrmAction[]>([]);
  const [iaSuggestions, setIaSuggestions] = useState<IaSuggestion[]>([]);
  const [resumos, setResumos] = useState<DiarioResumo[]>([]);
  const [loading, setLoading] = useState(false);

  const value: DiarioContextValue = {
    events,
    setEvents,
    crmActions,
    setCrmActions,
    iaSuggestions,
    setIaSuggestions,
    resumos,
    setResumos,
    loading,
    setLoading,
  };

  return <DiarioContext.Provider value={value}>{children}</DiarioContext.Provider>;
};

export const useDiario = () => {
  const context = useContext(DiarioContext);
  if (!context) throw new Error("useDiario deve ser usado dentro de DiarioProvider");
  return context;
};