
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ParceiroRelevanceData {
  id: string;
  nome: string;
  totalClientes: number;
  clientesDeInteresse: number;
  apresentacoesRealizadas: number;
  taxaConversao: number;
  scoreRelevancia: number;
}

export const useParceiroRelevance = () => {
  const [parceiros, setParceiros] = useState<ParceiroRelevanceData[]>([]);
  const [loading, setLoading] = useState(false);

  const calculateRelevance = async () => {
    try {
      setLoading(true);

      // Buscar todos os parceiros/intragrupo
      const { data: empresasParceiros, error: empresasError } = await supabase
        .from("empresas")
        .select("id, nome")
        .in("tipo", ["parceiro", "intragrupo"])
        .eq("status", true);

      if (empresasError) throw empresasError;

      const relevanceData: ParceiroRelevanceData[] = [];

      for (const parceiro of empresasParceiros) {
        // Total de clientes do parceiro
        const { count: totalClientes } = await supabase
          .from("empresa_clientes")
          .select("*", { count: "exact", head: true })
          .eq("empresa_proprietaria_id", parceiro.id)
          .eq("status", true);

        // Clientes de interesse (com solicitações na wishlist)
        const { data: clientesInteresse } = await supabase
          .from("wishlist_items")
          .select("empresa_desejada_id")
          .eq("empresa_proprietaria_id", parceiro.id);

        const clientesDeInteresse = new Set(
          clientesInteresse?.map((item) => item.empresa_desejada_id) || []
        ).size;

        // Apresentações realizadas
        const { count: apresentacoesRealizadas } = await supabase
          .from("wishlist_apresentacoes")
          .select("*", { count: "exact", head: true })
          .eq("empresa_facilitadora_id", parceiro.id)
          .eq("status_apresentacao", "realizada");

        // Taxa de conversão
        const { count: apresentacoesConvertidas } = await supabase
          .from("wishlist_apresentacoes")
          .select("*", { count: "exact", head: true })
          .eq("empresa_facilitadora_id", parceiro.id)
          .eq("converteu_oportunidade", true);

        const taxaConversao = apresentacoesRealizadas && apresentacoesRealizadas > 0
          ? ((apresentacoesConvertidas || 0) / apresentacoesRealizadas) * 100
          : 0;

        // Calcular score de relevância
        const scoreBase = Math.min((clientesDeInteresse / Math.max(totalClientes || 1, 1)) * 100, 100);
        const bonusApresentacoes = Math.min((apresentacoesRealizadas || 0) * 5, 20);
        const bonusConversao = Math.min(taxaConversao * 0.3, 30);
        
        const scoreRelevancia = Math.round(scoreBase + bonusApresentacoes + bonusConversao);

        relevanceData.push({
          id: parceiro.id,
          nome: parceiro.nome,
          totalClientes: totalClientes || 0,
          clientesDeInteresse,
          apresentacoesRealizadas: apresentacoesRealizadas || 0,
          taxaConversao,
          scoreRelevancia: Math.min(scoreRelevancia, 100),
        });
      }

      // Ordenar por score de relevância
      relevanceData.sort((a, b) => b.scoreRelevancia - a.scoreRelevancia);
      setParceiros(relevanceData);

    } catch (error) {
      console.error("Erro ao calcular relevância dos parceiros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRelevance();
  }, []);

  return {
    parceiros,
    loading,
    refresh: calculateRelevance,
  };
};
