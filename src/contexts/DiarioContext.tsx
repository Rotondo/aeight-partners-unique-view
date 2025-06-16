import React, { createContext, useContext, useEffect, useCallback, useState, ReactNode } from "react";
import { 
  AgendaEvent, 
  CrmAction, 
  DiarioResumo, 
  IaSuggestion, 
  Partner, 
  User, 
  DiarioContextValue 
} from "@/types/diario";
import { usePartners } from "@/hooks/usePartners";
import { useUsers } from "@/hooks/useUsers";
import { fetchAgendaEvents, createAgendaEvent, updateAgendaEvent, deleteAgendaEvent } from "@/hooks/useAgendaEvents";
import { fetchCrmActions, createCrmAction, updateCrmAction, deleteCrmAction } from "@/hooks/useCrmActions";
import { fetchResumos, gerarResumo } from "@/hooks/useResumos";
import { fetchIaSuggestions, gerarSugestaoIa } from "@/hooks/useIaSuggestions";
import { supabase } from "@/lib/supabaseClient";

/**
 * Contexto global para o Módulo Diário
 * Inclui controle de loading, erro e persistência automática (sync com Supabase)
 */

const DiarioContext = createContext<DiarioContextValue | undefined>(undefined);

export const DiarioProvider = ({ children }: { children: ReactNode }) => {
  // Estados globais
  const [eventos, setEventos] = useState<AgendaEvent[]>([]);
  const [crmAcoes, setCrmAcoes] = useState<CrmAction[]>([]);
  const [resumos, setResumos] = useState<DiarioResumo[]>([]);
  const [sugestoesIa, setSugestoesIa] = useState<IaSuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Partners e Users vindos de hooks centralizados
  const { partners } = usePartners();
  const { users } = useUsers();

  // Função para carregar todos os dados (eventos, ações, resumos, sugestões)
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ev, crm, res, ia] = await Promise.all([
        fetchAgendaEvents(),
        fetchCrmActions(),
        fetchResumos(),
        fetchIaSuggestions()
      ]);
      setEventos(ev);
      setCrmAcoes(crm);
      setResumos(res);
      setSugestoesIa(ia);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados do Diário");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync automático com Supabase (realtime)
  useEffect(() => {
    refetch();
    // Exemplo de subscription realtime Supabase (ajuste para sua implementação)
    const subs = [
      supabase.channel("diario_eventos")
        .on("postgres_changes", { event: "*", schema: "public", table: "eventos" }, refetch)
        .subscribe(),
      supabase.channel("diario_crm")
        .on("postgres_changes", { event: "*", schema: "public", table: "crm_acoes" }, refetch)
        .subscribe()
    ];
    return () => {
      subs.forEach(s => s.unsubscribe());
    };
  }, [refetch]);

  // CRUD de eventos da agenda
  const criarEvento = useCallback(async (evento: Partial<AgendaEvent>) => {
    setLoading(true);
    setError(null);
    try {
      await createAgendaEvent(evento);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao criar evento");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const atualizarEvento = useCallback(async (id: string, evento: Partial<AgendaEvent>) => {
    setLoading(true);
    setError(null);
    try {
      await updateAgendaEvent(id, evento);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar evento");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const removerEvento = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteAgendaEvent(id);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao remover evento");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // CRUD de ações de CRM
  const criarAcaoCrm = useCallback(async (acao: Partial<CrmAction>) => {
    setLoading(true);
    setError(null);
    try {
      await createCrmAction(acao);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao criar ação de CRM");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const atualizarAcaoCrm = useCallback(async (id: string, acao: Partial<CrmAction>) => {
    setLoading(true);
    setError(null);
    try {
      await updateCrmAction(id, acao);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar ação de CRM");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const removerAcaoCrm = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCrmAction(id);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao remover ação de CRM");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // Geração de resumo por IA
  const handleGerarResumo = useCallback(async (partnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await gerarResumo(partnerId);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao gerar resumo");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // Geração de sugestão de IA
  const handleGerarSugestaoIa = useCallback(async (partnerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await gerarSugestaoIa(partnerId);
      await refetch();
    } catch (err: any) {
      setError(err.message || "Erro ao gerar sugestão de IA");
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  // Contexto exportado
  const value: DiarioContextValue = {
    eventos,
    crmAcoes,
    resumos,
    sugestoesIa,
    partners,
    users,
    loading,
    error,
    criarEvento,
    atualizarEvento,
    removerEvento,
    criarAcaoCrm,
    atualizarAcaoCrm,
    removerAcaoCrm,
    gerarResumo: handleGerarResumo,
    gerarSugestaoIa: handleGerarSugestaoIa,
    refetch,
  };

  return (
    <DiarioContext.Provider value={value}>
      {children}
    </DiarioContext.Provider>
  );
};

/**
 * Hook para consumir o contexto do Diário globalmente.
 * @returns {DiarioContextValue}
 */
export function useDiario(): DiarioContextValue {
  const context = useContext(DiarioContext);
  if (!context) {
    throw new Error("useDiario deve ser usado dentro de um DiarioProvider");
  }
  return context;
}