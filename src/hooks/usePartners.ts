
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Empresa } from '@/types';

export const usePartners = () => {
  const [partners, setPartners] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('status', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      
      setPartners(data || []);
    } catch (err) {
      console.error('Erro ao carregar parceiros:', err);
      setError('Erro ao carregar lista de parceiros');
    } finally {
      setLoading(false);
    }
  };

  return {
    partners,
    loading,
    error,
    refetch: loadPartners
  };
};
