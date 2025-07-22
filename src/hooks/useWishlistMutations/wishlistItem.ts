
import { supabase } from "@/lib/supabase";
import { WishlistItem } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useWishlistItemMutations = (
  fetchWishlistItems: () => Promise<void>
) => {
  const addWishlistItem = async (
    data: Omit<WishlistItem, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item adicionado à wishlist com sucesso",
      });

      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao adicionar item à wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar item à wishlist",
        variant: "destructive",
      });
    }
  };

  const updateWishlistItem = async (
    id: string,
    data: Partial<WishlistItem>
  ) => {
    try {
      // Se o status está sendo alterado para "aprovado", criar apresentação automaticamente
      const shouldCreateApresentacao = data.status === "aprovado";
      
      if (shouldCreateApresentacao) {
        // Buscar o item atual para obter os dados necessários
        const { data: currentItem, error: fetchError } = await supabase
          .from("wishlist_items")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        // Verificar se já existe uma apresentação para este item
        const { data: existingApresentacao } = await supabase
          .from("wishlist_apresentacoes")
          .select("id")
          .eq("wishlist_item_id", id)
          .maybeSingle();

        // Só criar apresentação se não existir uma
        if (!existingApresentacao && currentItem) {
          const { error: apresentacaoError } = await supabase
            .from("wishlist_apresentacoes")
            .insert({
              wishlist_item_id: id,
              empresa_facilitadora_id: currentItem.empresa_proprietaria_id,
              data_apresentacao: new Date().toISOString(),
              tipo_apresentacao: 'reuniao',
              status_apresentacao: 'pendente',
              fase_pipeline: 'aprovado',
              converteu_oportunidade: false,
            });

          if (apresentacaoError) {
            console.error("Erro ao criar apresentação:", apresentacaoError);
            toast({
              title: "Aviso",
              description: "Item aprovado, mas houve erro ao criar a apresentação automática",
              variant: "destructive",
            });
          } else {
            console.log("Apresentação criada automaticamente para item aprovado");
          }
        }
      }

      const { error } = await supabase
        .from("wishlist_items")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item da wishlist atualizado com sucesso",
      });

      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao atualizar item da wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item da wishlist",
        variant: "destructive",
      });
    }
  };

  const deleteWishlistItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item removido da wishlist com sucesso",
      });

      await fetchWishlistItems();
    } catch (error) {
      console.error("Erro ao remover item da wishlist:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover item da wishlist",
        variant: "destructive",
      });
    }
  };

  return {
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
  };
};
