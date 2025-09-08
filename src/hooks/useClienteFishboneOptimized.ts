import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapeamentoAgrupado, MapeamentoFornecedor, ClienteOption } from '@/types/cliente-fishbone';
import { EtapaJornada } from '@/types/mapa-parceiros';
import { Empresa } from '@/types/empresa';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  set(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1
    };

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Remove least recently used item
      const lruKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.accessCount - b.accessCount)[0][0];
      this.cache.delete(lruKey);
    }

    this.cache.set(key, entry);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    // Update access count
    entry.accessCount++;
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global cache instances
const clientesCache = new LRUCache<ClienteOption[]>();
const etapasCache = new LRUCache<EtapaJornada[]>();
const mapeamentosCache = new LRUCache<MapeamentoFornecedor[]>();

/**
 * Hook otimizado para gestão da visualização Fishbone com cache inteligente,
 * debouncing e carregamento incremental
 */
export const useClienteFishboneOptimized = (filtros: { clienteIds?: string[] }) => {
  const [etapas, setEtapas] = useState<EtapaJornada[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoFornecedor[]>([]);
  const [cliente, setCliente] = useState<Empresa | null>(null);
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  
  // Granular loading states
  const [loadingEstrutura, setLoadingEstrutura] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDadosCliente, setLoadingDadosCliente] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState({ hits: 0, misses: 0 });

  // Refs for debouncing and request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combined loading state
  const loading = loadingEstrutura || loadingClientes || loadingDadosCliente;

  /**
   * Enhanced retry logic with exponential backoff and circuit breaker pattern
   */
  const retryWithBackoff = async <T>(
    operation: (signal?: AbortSignal) => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    let delay = baseDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        return await operation(abortControllerRef.current.signal);
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if request was aborted
        if (error.name === 'AbortError') {
          throw error;
        }
        
        console.warn(`[useClienteFishboneOptimized] Tentativa ${attempt}/${maxRetries} falhou:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  };

  /**
   * Fetch estrutura da jornada com cache inteligente
   */
  const fetchEstruturaJornada = useCallback(async () => {
    const cacheKey = 'estrutura-jornada';
    const cachedData = etapasCache.get(cacheKey);
    
    if (cachedData) {
      setEtapas(cachedData);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return;
    }

    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    setLoadingEstrutura(true);
    setError(null);

    try {
      const data = await retryWithBackoff(async (signal) => {
        const { data: etapasData, error } = await supabase
          .from('etapas_jornada')
          .select(`
            *,
            subniveis:subniveis_etapa(*)
          `)
          .eq('ativo', true)
          .order('ordem')
          .abortSignal(signal);

        if (error) throw error;
        return etapasData || [];
      });

      setEtapas(data);
      etapasCache.set(cacheKey, data);
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[useClienteFishboneOptimized] Erro ao carregar estrutura:', error);
        setError('Erro ao carregar estrutura da jornada');
      }
    } finally {
      setLoadingEstrutura(false);
    }
  }, []);

  /**
   * Fetch clientes com cache e paginação
   */
  const fetchClientes = useCallback(async (page: number = 0, limit: number = 100) => {
    const cacheKey = `clientes-${page}-${limit}`;
    const cachedData = clientesCache.get(cacheKey);
    
    if (cachedData) {
      setClientes(prev => page === 0 ? cachedData : [...prev, ...cachedData]);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return;
    }

    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    setLoadingClientes(true);
    setError(null);

    try {
      const data = await retryWithBackoff(async (signal) => {
        const { data: rels, error } = await supabase
          .from("empresa_clientes")
          .select(`
            empresa_cliente:empresas!empresa_clientes_empresa_cliente_id_fkey(
              id, nome, descricao, tipo, status, logo_url
            ),
            empresa_proprietaria:empresas!empresa_clientes_empresa_proprietaria_id_fkey(
              id, nome, tipo
            )
          `)
          .eq("status", true)
          .eq("empresa_cliente.status", true)
          .range(page * limit, (page + 1) * limit - 1)
          .abortSignal(signal);

        if (error) throw error;

        return (rels || [])
          .map((rel: any) =>
            rel.empresa_cliente && rel.empresa_proprietaria
              ? {
                  id: rel.empresa_cliente.id,
                  nome: rel.empresa_cliente.nome,
                  tipo: rel.empresa_cliente.tipo,
                  descricao: rel.empresa_cliente.descricao,
                  logo_url: rel.empresa_cliente.logo_url,
                  status: rel.empresa_cliente.status,
                  empresa_proprietaria: {
                    id: rel.empresa_proprietaria.id,
                    nome: rel.empresa_proprietaria.nome,
                    tipo: rel.empresa_proprietaria.tipo,
                  },
                }
              : null
          )
          .filter(Boolean);
      });

      setClientes(prev => page === 0 ? data : [...prev, ...data]);
      clientesCache.set(cacheKey, data);
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[useClienteFishboneOptimized] Erro ao carregar clientes:', error);
        setError('Erro ao carregar lista de clientes');
      }
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  /**
   * Fetch dados do cliente específico com cache
   */
  const fetchDadosCliente = useCallback(async (clienteId: string) => {
    const cacheKey = `cliente-${clienteId}`;
    const cachedMapeamentos = mapeamentosCache.get(cacheKey);
    
    if (cachedMapeamentos) {
      setMapeamentos(cachedMapeamentos);
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return;
    }

    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    setLoadingDadosCliente(true);
    setError(null);

    try {
      // Load client data and mappings in parallel
      const [clienteData, mapeamentosData] = await Promise.all([
        retryWithBackoff(async (signal) => {
          const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', clienteId)
            .single()
            .abortSignal(signal);
          
          if (error) throw error;
          return data;
        }),
        retryWithBackoff(async (signal) => {
          const { data, error } = await supabase
            .from('cliente_etapa_fornecedores')
            .select(`
              *,
              empresa_fornecedora:empresas!cliente_etapa_fornecedores_empresa_fornecedora_id_fkey(*)
            `)
            .eq('cliente_id', clienteId)
            .eq('ativo', true)
            .abortSignal(signal);
          
          if (error) throw error;
          return data || [];
        })
      ]);

      setCliente(clienteData);
      setMapeamentos(mapeamentosData);
      mapeamentosCache.set(cacheKey, mapeamentosData);
      
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[useClienteFishboneOptimized] Erro ao carregar dados do cliente:', error);
        setError('Erro ao carregar dados do cliente');
      }
    } finally {
      setLoadingDadosCliente(false);
    }
  }, []);

  /**
   * Debounced data loading
   */
  const debouncedLoadData = useCallback((clienteIds?: string[]) => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    loadTimeoutRef.current = setTimeout(() => {
      if (clienteIds && clienteIds.length > 0) {
        clienteIds.forEach(id => fetchDadosCliente(id));
      }
    }, 300);
  }, [fetchDadosCliente]);

  /**
   * Memoized grouped mappings for performance
   */
  const mapeamentoAgrupado = useMemo((): MapeamentoAgrupado[] => {
    if (!etapas.length || !mapeamentos.length) return [];

    return etapas.map(etapa => {
      const mapeamentosEtapa = mapeamentos.filter(m => m.etapa_id === etapa.id);
      
      const subniveis = (etapa.subniveis || []).map(subnivel => ({
        subnivel,
        fornecedores: mapeamentosEtapa.filter(m => m.subnivel_id === subnivel.id)
      }));

      const fornecedoresSemSubnivel = mapeamentosEtapa.filter(m => !m.subnivel_id);

      return {
        etapa,
        subniveis,
        fornecedoresSemSubnivel
      };
    });
  }, [etapas, mapeamentos]);

  /**
   * Performance metrics
   */
  const performanceStats = useMemo(() => ({
    totalEtapas: etapas.length,
    totalMapeamentos: mapeamentos.length,
    cacheHitRate: cacheStats.hits / Math.max(cacheStats.hits + cacheStats.misses, 1),
    lastUpdate: Date.now()
  }), [etapas.length, mapeamentos.length, cacheStats]);

  // Initialize data loading
  useEffect(() => {
    fetchEstruturaJornada();
    fetchClientes(0, 100); // Load first page
  }, [fetchEstruturaJornada, fetchClientes]);

  // Load client-specific data when filtros change
  useEffect(() => {
    if (filtros.clienteIds) {
      debouncedLoadData(filtros.clienteIds);
    }
  }, [filtros.clienteIds, debouncedLoadData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Manual cache refresh
   */
  const refreshCache = useCallback(() => {
    clientesCache.clear();
    etapasCache.clear();
    mapeamentosCache.clear();
    setCacheStats({ hits: 0, misses: 0 });
    
    fetchEstruturaJornada();
    fetchClientes(0, 100);
    if (filtros.clienteIds) {
      filtros.clienteIds.forEach(id => fetchDadosCliente(id));
    }
  }, [fetchEstruturaJornada, fetchClientes, fetchDadosCliente, filtros.clienteIds]);

  /**
   * Load more clients (pagination)
   */
  const loadMoreClientes = useCallback((page: number) => {
    fetchClientes(page, 100);
  }, [fetchClientes]);

  return {
    // Data
    etapas,
    mapeamentos,
    cliente,
    clientes,
    mapeamentoAgrupado,
    
    // Loading states
    loading,
    loadingEstrutura,
    loadingClientes,
    loadingDadosCliente,
    
    // Error handling
    error,
    
    // Actions
    fetchDadosCliente,
    refreshCache,
    loadMoreClientes,
    
    // Performance metrics
    performanceStats,
    cacheStats
  };
};