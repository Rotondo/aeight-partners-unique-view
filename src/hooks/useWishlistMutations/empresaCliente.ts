
import { supabase } from "@/lib/supabase";
import { EmpresaCliente } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useEmpresaClienteMutations = (fetchEmpresasClientes: () => Promise<void>) => {
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

  return {
    addEmpresaCliente,
    updateEmpresaCliente,
    deleteEmpresaCliente,
  };
};
