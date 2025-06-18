
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
}

export const usePartners = (options: UsePartnersOptions = {}) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determinar quais tipos incluir
      const allowedTypes = options.includeIntragroup 
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

      // Log para debug - remover depois da validação
      console.log('[usePartners] Carregando parceiros:', {
        allowedTypes,
        total: data?.length || 0,
        includeIntragroup: options.includeIntragroup
      });

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
  }, [options.includeIntragroup]);

  return {
    partners,
    loading,
    error,
    refreshPartners: loadPartners
  };
};

// Hook específico para casos que precisam de intragrupo + parceiro
export const usePartnersAndIntragroup = () => {
  return usePartners({ includeIntragroup: true });
};
