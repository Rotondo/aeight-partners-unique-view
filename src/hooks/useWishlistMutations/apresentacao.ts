import { supabase } from "@/lib/supabase";
import { WishlistApresentacao } from "@/types";
import { toast } from "@/hooks/use-toast";
import { features } from "@/config/featureFlags";
import { mapPipelineToOpportunityStatus, shouldAutoCreateOpp, toDatabaseStatus } from "@/utils/opportunitySync";

export const useApresentacaoMutations = (
  fetchApresentacoes: () => Promise<void>,
  fetchWishlistItems: () => Promise<void>
) => {
  const addApresentacao = async (
    data: Omit<WishlistApresentacao, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase
        .from("wishlist_apresentacoes")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Apresentação registrada com sucesso",
      });

      await fetchApresentacoes();
    } catch (error) {
      console.error("Erro ao registrar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar apresentação",
        variant: "destructive",
      });
    }
  };

  const updateApresentacao = async (
    id: string,
    data: Partial<WishlistApresentacao>
  ) => {
    try {
      const { error } = await supabase
        .from("wishlist_apresentacoes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Criação automática de Oportunidade (somente se feature estiver ativa)
      if (features.wishlistOpportunitySync.enabled && data.fase_pipeline) {
        const { data: ap, error: apErr } = await supabase
          .from("wishlist_apresentacoes")
          .select("id, wishlist_item_id, created_at, oportunidade_id, fase_pipeline")
          .eq("id", id)
          .single();

        if (!apErr && ap && shouldAutoCreateOpp({
          fase_pipeline: ap.fase_pipeline as any,
          oportunidade_id: (ap as any).oportunidade_id || null,
          created_at: (ap as any).created_at || null,
          start_at: features.wishlistOpportunitySync.startAt || null,
          createOnPresented: features.wishlistOpportunitySync.createOnPresented,
        })) {
          const { data: wlItem, error: wlErr } = await supabase
            .from("wishlist_items")
            .select("id, empresa_interessada_id, empresa_desejada_id")
            .eq("id", (ap as any).wishlist_item_id)
            .single();

          if (!wlErr && wlItem) {
            const { data: userRes } = await supabase.auth.getUser();
            const initialStatus = mapPipelineToOpportunityStatus(ap.fase_pipeline as any);

            const { data: opp, error: oppErr } = await supabase
              .from("oportunidades")
              .insert({
                empresa_origem_id: (wlItem as any).empresa_interessada_id,
                empresa_destino_id: (wlItem as any).empresa_desejada_id,
                status: toDatabaseStatus(initialStatus),
                data_indicacao: new Date().toISOString(),
                nome_lead: "Oportunidade via Wishlist",
                usuario_envio_id: userRes?.user?.id || null,
              })
              .select("id")
              .single();

            if (!oppErr && opp) {
              await supabase
                .from("wishlist_apresentacoes")
                .update({
                  oportunidade_id: (opp as any).id,
                  converteu_oportunidade: true,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", id);

              await supabase
                .from("wishlist_items")
                .update({ status: "convertido", updated_at: new Date().toISOString() })
                .eq("id", (ap as any).wishlist_item_id);

              toast({
                title: "Oportunidade criada",
                description: "Oportunidade vinculada à apresentação",
              });
            }
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "Apresentação atualizada com sucesso",
      });

      await Promise.all([fetchApresentacoes(), fetchWishlistItems()]);
    } catch (error) {
      console.error("Erro ao atualizar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar apresentação",
        variant: "destructive",
      });
    }
  };

  const convertToOportunidade = async (
    itemId: string,
    oportunidadeData: any
  ) => {
    try {
      const { data: oportunidade, error: oportunidadeError } = await supabase
        .from("oportunidades")
        .insert([oportunidadeData])
        .select()
        .single();

      if (oportunidadeError) throw oportunidadeError;

      const { error: wishlistError } = await supabase
        .from("wishlist_items")
        .update({
          status: "convertido",
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (wishlistError) throw wishlistError;

      toast({
        title: "Sucesso",
        description: "Item convertido para oportunidade com sucesso",
      });

      await Promise.all([fetchWishlistItems(), fetchApresentacoes()]);
    } catch (error) {
      console.error("Erro ao converter para oportunidade:", error);
      toast({
        title: "Erro",
        description: "Erro ao converter para oportunidade",
        variant: "destructive",
      });
      throw error;
    }
  };

  const solicitarApresentacao = async ({
    empresa_cliente_id,
    empresa_proprietaria_id,
    relacionamento_id,
    observacoes,
  }: {
    empresa_cliente_id: string;
    empresa_proprietaria_id: string;
    relacionamento_id: string;
    observacoes?: string;
  }): Promise<void> => {
    try {
      // Primeiro, verificar se já existe um wishlist_item para essa combinação
      const { data: existingWishlistItem } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("empresa_desejada_id", empresa_cliente_id)
        .eq("empresa_proprietaria_id", empresa_proprietaria_id)
        .eq("status", "pendente")
        .maybeSingle();

      let wishlistItemId = existingWishlistItem?.id;

      // Se não existe, criar um novo wishlist_item
      if (!wishlistItemId) {
        const { data: newWishlistItem, error: wishlistError } = await supabase
          .from("wishlist_items")
          .insert({
            empresa_interessada_id: empresa_proprietaria_id, // Quem quer a apresentação
            empresa_desejada_id: empresa_cliente_id, // Cliente que queremos conhecer
            empresa_proprietaria_id: empresa_proprietaria_id, // Quem pode fazer a apresentação
            motivo: "Solicitação de apresentação via base de clientes",
            observacoes: observacoes || null,
            status: "pendente",
            data_solicitacao: new Date().toISOString(),
            prioridade: 3
          })
          .select("id")
          .single();

        if (wishlistError) throw wishlistError;
        wishlistItemId = newWishlistItem.id;
      }

      // Agora criar a apresentação como solicitação
      const { error: apresentacaoError } = await supabase
        .from("wishlist_apresentacoes")
        .insert({
          wishlist_item_id: wishlistItemId,
          empresa_facilitadora_id: empresa_proprietaria_id,
          data_apresentacao: new Date().toISOString(),
          tipo_apresentacao: 'reuniao',
          status_apresentacao: 'pendente',
          tipo_solicitacao: 'solicitacao',
          converteu_oportunidade: false,
          feedback: observacoes || null
        });
      
      if (apresentacaoError) throw apresentacaoError;
      
      toast({
        title: "Solicitação enviada",
        description: "Solicitação de apresentação criada com sucesso",
      });
      
      await Promise.all([fetchApresentacoes(), fetchWishlistItems()]);
    } catch (error) {
      console.error("Erro ao solicitar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar apresentação. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    addApresentacao,
    updateApresentacao,
    convertToOportunidade,
    solicitarApresentacao,
  };
};
