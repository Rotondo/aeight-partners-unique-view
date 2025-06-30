
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

interface UsePartnersOptions {
  includeIntragroup?: boolean;
  showAllPartners?: boolean;
}

export const usePartners = (options: UsePartnersOptions = {}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allowedTypes: ('parceiro' | 'intragrupo')[] = options.includeIntragroup 
        ? ['parceiro', 'intragrupo'] 
        : ['parceiro'];
      
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, tipo, status, descricao, created_at')
        .in('tipo', allowedTypes)
        .eq('status', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar parceiros:', error);
        setError('Erro ao carregar parceiros');
        return;
      }

      const partnersWithDefaults = (data || []).map(partner => ({
        ...partner,
        descricao: partner.descricao || '',
        created_at: partner.created_at || new Date().toISOString()
      }));

      setPartners(partnersWithDefaults);
    } catch (err) {
      console.error('Erro no usePartners:', err);
      setError('Erro inesperado ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [options.includeIntragroup, options.showAllPartners]);

  return {
    partners,
    loading,
    error,
    refreshPartners: loadPartners
  };
};

export const usePartnersAndIntragroup = () => {
  return usePartners({ includeIntragroup: true });
};

export const useAllActivePartners = () => {
  return usePartners({ includeIntragroup: true, showAllPartners: true });
};
