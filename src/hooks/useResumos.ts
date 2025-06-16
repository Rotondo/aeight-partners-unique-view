import { DiarioResumo } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Busca todos os resumos gerados por IA do Diário.
 */
export async function fetchResumos(): Promise<DiarioResumo[]> {
  const { data, error } = await supabase.from("diario_resumos").select("*");
  if (error) throw error;
  return data as DiarioResumo[];
}

/**
 * Gera um resumo via IA para um parceiro.
 */
export async function gerarResumo(partnerId: string): Promise<void> {
  // Exemplo: chamada para endpoint backend que aciona IA
  const response = await fetch(`/api/diario/ia/resumo?partnerId=${encodeURIComponent(partnerId)}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Falha ao gerar resumo IA");
}