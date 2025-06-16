import { useState } from "react";
import { UUID } from "@/types/diario";

// Simulação de busca de parceiros (substitua por fetch real no projeto)
export interface Partner {
  id: UUID;
  name: string;
}

export function usePartners() {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const fetchPartners = async (query: string) => {
    setLoading(true);
    // Substitua pelo fetch real (ex: Supabase)
    setTimeout(() => {
      setPartners([
        { id: "1", name: "Parceiro Alpha" },
        { id: "2", name: "Parceiro Beta" },
      ]);
      setLoading(false);
    }, 500);
  };
  return { partners, fetchPartners, loading };
}