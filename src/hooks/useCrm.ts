import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CrmRegistro } from "@/integrations/supabase/types";

export function useCrm(usuarioId: string) {
  const [registros, setRegistros] = useState<CrmRegistro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCrm = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("crm_registros")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("data", { ascending: false });

    if (!error) setRegistros(data || []);
    setLoading(false);
  }, [usuarioId]);

  useEffect(() => {
    fetchCrm();
  }, [fetchCrm]);

  const addRegistro = async (novo: Omit<CrmRegistro, "id" | "criado_em" | "atualizado_em">) => {
    const { error } = await supabase.from("crm_registros").insert(novo);
    if (!error) fetchCrm();
    return error;
  };

  const updateRegistro = async (id: string, update: Partial<CrmRegistro>) => {
    const { error } = await supabase.from("crm_registros").update(update).eq("id", id);
    if (!error) fetchCrm();
    return error;
  };

  const removeRegistro = async (id: string) => {
    const { error } = await supabase.from("crm_registros").delete().eq("id", id);
    if (!error) fetchCrm();
    return error;
  };

  return { registros, loading, fetchCrm, addRegistro, updateRegistro, removeRegistro };
}