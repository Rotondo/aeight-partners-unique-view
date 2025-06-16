import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Agenda } from "@/integrations/supabase/types";

export function useAgenda(usuarioId: string) {
  const [itens, setItens] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgenda = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agenda")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("data", { ascending: true });

    if (!error) setItens(data || []);
    setLoading(false);
  }, [usuarioId]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const addAgenda = async (novo: Omit<Agenda, "id" | "criado_em" | "atualizado_em">) => {
    const { error } = await supabase.from("agenda").insert(novo);
    if (!error) fetchAgenda();
    return error;
  };

  const updateAgenda = async (id: string, update: Partial<Agenda>) => {
    const { error } = await supabase.from("agenda").update(update).eq("id", id);
    if (!error) fetchAgenda();
    return error;
  };

  const removeAgenda = async (id: string) => {
    const { error } = await supabase.from("agenda").delete().eq("id", id);
    if (!error) fetchAgenda();
    return error;
  };

  return { itens, loading, fetchAgenda, addAgenda, updateAgenda, removeAgenda };
}