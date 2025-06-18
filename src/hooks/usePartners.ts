
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: string;
  nome: string;
  tipo: string;
  status: boolean;
  descricao?: string;
  created_at: string;
}

export const usePartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, tipo, status, descricao, created_at')
        .eq('status', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar parceiros:', error);
        setError('Erro ao carregar parceiros');
        return;
      }

      setPartners(data || []);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro inesperado ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  return {
    partners,
    loading,
    error,
    refreshPartners: loadPartners
  };
};
