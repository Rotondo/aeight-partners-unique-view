import { CrmAction } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Busca todas as ações de CRM do Diário.
 */
export async function fetchCrmActions(): Promise<CrmAction[]> {
  const { data, error } = await supabase.from("crm_acoes").select("*");
  if (error) throw error;
  return data as CrmAction[];
}

/**
 * Cria uma nova ação de CRM.
 */
export async function createCrmAction(acao: Partial<CrmAction>): Promise<void> {
  const { error } = await supabase.from("crm_acoes").insert([acao]);
  if (error) throw error;
}

/**
 * Atualiza uma ação de CRM existente.
 */
export async function updateCrmAction(id: string, acao: Partial<CrmAction>): Promise<void> {
  const { error } = await supabase.from("crm_acoes").update(acao).eq("id", id);
  if (error) throw error;
}

/**
 * Remove uma ação de CRM.
 */
export async function deleteCrmAction(id: string): Promise<void> {
  const { error } = await supabase.from("crm_acoes").delete().eq("id", id);
  if (error) throw error;
}