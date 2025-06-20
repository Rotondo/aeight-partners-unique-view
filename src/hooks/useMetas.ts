
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Meta } from '@/types/metas';

export const useMetas = () => {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMetas = async () => {
    if (!user) {
      setMetas([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('metas_oportunidades')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert Supabase data to Meta interface with proper type assertions
      const metasTyped: Meta[] = (data || []).map(item => ({
        ...item,
        tipo_meta: item.tipo_meta as 'quantidade' | 'valor',
        periodo: item.periodo as 'mensal' | 'trimestral',
        segmento_grupo: item.segmento_grupo as 'intragrupo' | 'de_fora_para_dentro' | 'tudo',
        status_oportunidade: (item.status_oportunidade as 'todas' | 'ganhas') || 'todas'
      }));

      setMetas(metasTyped);
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      setError('Falha ao carregar metas');
      toast({
        title: "Erro",
        description: "Não foi possível carregar as metas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMeta = async (meta: Omit<Meta, 'id' | 'created_at' | 'updated_at' | 'usuario_criador_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('metas_oportunidades')
        .insert({
          ...meta,
          usuario_criador_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!"
      });

      await fetchMetas();
      return data.id;
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a meta.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateMeta = async (id: string, updates: Partial<Meta>) => {
    try {
      const { error } = await supabase
        .from('metas_oportunidades')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta atualizada com sucesso!"
      });

      await fetchMetas();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a meta.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteMeta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('metas_oportunidades')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso!"
      });

      await fetchMetas();
      return true;
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMetas();
  }, [user]);

  return {
    metas,
    isLoading,
    error,
    fetchMetas,
    createMeta,
    updateMeta,
    deleteMeta
  };
};
