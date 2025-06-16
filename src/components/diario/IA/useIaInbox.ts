import { useDiario } from "@/contexts/DiarioContext";

// Simula fetch de sugestões IA
export function useIaInbox() {
  const { iaSuggestions } = useDiario();

  // TODO: fetch real da API
  return { suggestions: iaSuggestions };
}