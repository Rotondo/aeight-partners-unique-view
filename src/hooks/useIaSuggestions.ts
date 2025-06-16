import { IaSuggestion } from "@/types/diario";
import { supabase } from "@/lib/supabaseClient";

/**
 * Busca todas as sugestões de IA do Diário.
 */
export async function fetchIaSuggestions(): Promise<IaSuggestion[]> {
  const { data, error } = await supabase.from("diario_sugestoes_ia").select("*");
  if (error) throw error;
  return data as IaSuggestion[];
}

/**
 * Gera uma sugestão de IA para um parceiro.
 */
export async function gerarSugestaoIa(partnerId: string): Promise<void> {
  // Exemplo: chamada para endpoint backend que aciona IA
  const response = await fetch(`/api/diario/ia/sugestao?partnerId=${encodeURIComponent(partnerId)}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Falha ao gerar sugestão IA");
}