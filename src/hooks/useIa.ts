import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { IaMessage } from "@/integrations/supabase/types";

export function useIa(usuarioId: string) {
  const [mensagens, setMensagens] = useState<IaMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIa = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ia_messages")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("criado_em", { ascending: false });

    if (!error) setMensagens(data || []);
    setLoading(false);
  }, [usuarioId]);

  useEffect(() => {
    fetchIa();
  }, [fetchIa]);

  const addMensagem = async (novo: Omit<IaMessage, "id" | "criado_em">) => {
    const { error } = await supabase.from("ia_messages").insert(novo);
    if (!error) fetchIa();
    return error;
  };

  const updateMensagem = async (id: string, update: Partial<IaMessage>) => {
    const { error } = await supabase.from("ia_messages").update(update).eq("id", id);
    if (!error) fetchIa();
    return error;
  };

  const removeMensagem = async (id: string) => {
    const { error } = await supabase.from("ia_messages").delete().eq("id", id);
    if (!error) fetchIa();
    return error;
  };

  return { mensagens, loading, fetchIa, addMensagem, updateMensagem, removeMensagem };
}