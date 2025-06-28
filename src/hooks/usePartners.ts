
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
      
      console.log('[usePartners] Iniciando carregamento de parceiros com opções:', options);
      
      // Determinar quais tipos incluir com tipagem explícita
      const allowedTypes: ('parceiro' | 'intragrupo')[] = options.includeIntragroup 
        ? ['parceiro', 'intragrupo'] 
        : ['parceiro'];
      
      console.log('[usePartners] Tipos permitidos:', allowedTypes);
      
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nome, tipo, status, descricao, created_at')
        .in('tipo', allowedTypes)
        .eq('status', true)
        .order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar parceiros:', error);
        setError('Erro ao carregar parceiros');
        setLoading(false);
        return;
      }

      console.log('[usePartners] Dados recebidos do Supabase:', data);

      // Ensure all fields are present first
      const partnersWithDefaults = (data || []).map(partner => ({
        ...partner,
        descricao: partner.descricao || '',
        created_at: partner.created_at || new Date().toISOString()
      }));

      console.log('[usePartners] Parceiros com defaults:', partnersWithDefaults);

      // Se showAllPartners está ativo, vamos simplesmente usar os dados diretamente
      // sem chamar getActiveExternalPartners que pode estar causando problemas
      let filteredData = partnersWithDefaults;
      
      if (options.showAllPartners) {
        console.log('[usePartners] Modo showAllPartners ativo, usando todos os parceiros');
      }

      console.log('[usePartners] Dados finais:', filteredData);

      setPartners(filteredData);
    } catch (err) {
      console.error('Erro no usePartners:', err);
      setError('Erro inesperado ao carregar parceiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[usePartners] useEffect executado');
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
