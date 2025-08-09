import { supabase } from "@/lib/supabase";
import { PipelineFase, StatusOportunidade } from "@/types/common";
import { toDatabaseStatus, mapPipelineToOpportunityStatus, deriveOrigemEDestino } from "@/utils/opportunitySync";

const CONSOLE_PREFIX = "[OportunidadesService]";

type WishlistItemLite = {
  id: string;
  empresa_interessada_id: string;
  empresa_desejada_id: string;
  empresa_proprietaria_id?: string | null;
};

export async function createOpportunityFromApresentacao(args: {
  apresentacaoId: string;
  wishlistItem: WishlistItemLite;
  fase_pipeline: PipelineFase;
  tipo_solicitacao?: "solicitacao" | "oferta" | null;
  userId?: string | null;
}): Promise<{ id: string } | null> {
  const { apresentacaoId, wishlistItem, fase_pipeline, tipo_solicitacao, userId } = args;

  try {
    const initialStatus: StatusOportunidade = mapPipelineToOpportunityStatus(fase_pipeline);
    const { origemId, destinoId } = deriveOrigemEDestino(wishlistItem as any, tipo_solicitacao || null);

    const { data: opp, error: oppErr } = await supabase
      .from("oportunidades")
      .insert({
        empresa_origem_id: origemId,
        empresa_destino_id: destinoId,
        status: toDatabaseStatus(initialStatus),
        data_indicacao: new Date().toISOString(),
        nome_lead: "Oportunidade via Wishlist",
        usuario_envio_id: userId || null,
      })
      .select("id")
      .single();

    if (oppErr || !opp?.id) {
      console.error(CONSOLE_PREFIX, "Erro ao criar oportunidade:", oppErr);
      return null;
    }

    // Atualizações paralelas após criar a oportunidade
    await Promise.all([
      supabase
        .from("wishlist_apresentacoes")
        .update({
          oportunidade_id: (opp as any).id,
          converteu_oportunidade: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", apresentacaoId),
      supabase
        .from("wishlist_items")
        .update({ status: "convertido", updated_at: new Date().toISOString() })
        .eq("id", wishlistItem.id),
    ]);

    console.log(CONSOLE_PREFIX, "Oportunidade criada e vinculada:", opp.id);
    return { id: (opp as any).id };
  } catch (e) {
    console.error(CONSOLE_PREFIX, "Falha em createOpportunityFromApresentacao:", e);
    return null;
  }
}

export function normalizeOpportunityInsert<T extends Record<string, any>>(data: T): T {
  const normalized: Record<string, any> = { ...data };
  if (data.status) {
    normalized.status = toDatabaseStatus(data.status as StatusOportunidade);
  }
  return normalized as T;
}
