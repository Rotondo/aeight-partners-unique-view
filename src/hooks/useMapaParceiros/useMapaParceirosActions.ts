
import { supabase } from '@/integrations/supabase/client';
import { ParceiroMapa } from '@/types/mapa-parceiros';
import { toast } from '@/hooks/use-toast';

export const useMapaParceirosActions = (
  setParceiros: React.Dispatch<React.SetStateAction<ParceiroMapa[]>>,
  carregarAssociacoes: () => Promise<void>
) => {
  // Criar parceiro
  const criarParceiro = async (dadosParceiro: Partial<ParceiroMapa>) => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .insert(dadosParceiro as any)
        .select()
        .single();
      
      if (error) throw error;
      
      setParceiros(prev => [...prev, data as ParceiroMapa]);
      toast({
        title: "Sucesso",
        description: "Parceiro criado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Atualizar parceiro
  const atualizarParceiro = async (id: string, dadosParceiro: Partial<ParceiroMapa>) => {
    try {
      const { data, error } = await supabase
        .from('parceiros_mapa')
        .update(dadosParceiro)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setParceiros(prev => prev.map(p => p.id === id ? data as ParceiroMapa : p));
      toast({
        title: "Sucesso",
        description: "Parceiro atualizado com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Deletar parceiro
  const deletarParceiro = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parceiros_mapa')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setParceiros(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Parceiro removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o parceiro.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Associar parceiro a etapa/subnível
  const associarParceiroEtapa = async (parceiroId: string, etapaId: string, subnivelId?: string) => {
    try {
      const { data, error } = await supabase
        .from('associacoes_parceiro_etapa')
        .insert([{
          parceiro_id: parceiroId,
          etapa_id: etapaId,
          subnivel_id: subnivelId
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await carregarAssociacoes();
      toast({
        title: "Sucesso",
        description: "Parceiro associado à etapa com sucesso.",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao associar parceiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível associar o parceiro à etapa.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Remover associação
  const removerAssociacao = async (associacaoId: string, setAssociacoes: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const { error } = await supabase
        .from('associacoes_parceiro_etapa')
        .delete()
        .eq('id', associacaoId);
      
      if (error) throw error;
      
      setAssociacoes(prev => prev.filter(a => a.id !== associacaoId));
      toast({
        title: "Sucesso",
        description: "Associação removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover associação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a associação.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    criarParceiro,
    atualizarParceiro,
    deletarParceiro,
    associarParceiroEtapa,
    removerAssociacao
  };
};
