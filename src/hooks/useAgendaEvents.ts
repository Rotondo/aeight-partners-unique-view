import { AgendaEvent } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Busca todos os eventos de agenda do Diário.
 * Exemplo de uso: const { data, loading, error, refetch } = useAgendaEvents();
 */
export async function fetchAgendaEvents(): Promise<AgendaEvent[]> {
  const { data, error } = await supabase.from("eventos").select("*");
  if (error) throw error;
  return data as AgendaEvent[];
}

/**
 * Cria um novo evento de agenda.
 */
export async function createAgendaEvent(evento: Partial<AgendaEvent>): Promise<void> {
  const { error } = await supabase.from("eventos").insert([evento]);
  if (error) throw error;
}

/**
 * Atualiza um evento de agenda existente.
 */
export async function updateAgendaEvent(id: string, evento: Partial<AgendaEvent>): Promise<void> {
  const { error } = await supabase.from("eventos").update(evento).eq("id", id);
  if (error) throw error;
}

/**
 * Remove um evento de agenda.
 */
export async function deleteAgendaEvent(id: string): Promise<void> {
  const { error } = await supabase.from("eventos").delete().eq("id", id);
  if (error) throw error;
}