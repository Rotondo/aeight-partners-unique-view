import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClienteEtapaFornecedor } from '@/types/cliente-fishbone';

export const useClienteFishboneActions = (refetch: () => void) => {
  const { toast } = useToast();

  // Adicionar mapeamento
  const adicionarMapeamento = async (
    dadosMapeamento: Omit<ClienteEtapaFornecedor, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { error } = await supabase
        .from('cliente_etapa_fornecedores')
        .insert(dadosMapeamento);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor adicionado à etapa"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao adicionar mapeamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o fornecedor",
        variant: "destructive"
      });
    }
  };

  // Remover mapeamento
  const removerMapeamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cliente_etapa_fornecedores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor removido da etapa"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao remover mapeamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o fornecedor",
        variant: "destructive"
      });
    }
  };

  // Atualizar mapeamento
  const atualizarMapeamento = async (
    id: string, 
    dadosMapeamento: Partial<ClienteEtapaFornecedor>
  ) => {
    try {
      const { error } = await supabase
        .from('cliente_etapa_fornecedores')
        .update({
          ...dadosMapeamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Mapeamento atualizado"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao atualizar mapeamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o mapeamento",
        variant: "destructive"
      });
    }
  };

  // Promover fornecedor para parceiro
  const promoverParaParceiro = async (empresaId: string) => {
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ tipo: 'parceiro' })
        .eq('id', empresaId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Empresa promovida para parceiro"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao promover empresa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível promover a empresa",
        variant: "destructive"
      });
    }
  };

  // Mover fornecedor entre etapas
  const moverFornecedor = async (
    mapeamentoId: string,
    novaEtapaId: string,
    novoSubnivelId?: string
  ) => {
    try {
      const { error } = await supabase
        .from('cliente_etapa_fornecedores')
        .update({
          etapa_id: novaEtapaId,
          subnivel_id: novoSubnivelId,
          updated_at: new Date().toISOString()
        })
        .eq('id', mapeamentoId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Fornecedor movido para nova etapa"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao mover fornecedor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o fornecedor",
        variant: "destructive"
      });
    }
  };

  return {
    adicionarMapeamento,
    removerMapeamento,
    atualizarMapeamento,
    promoverParaParceiro,
    moverFornecedor
  };
};