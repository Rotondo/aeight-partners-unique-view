import { useDiario } from "@/contexts/DiarioContext";
import { v4 as uuid } from "uuid";

// Simula geração de resumo
export function useResumo() {
  const { resumos, setResumos } = useDiario();

  function gerarResumo() {
    setResumos([
      ...resumos,
      {
        id: uuid(),
        period: "week",
        generatedAt: new Date().toISOString(),
        content: "Resumo semanal fictício.",
        exportUrl: undefined,
      },
    ]);
  }

  return { resumos, gerarResumo };
}