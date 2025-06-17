
import { supabase } from "@/lib/supabase";
import { WishlistApresentacao } from "@/types";
import { toast } from "@/hooks/use-toast";

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

      toast({
        title: "Sucesso",
        description: "Apresentação atualizada com sucesso",
      });

      await fetchApresentacoes();
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
      const { error } = await supabase.from("wishlist_apresentacoes").insert({
        empresa_facilitadora_id: empresa_proprietaria_id,
        wishlist_item_id: relacionamento_id,
        data_apresentacao: new Date().toISOString(),
        tipo_apresentacao: 'reuniao',
        status_apresentacao: 'pendente',
        converteu_oportunidade: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        feedback: observacoes || null
      });
      
      if (error) throw error;
      
      toast({
        title: "Solicitação enviada",
        description: "Apresentação solicitada com sucesso",
      });
      
      await fetchApresentacoes();
    } catch (error) {
      console.error("Erro ao solicitar apresentação:", error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar apresentação",
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
