
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
