import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Resumo } from "@/integrations/supabase/types";

export function useResumo(usuarioId: string) {
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resumos")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("periodo", { ascending: false });

    if (!error) setResumos(data || []);
    setLoading(false);
  }, [usuarioId]);

  useEffect(() => {
    fetchResumos();
  }, [fetchResumos]);

  const addResumo = async (novo: Omit<Resumo, "id" | "criado_em">) => {
    const { error } = await supabase.from("resumos").insert(novo);
    if (!error) fetchResumos();
    return error;
  };

  const updateResumo = async (id: string, update: Partial<Resumo>) => {
    const { error } = await supabase.from("resumos").update(update).eq("id", id);
    if (!error) fetchResumos();
    return error;
  };

  const removeResumo = async (id: string) => {
    const { error } = await supabase.from("resumos").delete().eq("id", id);
    if (!error) fetchResumos();
    return error;
  };

  return { resumos, loading, fetchResumos, addResumo, updateResumo, removeResumo };
}