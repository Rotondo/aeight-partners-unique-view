
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ParceiroRelevanceData {
  id: string;
  nome: string;
  totalClientes: number;
  clientesDeInteresse: number;
  apresentacoesRealizadas: number;
  apresentacoesPendentes: number;
  solicitacoesAprovadas: number;
  taxaConversao: number;
  taxaAprovacao: number;
  scoreRelevancia: number;
  ultimaAtividade?: string;
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

        // Apresentações pendentes
        const { count: apresentacoesPendentes } = await supabase
          .from("wishlist_apresentacoes")
          .select("*", { count: "exact", head: true })
          .eq("empresa_facilitadora_id", parceiro.id)
          .eq("status_apresentacao", "pendente");

        // Solicitações aprovadas (wishlist_items com status aprovado)
        const { count: solicitacoesAprovadas } = await supabase
          .from("wishlist_items")
          .select("*", { count: "exact", head: true })
          .eq("empresa_proprietaria_id", parceiro.id)
          .eq("status", "aprovado");

        // Apresentações convertidas em oportunidades
        const { count: apresentacoesConvertidas } = await supabase
          .from("wishlist_apresentacoes")
          .select("*", { count: "exact", head: true })
          .eq("empresa_facilitadora_id", parceiro.id)
          .eq("converteu_oportunidade", true);

        // Taxa de conversão (apresentações que viraram oportunidades)
        const taxaConversao = apresentacoesRealizadas && apresentacoesRealizadas > 0
          ? ((apresentacoesConvertidas || 0) / apresentacoesRealizadas) * 100
          : 0;

        // Taxa de aprovação (solicitações aprovadas vs total de solicitações)
        const totalSolicitacoes = clientesInteresse?.length || 0;
        const taxaAprovacao = totalSolicitacoes > 0
          ? ((solicitacoesAprovadas || 0) / totalSolicitacoes) * 100
          : 0;

        // Última atividade (última apresentação ou solicitação)
        const { data: ultimaApresentacao } = await supabase
          .from("wishlist_apresentacoes")
          .select("created_at")
          .eq("empresa_facilitadora_id", parceiro.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: ultimaSolicitacao } = await supabase
          .from("wishlist_items")
          .select("created_at")
          .eq("empresa_proprietaria_id", parceiro.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const ultimaAtividade = [
          ultimaApresentacao?.created_at,
          ultimaSolicitacao?.created_at
        ].filter(Boolean).sort().reverse()[0];

        // Calcular score de relevância aprimorado
        const scoreBase = Math.min((clientesDeInteresse / Math.max(totalClientes || 1, 1)) * 100, 100);
        const bonusApresentacoes = Math.min((apresentacoesRealizadas || 0) * 3, 15);
        const bonusConversao = Math.min(taxaConversao * 0.5, 25);
        const bonusAprovacao = Math.min(taxaAprovacao * 0.3, 15);
        const bonusAtividade = ultimaAtividade ? 
          Math.max(10 - Math.floor((Date.now() - new Date(ultimaAtividade).getTime()) / (1000 * 60 * 60 * 24 * 30)), 0) : 0;
        
        const scoreRelevancia = Math.round(
          scoreBase + bonusApresentacoes + bonusConversao + bonusAprovacao + bonusAtividade
        );

        relevanceData.push({
          id: parceiro.id,
          nome: parceiro.nome,
          totalClientes: totalClientes || 0,
          clientesDeInteresse,
          apresentacoesRealizadas: apresentacoesRealizadas || 0,
          apresentacoesPendentes: apresentacoesPendentes || 0,
          solicitacoesAprovadas: solicitacoesAprovadas || 0,
          taxaConversao,
          taxaAprovacao,
          scoreRelevancia: Math.min(scoreRelevancia, 100),
          ultimaAtividade,
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
