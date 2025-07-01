
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { EmpresaCliente, WishlistItem, Apresentacao } from "@/types/wishlist";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface WishlistContextType {
  // Empresa Cliente
  empresasClientes: EmpresaCliente[];
  fetchEmpresasClientes: () => Promise<void>;
  isLoadingEmpresas: boolean;

  // Wishlist Items
  wishlistItems: WishlistItem[];
  fetchWishlistItems: () => Promise<void>;
  isLoadingWishlist: boolean;

  // Apresentações
  apresentacoes: Apresentacao[];
  fetchApresentacoes: () => Promise<void>;
  isLoadingApresentacoes: boolean;

  // Estado geral
  isLoading: boolean;
  error: string | null;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados
  const [empresasClientes, setEmpresasClientes] = useState<EmpresaCliente[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [apresentacoes, setApresentacoes] = useState<Apresentacao[]>([]);
  
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isLoadingApresentacoes, setIsLoadingApresentacoes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  
  // Ref para evitar dupla execução em StrictMode
  const initRef = useRef(false);

  const fetchEmpresasClientes = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando empresas clientes...");
    setIsLoadingEmpresas(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('empresas_clientes')
        .select(`
          *,
          empresa:empresas(id, nome, tipo, status, descricao)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Empresas clientes carregadas:", data?.length || 0);
      setEmpresasClientes(data || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar empresas clientes:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas clientes",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmpresas(false);
    }
  };

  const fetchWishlistItems = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando wishlist items...");
    setIsLoadingWishlist(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          empresa:empresas(id, nome, tipo, status, descricao),
          contato:contatos(id, nome, email, telefone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Wishlist items carregados:", data?.length || 0);
      setWishlistItems(data || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar wishlist items:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar items da wishlist",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const fetchApresentacoes = async () => {
    if (!user) return;
    
    console.log("[WishlistContext] Buscando apresentações...");
    setIsLoadingApresentacoes(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('apresentacoes')
        .select(`
          *,
          empresa_cliente:empresas_clientes(
            id,
            empresa:empresas(id, nome, tipo, status, descricao)
          ),
          wishlist_item:wishlist_items(
            id,
            empresa:empresas(id, nome, tipo, status, descricao),
            contato:contatos(id, nome, email, telefone)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log("[WishlistContext] Apresentações carregadas:", data?.length || 0);
      setApresentacoes(data || []);
    } catch (error) {
      console.error("[WishlistContext] Erro ao buscar apresentações:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast({
        title: "Erro",
        description: "Erro ao carregar apresentações",
        variant: "destructive"
      });
    } finally {
      setIsLoadingApresentacoes(false);
    }
  };

  // Inicialização com proteção contra dupla execução
  useEffect(() => {
    if (!user || initRef.current) return;
    
    initRef.current = true;
    console.log("[WishlistContext] Inicializando contexto para usuário:", user.id);
    
    // Executar todos os fetches em paralelo
    Promise.all([
      fetchEmpresasClientes(),
      fetchWishlistItems(),
      fetchApresentacoes()
    ]).then(() => {
      console.log("[WishlistContext] Inicialização completa");
    });

    return () => {
      initRef.current = false;
    };
  }, [user]);

  const isLoading = isLoadingEmpresas || isLoadingWishlist || isLoadingApresentacoes;

  const value: WishlistContextType = {
    // Empresa Cliente
    empresasClientes,
    fetchEmpresasClientes,
    isLoadingEmpresas,

    // Wishlist Items
    wishlistItems,
    fetchWishlistItems,
    isLoadingWishlist,

    // Apresentações
    apresentacoes,
    fetchApresentacoes,
    isLoadingApresentacoes,

    // Estado geral
    isLoading,
    error
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist deve ser usado dentro de um WishlistProvider");
  }
  return context;
};
