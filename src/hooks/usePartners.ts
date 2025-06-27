
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getActiveExternalPartners } from '@/utils/companyClassification';

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
  // New option to show all partners regardless of client relationships
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
      
      // Determinar quais tipos incluir com tipagem explícita
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

      // Apply company classification filtering if needed
      let filteredData = data || [];
      if (options.showAllPartners) {
        // Show all active external partners regardless of client relationships
        filteredData = getActiveExternalPartners(data || []);
      }

      // Log para debug - remover depois da validação
      console.log('[usePartners] Carregando parceiros:', {
        allowedTypes,
        total: data?.length || 0,
        filtered: filteredData.length,
        includeIntragroup: options.includeIntragroup,
        showAllPartners: options.showAllPartners
      });

      setPartners(filteredData);
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro inesperado ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.includeIntragroup, options.showAllPartners]);

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

// Hook específico para Modo Apresentação - mostra todos os parceiros ativos
export const useAllActivePartners = () => {
  return usePartners({ includeIntragroup: true, showAllPartners: true });
};
