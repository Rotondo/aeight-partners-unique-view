
import { supabase } from "@/lib/supabase";
import {
  EmpresaCliente,
  WishlistItem,
  WishlistApresentacao,
} from "@/types";
import { toast } from "@/hooks/use-toast";

export const useWishlistMutations = (
  fetchEmpresasClientes: () => Promise<void>,
  fetchWishlistItems: () => Promise<void>,
  fetchApresentacoes: () => Promise<void>
) => {
  // Empresa Cliente CRUD
  const addEmpresaCliente = async (
    data: Omit<EmpresaCliente, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const { error } = await supabase
        .from("empresa_clientes")
        .insert([data]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa cliente adicionada com sucesso",
      });

      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao adicionar empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar empresa cliente",
        variant: "destructive",
      });
    }
  };

  const updateEmpresaCliente = async (
    id: string,
    data: Partial<EmpresaCliente>
  ) => {
    try {
      const { error } = await supabase
        .from("empresa_clientes")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa cliente atualizada com sucesso",
      });

      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao atualizar empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa cliente",
        variant: "destructive",
      });
    }
  };

  const deleteEmpresaCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from("empresa_clientes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa cliente removida com sucesso",
      });

      await fetchEmpresasClientes();
    } catch (error) {
      console.error("Erro ao remover empresa cliente:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover empresa cliente",
        variant: "destructive",
      });
    }
  };

  // Wishlist Item CRUD
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

  // Apresentação CRUD
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
      // Primeiro criar a oportunidade
      const { data: oportunidade, error: oportunidadeError } = await supabase
        .from("oportunidades")
        .insert([oportunidadeData])
        .select()
        .single();

      if (oportunidadeError) throw oportunidadeError;

      // Depois atualizar o status do wishlist item
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
    // Empresa Cliente
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
    // Wishlist Item
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    // Apresentação
    addApresentacao,
    updateApresentacao,
    convertToOportunidade,
    solicitarApresentacao,
  };
};
